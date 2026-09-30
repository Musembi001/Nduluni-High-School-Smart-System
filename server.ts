import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './src/server/database.js';
import { mpesaService } from './src/server/mpesa.js';
import { smsService } from './src/server/sms.js';
import { DEMO_USERS, requireRole, registerNewUser, findUserByCredentials } from './src/server/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());

  // ==========================================
  // API ROUTES (RESTful /api/v1/*)
  // ==========================================

  // Authentication & RBAC API
  app.post('/api/v1/auth/register', (req: Request, res: Response) => {
    const { role, name, username, password, phone, email, admissionNo, tscNumber, staffId, department, authorizationKey } = req.body;

    const result = registerNewUser({
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

    const token = `token-${result.user.username}-${Date.now()}`;
    res.status(201).json({
      success: true,
      message: `Account registered successfully as ${result.user.roleTitle}`,
      token,
      user: result.user
    });
  });

  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const cleanUsername = String(username || '').toLowerCase().trim();

    // Check credentials across registered and demo users
    const matchedUser = findUserByCredentials(cleanUsername, String(password || ''));
    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. For quick demo, select a role profile or use password: password123'
      });
    }

    const token = `token-${matchedUser.username}-${Date.now()}`;
    res.json({
      success: true,
      message: `Signed in as ${matchedUser.roleTitle}`,
      token,
      user: matchedUser
    });
  });

  app.get('/api/v1/auth/me', (req: Request, res: Response) => {
    const roleHeader = (req.headers['x-user-role'] as string) || 'STUDENT_PARENT';
    const matched = Object.values(DEMO_USERS).find(u => u.user.role === roleHeader);
    res.json({
      success: true,
      user: matched ? matched.user : DEMO_USERS.parent.user
    });
  });

  // Health check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      school: 'Nduluni High School Portal Backend',
      knecCode: '12314502',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected (ACID JSON Store)',
        mpesaGateway: 'Daraja 2.0 Active (Paybill 522123)',
        smsGateway: 'AfricasTalking Simulator Ready',
        rbac: 'Enforced (Principal, Bursar, Teacher, Student/Parent)'
      }
    });
  });

  // Students API
  app.get('/api/v1/students', (req: Request, res: Response) => {
    const { form, stream, q } = req.query;
    let students = db.getStudents();

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

  app.get('/api/v1/students/:admissionNo', (req: Request, res: Response) => {
    const admissionNo = decodeURIComponent(req.params.admissionNo);
    const student = db.getStudentByAdmission(admissionNo);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student record not found' });
    }

    res.json({ success: true, data: student });
  });

  // Teacher / Registrar Marks Entry (Guarded: TEACHER or PRINCIPAL only)
  app.put('/api/v1/students/:admissionNo/marks', requireRole(['TEACHER', 'PRINCIPAL']), (req: Request, res: Response) => {
    const admissionNo = decodeURIComponent(req.params.admissionNo);
    const { subjectCode, cat1, cat2, endTerm, teacherRemarks } = req.body;

    if (!subjectCode || cat1 === undefined || cat2 === undefined || endTerm === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required mark parameters (subjectCode, cat1, cat2, endTerm)' });
    }

    const updated = db.updateStudentMarks(
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
  app.post('/api/v1/payments/mpesa/stkpush', async (req: Request, res: Response) => {
    try {
      const { phoneNumber, amount, admissionNo } = req.body;

      if (!phoneNumber || !amount || !admissionNo) {
        return res.status(400).json({ success: false, error: 'Missing phoneNumber, amount, or admissionNo' });
      }

      const result = await mpesaService.initiateStkPush({
        phoneNumber: String(phoneNumber),
        amount: Number(amount),
        admissionNo: String(admissionNo)
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('STK Push Error:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
    }
  });

  // M-Pesa Webhook Callback / PIN Confirmation
  app.post('/api/v1/payments/mpesa/callback', async (req: Request, res: Response) => {
    try {
      const { checkoutRequestId, admissionNo, amount, phoneNumber, mpesaReceiptNumber } = req.body;

      const result = await mpesaService.processCallback({
        checkoutRequestId: checkoutRequestId || `ws_CO_${Date.now()}`,
        admissionNo: String(admissionNo),
        amount: Number(amount),
        phoneNumber: String(phoneNumber),
        mpesaReceiptNumber
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
  app.post('/api/v1/payments/bank-deposit', requireRole(['BURSAR', 'PRINCIPAL']), (req: Request, res: Response) => {
    const { admissionNo, amount, bankReference, branch } = req.body;

    const student = db.getStudentByAdmission(admissionNo);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const receiptNo = `NHS-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn = db.addTransaction({
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
    });

    const updatedStudent = db.updateStudentBalance(student.admissionNo, Number(amount));

    res.json({
      success: true,
      message: 'Bank deposit verified and student statement reconciled',
      data: { transaction: newTxn, student: updatedStudent }
    });
  });

  // Transactions Ledger
  app.get('/api/v1/payments/transactions', (req: Request, res: Response) => {
    const { admissionNo } = req.query;
    let txns = db.getTransactions();

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
  app.get('/api/v1/sms/logs', (req: Request, res: Response) => {
    const logs = db.getSmsLogs();
    res.json({ success: true, count: logs.length, data: logs });
  });

  // SMS Broadcast to Guardians (Guarded: PRINCIPAL only)
  app.post('/api/v1/sms/broadcast', requireRole(['PRINCIPAL']), async (req: Request, res: Response) => {
    const { message, targetGroup } = req.body;
    const students = db.getStudents();

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
      db.addSmsLog(record);
      count++;
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

  app.listen(PORT, () => {
    console.log(`[NHS Backend] Server running at http://localhost:${PORT}`);
  });
}

startServer();
