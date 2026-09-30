import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHOOL_SUBJECTS } from '../data/subjects.js';
import { initializePostgresStore, readPostgresStore, writePostgresStore } from './postgresStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StudentRecord {
  id: string;
  admissionNo: string;
  nemisUpi: string;
  fullName: string;
  form: number;
  stream: string;
  house: string;
  enrolledSubjectCodes?: string[];
  guardianName: string;
  guardianPhone: string;
  kcpeMarks: number | null;
  currentTermBalance: number;
  attendanceRate: number | null;
  classTeacher: string;
  subjects: {
    code: string;
    name: string;
    cat1: number;
    cat2: number;
    endTerm: number;
    score: number;
    grade: string;
    points: number;
    teacherRemarks: string;
    department: string;
  }[];
  termSummary: {
    meanGrade: string;
    totalPoints: number;
    meanScore: number;
    streamRank: number;
    streamTotal: number;
    overallRank: number;
    overallTotal: number;
    closingDate: string;
    openingDate: string;
    classTeacherComment: string;
    principalComment: string;
  };
}

export interface PaymentTransactionRecord {
  id: string;
  receiptNo: string;
  admissionNo: string;
  studentName: string;
  amount: number;
  paymentMethod: 'M-PESA' | 'Bank Deposit' | 'Credit/Debit Card';
  referenceCode: string;
  phoneNumber?: string;
  date: string;
  term: string;
  status: 'Completed' | 'Pending Verification' | 'Failed';
  bankBranch?: string;
  receivedBy: string;
  rawCallback?: any;
}

export interface SmsRecord {
  id: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  status: 'DeliveredToTerminal' | 'Sent' | 'Failed';
  cost: string;
  type: 'FEE_RECEIPT' | 'ACADEMIC_ALERT' | 'TERM_NOTICE';
  timestamp: string;
}

const DB_FILE = path.resolve(__dirname, 'data_store.json');
const STORE_KEY = 'school-data';

const EMPTY_DATA: {
  students: StudentRecord[];
  transactions: PaymentTransactionRecord[];
  smsLogs: SmsRecord[];
} = { students: [], transactions: [], smsLogs: [] };

