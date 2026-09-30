export interface Student {
  id: string;
  admissionNo: string;
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
  avatarUrl?: string;
  classTeacher: string;
}

export interface SubjectGrade {
  code: string;
  name: string;
  score: number;
  grade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'E';
  points: number;
  teacherRemarks: string;
  department: string;
}

export interface TermReport {
  term: number;
  year: number;
  meanGrade: string;
  totalPoints: number;
  meanScore: number;
  streamRank: number;
  streamTotal: number;
  overallRank: number;
  overallTotal: number;
  subjects: SubjectGrade[];
  classTeacherComment: string;
  principalComment: string;
  closingDate: string;
  openingDate: string;
}

export interface FeeItem {
  id: string;
  voteHead: string;
  approvedMoE: number;
  term1: number;
  term2: number;
  term3: number;
  category: 'Government Capitation' | 'Parent Obligation' | 'Optional Services';
}

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  admissionNo: string;
  studentName: string;
  amount: number;
  paymentMethod: 'M-PESA' | 'Bank Deposit' | 'Credit/Debit Card' | 'Cheque';
  referenceCode: string;
  date: string;
  term: string;
  status: 'Completed' | 'Pending Verification' | 'Failed';
  bankBranch?: string;
  receivedBy: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  category: 'Academics' | 'Exams' | 'Sports & Co-Curricular' | 'Parents & PTA' | 'Holidays & Breaks';
  venue: string;
  description: string;
  highlighted?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'Academic' | 'Administrative' | 'Event' | 'Ministry Notice';
  summary: string;
  content: string;
  author: string;
  isUrgent?: boolean;
}

export interface Book {
  id: string;
  accessionNo: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: 'KICD Set Books' | 'Sciences & STEM' | 'Mathematics' | 'Languages & Humanities' | 'KCSE Revision' | 'General Reference';
  formLevel: string;
  shelfLocation: string;
  coverGradient: string;
  totalCopies: number;
  availableCopies: number;
  status: 'Available' | 'Low Stock' | 'Reserved' | 'On Loan';
  synopsis: string;
  isSetBook?: boolean;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  accessionNo: string;
  studentAdmNo: string;
  studentName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  renewalsCount: number;
  fineAmount: number;
}

export interface BookReservation {
  id: string;
  bookId: string;
  bookTitle: string;
  accessionNo: string;
  studentAdmNo: string;
  studentName: string;
  reservationDate: string;
  pickupSlot: string;
  pickupCounter: string;
  status: 'Ready for Pickup' | 'Collected' | 'Cancelled';
  expiryDate: string;
}

