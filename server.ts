import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'node:crypto';
import { db, PaymentTransactionRecord, StudentRecord } from './src/server/database.js';
import { SCHOOL_SUBJECTS } from './src/data/subjects.js';
import { normalizeKenyanMobilePhone } from './src/utils/kenyanPhone.js';
import { mpesaService } from './src/server/mpesa.js';
import { smsService } from './src/server/sms.js';
import {
  createSession,
  getAuthenticatedUser,
  requireAuth,
  requireRole,
  registerNewUser,
  findUserByCredentials,
  hasPendingAccountCredentials,
  getAccountRequests,
  reviewAccountRequest,
  updateAccountProfile,
  revokeSession,
  initializeAuthStore
} from './src/server/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const sessionCookie = (token: string, maxAge = 28800) =>
    `nduluni_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

  // Middleware
  app.use(express.json({ limit: '2mb' }));

  // ==========================================
  // API ROUTES (RESTful /api/v1/*)
  // ==========================================

  // Authentication & RBAC API
  app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
    const { role, name, username, password, phone, email, admissionNo, tscNumber, staffId, department, authorizationKey } = req.body;

    if (role === 'STUDENT_PARENT') {
      const student = db.getStudentByAdmission(String(admissionNo || ''));
      const submittedPhone = phone ? normalizeKenyanMobilePhone(String(phone)) : null;
      const registeredPhone = student ? normalizeKenyanMobilePhone(student.guardianPhone) : null;
      if (!student || !submittedPhone || submittedPhone !== registeredPhone) {
        return res.status(400).json({
          success: false,
          error: 'Admission number and guardian phone must match the school register. Contact the school office if your details need updating.'
        });
      }
    }

    const result = await registerNewUser({
      role,
      name,
      username,
      password,
      phone,
      email,
      admissionNo,
      tscNumber,
      staffId,
      department,
      authorizationKey
    });

    if (!result.success || !result.user) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({
      success: true,
      pending: true,
      message: 'Your account request has been submitted for school verification. You can sign in after it is approved.',
      account: { name: result.user.name, roleTitle: result.user.roleTitle }
    });
  });

  app.get('/api/v1/auth/requests', requireRole(['PRINCIPAL']), (_req: Request, res: Response) => {
    res.json({ success: true, data: getAccountRequests() });
  });

  app.patch('/api/v1/auth/me', requireAuth, async (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req)!;
    const result = await updateAccountProfile(user.id, {
      name: String(req.body.name || ''),
      phone: req.body.phone ? String(req.body.phone) : undefined,
      email: req.body.email ? String(req.body.email) : undefined
    });
    if (!result.success || !result.user) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({ success: true, user: result.user });
  });

  app.post('/api/v1/auth/requests/:id/review', requireRole(['PRINCIPAL']), async (req: Request, res: Response) => {
    const decision = req.body.decision;
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      return res.status(400).json({ success: false, error: 'Choose approve or reject.' });
    }
    if (!(await reviewAccountRequest(req.params.id, decision))) {
      return res.status(404).json({ success: false, error: 'Pending account request not found.' });
    }
    res.json({ success: true });
  });

  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const cleanUsername = String(username || '').toLowerCase().trim();

    // Check credentials across registered and demo users
    const matchedUser = findUserByCredentials(cleanUsername, String(password || ''));
    if (!matchedUser) {
      if (hasPendingAccountCredentials(cleanUsername, String(password || ''))) {
        return res.status(403).json({ success: false, error: 'Your account request is still awaiting school approval.' });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
    }

    const token = createSession(matchedUser);
    res.setHeader('Set-Cookie', sessionCookie(token));
    res.json({
      success: true,
      message: `Signed in as ${matchedUser.roleTitle}`,
      user: matchedUser
    });
  });

  app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
    revokeSession(req);
    res.setHeader('Set-Cookie', sessionCookie('', 0));
    res.json({ success: true });
  });

  app.get('/api/v1/auth/me', requireAuth, (req: Request, res: Response) => {
    res.json({ success: true, user: getAuthenticatedUser(req) });
  });

  // Health check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      school: 'Nduluni High School Portal Backend',
      knecCode: '12314502',
      timestamp: new Date().toISOString(),
      services: {
        database: process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'local JSON demo store',
        mpesaGateway: 'simulator only; live Daraja integration not configured',
        smsGateway: 'simulator only',
        rbac: 'session-backed role checks'
      }
    });
  });

  // Students API
  app.post('/api/v1/students/import', requireRole(['PRINCIPAL']), async (req: Request, res: Response) => {
    const rows = req.body?.students;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Upload at least one student row.' });
    }
    if (rows.length > 2000) {
      return res.status(413).json({ success: false, error: 'Import is limited to 2,000 students per file.' });
    }

    const allowedSubjects = new Set<string>(SCHOOL_SUBJECTS.map(subject => subject.code));
    const seenAdmissions = new Set<string>();
    const rowErrors: string[] = [];
    const students: StudentRecord[] = [];

    rows.forEach((row: any, index: number) => {
      const rowNumber = index + 2;
      const admissionNo = String(row.admissionNo || '').trim().toUpperCase();
      const fullName = String(row.fullName || '').trim();
      const form = Number(row.form);
      const stream = String(row.stream || '').trim();
      const guardianName = String(row.guardianName || '').trim();
      const guardianPhone = String(row.guardianPhone || '').trim();
      const normalizedPhone = normalizeKenyanMobilePhone(guardianPhone);
      const currentTermBalance = Number(row.currentTermBalance);
      const subjectCodes: string[] = Array.isArray(row.subjectCodes)
        ? Array.from(new Set<string>(row.subjectCodes.map((code: unknown) => String(code).trim()).filter(Boolean)))
        : [];
      const errors: string[] = [];

      if (!admissionNo) errors.push('admissionNo is required');
      if (!fullName) errors.push('fullName is required');
      if (!Number.isInteger(form) || form < 1 || form > 4) errors.push('form must be 1, 2, 3, or 4');
      if (!stream) errors.push('stream is required');
      if (!guardianName) errors.push('guardianName is required');
      if (!normalizedPhone) errors.push('guardianPhone must be 9 or 10 digits, e.g. 724891230 or 0724891230');
      if (!Number.isFinite(currentTermBalance) || currentTermBalance < 0) errors.push('currentTermBalance must be zero or more');
      if (subjectCodes.length === 0) errors.push('at least one subjectCode is required');
      if (subjectCodes.some((code: string) => !allowedSubjects.has(code))) errors.push('subjectCodes contains an unknown code');

      const normalizedAdmission = admissionNo.toLowerCase();
      if (normalizedAdmission && seenAdmissions.has(normalizedAdmission)) errors.push('admissionNo is duplicated in this file');
      if (normalizedAdmission) seenAdmissions.add(normalizedAdmission);

      const optionalNumber = (field: string, min: number, max: number): number | null => {
        const rawValue = String(row[field] ?? '').trim();
        if (!rawValue) return null;
        const value = Number(rawValue);
        if (!Number.isFinite(value) || value < min || value > max) {
          errors.push(`${field} must be between ${min} and ${max}`);
          return null;
        }
        return value;
      };

      const kcpeMarks = optionalNumber('kcpeMarks', 0, 500);
      const attendanceRate = optionalNumber('attendanceRate', 0, 100);
      if (errors.length) {
        rowErrors.push(`Row ${rowNumber}: ${errors.join('; ')}`);
        return;
      }

      students.push({
        id: randomUUID(),
        admissionNo,
        nemisUpi: String(row.nemisUpi || '').trim(),
        fullName,
        form,
        stream,
        house: String(row.house || '').trim() || 'Unassigned',
        enrolledSubjectCodes: subjectCodes,
        guardianName,
        guardianPhone: normalizedPhone!,
        kcpeMarks,
        currentTermBalance,
        attendanceRate,
        classTeacher: String(row.classTeacher || '').trim() || 'Unassigned',
        subjects: [],
        termSummary: {
          meanGrade: '—',
          totalPoints: 0,
          meanScore: 0,
          streamRank: 0,
          streamTotal: 0,
          overallRank: 0,
          overallTotal: 0,
          closingDate: '',
          openingDate: '',
          classTeacherComment: '',
          principalComment: ''
        }
      });
    });

    if (rowErrors.length) {
      return res.status(400).json({ success: false, error: 'Correct the listed rows before importing.', errors: rowErrors.slice(0, 40) });
    }

    const result = await db.addStudents(students);
    if (result.error) {
      return res.status(409).json({ success: false, error: result.error });
    }

    return res.status(201).json({ success: true, added: result.added });
  });

  app.get('/api/v1/students', requireAuth, (req: Request, res: Response) => {
    const { form, stream, q } = req.query;
    const user = getAuthenticatedUser(req)!;
    let students = db.getStudents();

    if (user.role === 'STUDENT_PARENT') {
      students = students.filter(student => student.admissionNo === user.admissionNo);
    }

    if (form) {
      students = students.filter(s => s.form === Number(form));
    }
    if (stream) {
      students = students.filter(s => s.stream.toLowerCase() === String(stream).toLowerCase());
    }
    if (q) {
      const query = String(q).toLowerCase();
      students = students.filter(s => 
        s.fullName.toLowerCase().includes(query) || 
        s.admissionNo.toLowerCase().includes(query) ||
        s.nemisUpi.toLowerCase().includes(query)
      );
    }

    res.json({ success: true, count: students.length, data: students });
  });

  app.get('/api/v1/students/:admissionNo', requireAuth, (req: Request, res: Response) => {
    const admissionNo = decodeURIComponent(req.params.admissionNo);
    const user = getAuthenticatedUser(req)!;
    if (user.role === 'STUDENT_PARENT' && user.admissionNo !== admissionNo) {
      return res.status(403).json({ success: false, error: 'You may only view the student linked to your account.' });
    }
    const student = db.getStudentByAdmission(admissionNo);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student record not found' });
    }

    res.json({ success: true, data: student });
  });

  // Teacher / Registrar Marks Entry (Guarded: TEACHER or PRINCIPAL only)
  app.put('/api/v1/students/:admissionNo/marks', requireRole(['TEACHER', 'PRINCIPAL']), async (req: Request, res: Response) => {
    const admissionNo = decodeURIComponent(req.params.admissionNo);
    const { subjectCode, cat1, cat2, endTerm, teacherRemarks } = req.body;

    if (!subjectCode || cat1 === undefined || cat2 === undefined || endTerm === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required mark parameters (subjectCode, cat1, cat2, endTerm)' });
    }

    const scores = [Number(cat1), Number(cat2), Number(endTerm)];
    if (!scores.every(Number.isFinite) || scores[0] < 0 || scores[0] > 30 || scores[1] < 0 || scores[1] > 30 || scores[2] < 0 || scores[2] > 40) {
      return res.status(400).json({ success: false, error: 'Scores must be within CAT 1 /30, CAT 2 /30, and End-Term /40.' });
    }

    const user = getAuthenticatedUser(req)!;
    const student = db.getStudentByAdmission(admissionNo);
    const subject = student?.subjects.find(item => item.code === String(subjectCode)) ||
      (student?.enrolledSubjectCodes?.includes(String(subjectCode))
        ? SCHOOL_SUBJECTS.find(item => item.code === String(subjectCode))
        : undefined);
    if (!student || !subject) {
      return res.status(404).json({ success: false, error: 'Student or subject code not found.' });
    }
    if (user.role === 'TEACHER' && subject.department.toLowerCase() !== user.department?.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'You can only enter marks for your assigned department.' });
    }

    const updated = await db.updateStudentMarks(
      admissionNo,
      subjectCode,
      Number(cat1),
      Number(cat2),
      Number(endTerm),
      teacherRemarks || 'Satisfactory academic progress.'
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student or subject code not found' });
    }

    res.json({
      success: true,
      message: `Marks updated for ${updated.fullName} in subject ${subjectCode}`,
      data: updated
    });
  });

  // M-Pesa STK Push Express
  app.post('/api/v1/payments/mpesa/stkpush', requireRole(['STUDENT_PARENT', 'BURSAR']), async (req: Request, res: Response) => {
    try {
      const { phoneNumber, amount, admissionNo } = req.body;
      const user = getAuthenticatedUser(req)!;

      if (!phoneNumber || !amount || !admissionNo) {
        return res.status(400).json({ success: false, error: 'Missing phoneNumber, amount, or admissionNo' });
      }
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, error: 'Live M-Pesa integration is not configured.' });
      }
      if (user.role === 'STUDENT_PARENT' && user.admissionNo !== String(admissionNo)) {
        return res.status(403).json({ success: false, error: 'You may only pay fees for the student linked to your account.' });
      }
      if (!Number.isSafeInteger(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: 'Payment amount must be a positive whole number.' });
      }

      const result = await mpesaService.initiateStkPush({
        phoneNumber: String(phoneNumber),
        amount: Number(amount),
        admissionNo: String(admissionNo),
        initiatedBy: user.id
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('STK Push Error:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
    }
  });

  // M-Pesa Webhook Callback / PIN Confirmation
  app.post('/api/v1/payments/mpesa/callback', requireRole(['STUDENT_PARENT', 'BURSAR']), async (req: Request, res: Response) => {
    try {
      const { checkoutRequestId, admissionNo, amount, phoneNumber, mpesaReceiptNumber } = req.body;
      const user = getAuthenticatedUser(req)!;
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, error: 'Payment confirmation must come from the configured Daraja callback.' });
      }
      if (user.role === 'STUDENT_PARENT' && user.admissionNo !== String(admissionNo)) {
        return res.status(403).json({ success: false, error: 'You may only confirm payments for the student linked to your account.' });
      }

      const result = await mpesaService.processCallback({
        checkoutRequestId: String(checkoutRequestId || ''),
        admissionNo: String(admissionNo),
        amount: Number(amount),
        phoneNumber: String(phoneNumber || ''),
        mpesaReceiptNumber,
        initiatedBy: user.id
      });

      res.json({
        success: true,
        message: 'Payment received, ledger updated, and SMS receipt dispatched to parent',
        data: result
      });
    } catch (err: any) {
      console.error('Callback Error:', err);
      res.status(400).json({ success: false, error: err.message || 'Payment reconciliation failed' });
    }
  });

  // Bank Deposit Verification (Guarded: BURSAR or PRINCIPAL only)
  app.post('/api/v1/payments/bank-deposit', requireRole(['BURSAR', 'PRINCIPAL']), async (req: Request, res: Response) => {
    const { admissionNo, amount, bankReference, branch } = req.body;

    const student = db.getStudentByAdmission(admissionNo);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const receiptNo = `NHS-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn: PaymentTransactionRecord = {
      id: `txn-${Date.now()}`,
      receiptNo,
      admissionNo: student.admissionNo,
      studentName: student.fullName,
      amount: Number(amount),
      paymentMethod: 'Bank Deposit',
      referenceCode: String(bankReference).toUpperCase(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      term: 'Term 1, 2026',
      status: 'Completed',
      bankBranch: branch || 'Co-op Bank Machakos',
      receivedBy: 'Senior Bursar (J. Mutua)'
    };
    const result = await db.recordBankDeposit(student.admissionNo, Number(amount), newTxn);
    if (!result) return res.status(500).json({ success: false, error: 'Deposit could not be saved to the school ledger.' });

    res.json({
      success: true,
      message: 'Bank deposit verified and student statement reconciled',
      data: result
    });
  });

  // Transactions Ledger
  app.get('/api/v1/payments/transactions', requireRole(['BURSAR', 'STUDENT_PARENT']), (req: Request, res: Response) => {
    const { admissionNo } = req.query;
    const user = getAuthenticatedUser(req)!;
    let txns = db.getTransactions();

    if (user.role === 'STUDENT_PARENT') {
      txns = txns.filter(transaction => transaction.admissionNo === user.admissionNo);
    }

    if (admissionNo) {
      txns = txns.filter(t => t.admissionNo.toLowerCase() === String(admissionNo).toLowerCase());
    }

    const totalCollected = txns.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      count: txns.length,
      totalCollected,
      data: txns
    });
  });

  // SMS Dispatch Logs
  app.get('/api/v1/sms/logs', requireRole(['BURSAR']), (req: Request, res: Response) => {
    const logs = db.getSmsLogs();
    res.json({ success: true, count: logs.length, data: logs });
  });

  // SMS Broadcast to Guardians (Guarded: PRINCIPAL only)
  app.post('/api/v1/sms/broadcast', requireRole(['PRINCIPAL']), async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ success: false, error: 'Live SMS delivery is not configured. No messages were sent.' });
    }
    const { message, targetGroup } = req.body;
    const students = db.getStudents();

    const records = [];
    let count = 0;
    for (const student of students) {
      const record = {
        id: `sms-${Date.now()}-${count}`,
        recipientPhone: student.guardianPhone.startsWith('+') ? student.guardianPhone : `+254${student.guardianPhone.slice(1)}`,
        recipientName: student.guardianName,
        message: `Nduluni High School Announcement: ${message}`,
        status: 'DeliveredToTerminal' as const,
        cost: 'KES 0.80',
        type: 'TERM_NOTICE' as const,
        timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      records.push(record);
      count++;
    }

    if (!(await db.addSmsLogs(records))) {
      return res.status(500).json({ success: false, error: 'Broadcast could not be saved to the school ledger.' });
    }

    res.json({
      success: true,
      message: `Broadcast delivered to ${count} parent terminals`,
      count
    });
  });

  // Direct Project ZIP Stream Endpoint
  app.get('/api/v1/export/project-zip', (req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'public', 'nduluni_high_school_project.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'nduluni_high_school_project.zip');
    } else {
      res.status(404).json({ error: 'Archive not found' });
    }
  });

  // ==========================================
  // FRONTEND INTEGRATION (Vite Middleware in Dev)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  await db.initialize();
  await initializeAuthStore();

  app.listen(PORT, () => {
    console.log(`[NHS Backend] Server running at http://localhost:${PORT}`);
  });
}

startServer();