const INITIAL_DATA: {
  students: StudentRecord[];
  transactions: PaymentTransactionRecord[];
  smsLogs: SmsRecord[];
} = {
  students: [
    {
      id: "std-1",
      admissionNo: "NHS/3412/2023",
      nemisUpi: "H892-3412-K",
      fullName: "Brian Mutua Musyoki",
      form: 3,
      stream: "West",
      house: "Kilimanjaro House",
      guardianName: "Patrick Musyoki Ndambuki",
      guardianPhone: "0724891230",
      kcpeMarks: 382,
      currentTermBalance: 14500,
      attendanceRate: 98.4,
      classTeacher: "Mr. Dennis Ochieng (HOD Mathematics)",
      subjects: [
        { code: "101", name: "English Language", cat1: 23, cat2: 24, endTerm: 32, score: 79, grade: "A-", points: 11, teacherRemarks: "Strong essay synthesis and vocabulary.", department: "Languages" },
        { code: "102", name: "Kiswahili Lugha", cat1: 25, cat2: 26, endTerm: 33, score: 84, grade: "A", points: 12, teacherRemarks: "Ubunifu wa hali ya juu katika insha.", department: "Languages" },
        { code: "121", name: "Mathematics Alternative A", cat1: 27, cat2: 26, endTerm: 35, score: 88, grade: "A", points: 12, teacherRemarks: "Superb analytical solving speed.", department: "Mathematics" },
        { code: "231", name: "Biology", cat1: 22, cat2: 23, endTerm: 31, score: 76, grade: "A-", points: 11, teacherRemarks: "Sharp precision in practical sketches.", department: "Sciences" },
        { code: "232", name: "Physics", cat1: 21, cat2: 22, endTerm: 29, score: 72, grade: "B+", points: 10, teacherRemarks: "Solid conceptual grasp of kinematics.", department: "Sciences" },
        { code: "233", name: "Chemistry", cat1: 24, cat2: 25, endTerm: 32, score: 81, grade: "A", points: 12, teacherRemarks: "Exceptional stoichiometry mastery.", department: "Sciences" },
        { code: "311", name: "History and Government", cat1: 24, cat2: 25, endTerm: 33, score: 82, grade: "A", points: 12, teacherRemarks: "Articulate historical analysis.", department: "Humanities" },
        { code: "313", name: "Christian Religious Education", cat1: 23, cat2: 24, endTerm: 31, score: 78, grade: "A-", points: 11, teacherRemarks: "Commendable moral insight.", department: "Humanities" },
        { code: "443", name: "Agriculture", cat1: 26, cat2: 26, endTerm: 34, score: 86, grade: "A", points: 12, teacherRemarks: "Top project performance in crop trial plots.", department: "Technicals" }
      ],
      termSummary: {
        meanGrade: "A-",
        totalPoints: 74,
        meanScore: 78.4,
        streamRank: 3,
        streamTotal: 58,
        overallRank: 12,
        overallTotal: 295,
        closingDate: "10th April 2026",
        openingDate: "4th May 2026",
        classTeacherComment: "Brian is an industrious student with remarkable aptitude in pure sciences and mathematics.",
        principalComment: "Impressive academic consistency. Maintain this trajectory for an assured straight A in the upcoming KCSE series."
      }
    },
    {
      id: "std-2",
      admissionNo: "NHS/3205/2022",
      nemisUpi: "F401-3205-M",
      fullName: "Faith Ndinda Mwanzia",
      form: 4,
      stream: "North",
      house: "Tsavo House",
      guardianName: "Eunice Mwanzia",
      guardianPhone: "0711456789",
      kcpeMarks: 401,
      currentTermBalance: 0,
      attendanceRate: 99.2,
      classTeacher: "Mrs. Caroline Muthoni (HOD Languages)",
      subjects: [
        { code: "101", name: "English Language", cat1: 27, cat2: 28, endTerm: 35, score: 90, grade: "A", points: 12, teacherRemarks: "Exceptional mastery of literature.", department: "Languages" },
        { code: "102", name: "Kiswahili Lugha", cat1: 26, cat2: 27, endTerm: 34, score: 87, grade: "A", points: 12, teacherRemarks: "Fasihi bora kabisa.", department: "Languages" },
        { code: "121", name: "Mathematics Alternative A", cat1: 25, cat2: 26, endTerm: 33, score: 84, grade: "A", points: 12, teacherRemarks: "Quick problem solving.", department: "Mathematics" },
        { code: "231", name: "Biology", cat1: 24, cat2: 25, endTerm: 33, score: 82, grade: "A", points: 12, teacherRemarks: "Detailed biological drawings.", department: "Sciences" },
        { code: "233", name: "Chemistry", cat1: 26, cat2: 25, endTerm: 34, score: 85, grade: "A", points: 12, teacherRemarks: "Superb organic chemistry mastery.", department: "Sciences" },
        { code: "311", name: "History and Government", cat1: 27, cat2: 26, endTerm: 35, score: 88, grade: "A", points: 12, teacherRemarks: "Exemplary critical thinking.", department: "Humanities" },
        { code: "443", name: "Agriculture", cat1: 28, cat2: 27, endTerm: 36, score: 91, grade: "A", points: 12, teacherRemarks: "Mastery of farm power and agronomy.", department: "Technicals" }
      ],
      termSummary: {
        meanGrade: "A",
        totalPoints: 84,
        meanScore: 86.7,
        streamRank: 1,
        streamTotal: 52,
        overallRank: 1,
        overallTotal: 295,
        closingDate: "10th April 2026",
        openingDate: "4th May 2026",
        classTeacherComment: "Faith is exceptionally gifted, disciplined, and an academic beacon in the school.",
        principalComment: "Top candidate nationally. Candidate primed for a national top 100 ranking."
      }
    },
    {
      id: "std-3",
      admissionNo: "NHS/3890/2024",
      nemisUpi: "K368-3890-E",
      fullName: "Emmanuel Kiprono Kosgei",
      form: 2,
      stream: "East",
      house: "Mara House",
      guardianName: "David Kiprono",
      guardianPhone: "0798223344",
      kcpeMarks: 368,
      currentTermBalance: 22000,
      attendanceRate: 95.8,
      classTeacher: "Mr. James Mutunga (HOD Sciences)",
      subjects: [
        { code: "101", name: "English Language", cat1: 20, cat2: 21, endTerm: 27, score: 68, grade: "B-", points: 8, teacherRemarks: "Work on comprehension accuracy.", department: "Languages" },
        { code: "102", name: "Kiswahili Lugha", cat1: 22, cat2: 23, endTerm: 29, score: 74, grade: "B+", points: 10, teacherRemarks: "Maendeleo mazuri sana.", department: "Languages" },
        { code: "121", name: "Mathematics Alternative A", cat1: 23, cat2: 24, endTerm: 31, score: 78, grade: "A-", points: 11, teacherRemarks: "Shows great mathematical intuition.", department: "Mathematics" },
        { code: "231", name: "Biology", cat1: 21, cat2: 21, endTerm: 28, score: 70, grade: "B", points: 9, teacherRemarks: "Consistent lab effort.", department: "Sciences" },
        { code: "233", name: "Chemistry", cat1: 23, cat2: 24, endTerm: 30, score: 77, grade: "A-", points: 11, teacherRemarks: "Very good chemical equation balancing.", department: "Sciences" },
        { code: "313", name: "Christian Religious Education", cat1: 22, cat2: 23, endTerm: 30, score: 75, grade: "A-", points: 11, teacherRemarks: "Well-grounded moral arguments.", department: "Humanities" }
      ],
      termSummary: {
        meanGrade: "B+",
        totalPoints: 60,
        meanScore: 73.6,
        streamRank: 6,
        streamTotal: 60,
        overallRank: 24,
        overallTotal: 310,
        closingDate: "10th April 2026",
        openingDate: "4th May 2026",
        classTeacherComment: "Emmanuel is steady and disciplined. With focused math and language drills, he will achieve an A.",
        principalComment: "Promising form 2 performance. Keep up the high standard."
      }
    }
  ],
  transactions: [
    {
      id: "txn-101",
      receiptNo: "NHS-REC-2026-0891",
      admissionNo: "NHS/3412/2023",
      studentName: "Brian Mutua Musyoki",
      amount: 25000,
      paymentMethod: "M-PESA",
      referenceCode: "TK98XQ821P",
      phoneNumber: "254724891230",
      date: "12 Jan 2026, 09:41 AM",
      term: "Term 1, 2026",
      status: "Completed",
      receivedBy: "Automated M-Pesa Gateway"
    },
    {
      id: "txn-102",
      receiptNo: "NHS-REC-2026-0740",
      admissionNo: "NHS/3205/2022",
      studentName: "Faith Ndinda Mwanzia",
      amount: 39500,
      paymentMethod: "Bank Deposit",
      referenceCode: "COOP-DEP-94182",
      phoneNumber: "254711456789",
      date: "08 Jan 2026, 02:15 PM",
      term: "Term 1, 2026",
      status: "Completed",
      bankBranch: "Co-op Bank Machakos",
      receivedBy: "Senior Bursar (J. Mutua)"
    }
  ],
  smsLogs: [
    {
      id: "sms-1",
      recipientPhone: "+254724891230",
      recipientName: "Patrick Musyoki Ndambuki",
      message: "Confirmed: KES 25,000 received for Brian Mutua (NHS/3412/2023) via M-PESA TK98XQ821P. New Balance: KES 14,500. Receipt: NHS-REC-2026-0891. Nduluni High School.",
      status: "DeliveredToTerminal",
      cost: "KES 0.80",
      type: "FEE_RECEIPT",
      timestamp: "12 Jan 2026, 09:42 AM"
    }
  ]
};

class BackendDatabase {
  private data = process.env.NODE_ENV === 'production' ? structuredClone(EMPTY_DATA) : structuredClone(INITIAL_DATA);

  constructor() {
    if (process.env.NODE_ENV !== 'production') this.load();
  }

  async initialize(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') return;
    await initializePostgresStore();
    const storedData = await readPostgresStore<typeof EMPTY_DATA>(STORE_KEY);
    if (storedData) {
      this.data = storedData;
      return;
    }
    this.data = structuredClone(EMPTY_DATA);
    await writePostgresStore(STORE_KEY, this.data);
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Error reading database file, using in-memory state", e);
    }
  }

  private async save(): Promise<boolean> {
    if (process.env.NODE_ENV === 'production') {
      try {
        await writePostgresStore(STORE_KEY, this.data);
        return true;
      } catch (error) {
        console.error('Unable to persist student data to PostgreSQL:', error);
        return false;
      }
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error("Error saving database file", e);
      return false;
    }
  }

  // Students
  getStudents(): StudentRecord[] {
    return this.data.students;
  }

  getStudentByAdmission(adm: string): StudentRecord | undefined {
    return this.data.students.find(s => s.admissionNo.toLowerCase() === adm.toLowerCase());
  }

  async addStudents(students: StudentRecord[]): Promise<{ added: number; error?: string }> {
    const existingAdmissions = new Set(this.data.students.map(student => student.admissionNo.toLowerCase()));
    const incomingAdmissions = new Set<string>();

    for (const student of students) {
      const admissionNo = student.admissionNo.toLowerCase();
      if (existingAdmissions.has(admissionNo) || incomingAdmissions.has(admissionNo)) {
        return { added: 0, error: `Admission number ${student.admissionNo} already exists.` };
      }
      incomingAdmissions.add(admissionNo);
    }

    const previousData = this.data;
    const previousLength = this.data.students.length;
    this.data.students.push(...students);
    if (!(await this.save())) {
      this.data = previousData;
      this.data.students.splice(previousLength);
      return { added: 0, error: 'The roster could not be saved. No students were imported.' };
    }
    return { added: students.length };
  }

  async updateStudentBalance(admissionNo: string, amountDeducted: number): Promise<StudentRecord | null> {
    const std = this.getStudentByAdmission(admissionNo);
    if (!std) return null;
    const previousBalance = std.currentTermBalance;
    std.currentTermBalance = Math.max(0, std.currentTermBalance - amountDeducted);
    if (!(await this.save())) {
      std.currentTermBalance = previousBalance;
      return null;
    }
    return std;
  }

  async updateStudentMarks(admissionNo: string, subjectCode: string, cat1: number, cat2: number, endTerm: number, teacherRemarks: string): Promise<StudentRecord | null> {
    const std = this.getStudentByAdmission(admissionNo);
    if (!std) return null;
    const previousStudent = structuredClone(std);
    let subj = std.subjects.find(s => s.code === subjectCode);
    if (!subj && std.enrolledSubjectCodes?.includes(subjectCode)) {
      const subject = SCHOOL_SUBJECTS.find(item => item.code === subjectCode);
      if (!subject) return null;
      subj = {
        code: subject.code,
        name: subject.name,
        cat1: 0,
        cat2: 0,
        endTerm: 0,
        score: 0,
        grade: 'Not graded',
        points: 0,
        teacherRemarks: '',
        department: subject.department
      };
      std.subjects.push(subj);
    }
    if (!subj) return null;

    subj.cat1 = cat1;
    subj.cat2 = cat2;
    subj.endTerm = endTerm;
    subj.score = cat1 + cat2 + endTerm; // Total out of 100 (30 + 30 + 40 or similar rubric)
    
    // Grading logic based on Kenyan KCSE standard
    if (subj.score >= 80) { subj.grade = 'A'; subj.points = 12; }
    else if (subj.score >= 75) { subj.grade = 'A-'; subj.points = 11; }
    else if (subj.score >= 70) { subj.grade = 'B+'; subj.points = 10; }
    else if (subj.score >= 65) { subj.grade = 'B'; subj.points = 9; }
    else if (subj.score >= 60) { subj.grade = 'B-'; subj.points = 8; }
    else if (subj.score >= 55) { subj.grade = 'C+'; subj.points = 7; }
    else if (subj.score >= 50) { subj.grade = 'C'; subj.points = 6; }
    else if (subj.score >= 45) { subj.grade = 'C-'; subj.points = 5; }
    else if (subj.score >= 40) { subj.grade = 'D+'; subj.points = 4; }
    else if (subj.score >= 35) { subj.grade = 'D'; subj.points = 3; }
    else if (subj.score >= 30) { subj.grade = 'D-'; subj.points = 2; }
    else { subj.grade = 'E'; subj.points = 1; }

    subj.teacherRemarks = teacherRemarks;

    // Recalculate student mean and points
    const gradedSubjects = std.subjects.filter(subject => subject.grade !== 'Not graded');
    const totalScore = gradedSubjects.reduce((sum, subject) => sum + subject.score, 0);
    const totalPoints = gradedSubjects.reduce((sum, subject) => sum + subject.points, 0);
    const meanScore = gradedSubjects.length ? Number((totalScore / gradedSubjects.length).toFixed(1)) : 0;
    const meanPoints = gradedSubjects.length ? totalPoints / gradedSubjects.length : 0;

    std.termSummary.meanScore = meanScore;
    std.termSummary.totalPoints = totalPoints;

    if (meanPoints >= 11.5) std.termSummary.meanGrade = 'A';
    else if (meanPoints >= 10.5) std.termSummary.meanGrade = 'A-';
    else if (meanPoints >= 9.5) std.termSummary.meanGrade = 'B+';
    else if (meanPoints >= 8.5) std.termSummary.meanGrade = 'B';
    else if (meanPoints >= 7.5) std.termSummary.meanGrade = 'B-';
    else if (meanPoints >= 6.5) std.termSummary.meanGrade = 'C+';
    else if (meanPoints >= 5.5) std.termSummary.meanGrade = 'C';
    else if (meanPoints >= 4.5) std.termSummary.meanGrade = 'C-';
    else if (meanPoints >= 3.5) std.termSummary.meanGrade = 'D+';
    else std.termSummary.meanGrade = 'D';

    if (!(await this.save())) {
      Object.assign(std, previousStudent);
      return null;
    }
    return std;
  }

  // Transactions
  getTransactions(): PaymentTransactionRecord[] {
    return this.data.transactions;
  }

  async addTransaction(txn: PaymentTransactionRecord): Promise<PaymentTransactionRecord | null> {
    this.data.transactions.unshift(txn);
    if (!(await this.save())) {
      this.data.transactions.shift();
      return null;
    }
    return txn;
  }

  async recordBankDeposit(admissionNo: string, amount: number, txn: PaymentTransactionRecord): Promise<{ transaction: PaymentTransactionRecord; student: StudentRecord } | null> {
    const student = this.getStudentByAdmission(admissionNo);
    if (!student) return null;
    const previousBalance = student.currentTermBalance;
    student.currentTermBalance = Math.max(0, previousBalance - amount);
    this.data.transactions.unshift(txn);
    if (!(await this.save())) {
      student.currentTermBalance = previousBalance;
      this.data.transactions.shift();
      return null;
    }
    return { transaction: txn, student };
  }

  // SMS
  getSmsLogs(): SmsRecord[] {
    return this.data.smsLogs;
  }

  async addSmsLog(sms: SmsRecord): Promise<SmsRecord | null> {
    this.data.smsLogs.unshift(sms);
    if (!(await this.save())) {
      this.data.smsLogs.shift();
      return null;
    }
    return sms;
  }

  async addSmsLogs(records: SmsRecord[]): Promise<boolean> {
    if (!records.length) return true;
    this.data.smsLogs.unshift(...records);
    if (!(await this.save())) {
      this.data.smsLogs.splice(0, records.length);
      return false;
    }
    return true;
  }
}

export const db = new BackendDatabase();
