import { Student, TermReport, FeeItem, PaymentTransaction, SchoolEvent, Announcement } from '../types';

export const SCHOOL_INFO = {
  name: "Nduluni High School",
  subTitle: "Ministry of Education Accredited Public Extra-County Boarding School",
  knecCode: "12314502",
  nemisCode: "NHS-2004-MCK",
  county: "Machakos County",
  subCounty: "Kaiti / Makueni Border Zone",
  motto: "Strive to Excel through Discipline and Integrity",
  vision: "To be a center of academic brilliance, technological innovation, and sterling character in Kenya.",
  mission: "Empowering every learner through rigorous STEM curriculum, disciplined co-curricular engagements, and moral fortitude.",
  postalAddress: "P.O. Box 48 - 90130, Nduluni, Kenya",
  officeEmail: "admin@ndulunihigh.ac.ke",
  principalEmail: "principal@ndulunihigh.ac.ke",
  helplinePhone: "+254 722 849 201",
  accountsPhone: "+254 733 912 405",
  principalName: "Mrs. Margaret M. Musyoka, OGW",
  principalTitle: "Chief Principal / Secretary to Board of Management",
  foundedYear: 1984,
  studentPopulation: 1180,
  staffCount: 46,
  kcseMeanGrade2025: "8.92 (B+)",
  mpesaPaybill: "522123",
  bankAccount: {
    bankName: "Co-operative Bank of Kenya",
    branch: "Machakos Branch",
    accountNumber: "01129038472900",
    accountName: "Nduluni High School Operational A/C"
  }
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-1",
    admissionNo: "NHS/3412/2023",
    fullName: "Brian Mutua Musyoki",
    form: 3,
    stream: "West",
    house: "Kilimanjaro House",
    guardianName: "Patrick Musyoki Ndambuki",
    guardianPhone: "0724891230",
    kcpeMarks: 382,
    currentTermBalance: 14500,
    attendanceRate: 98.4,
    classTeacher: "Mr. Dennis Ochieng (HOD Mathematics)"
  },
  {
    id: "std-2",
    admissionNo: "NHS/3205/2022",
    fullName: "Faith Ndinda Mwanzia",
    form: 4,
    stream: "North",
    house: "Tsavo House",
    guardianName: "Eunice Mwanzia",
    guardianPhone: "0711456789",
    kcpeMarks: 401,
    currentTermBalance: 0,
    attendanceRate: 99.2,
    classTeacher: "Mrs. Caroline Muthoni (HOD Languages)"
  },
  {
    id: "std-3",
    admissionNo: "NHS/3890/2024",
    fullName: "Emmanuel Kiprono Kosgei",
    form: 2,
    stream: "East",
    house: "Mara House",
    guardianName: "David Kiprono",
    guardianPhone: "0798223344",
    kcpeMarks: 368,
    currentTermBalance: 22000,
    attendanceRate: 95.8,
    classTeacher: "Mr. James Mutunga (HOD Sciences)"
  }
];

export const MOCK_TERM_REPORT: TermReport = {
  term: 1,
  year: 2026,
  meanGrade: "A-",
  totalPoints: 74,
  meanScore: 78.4,
  streamRank: 3,
  streamTotal: 58,
  overallRank: 12,
  overallTotal: 295,
  closingDate: "10th April 2026",
  openingDate: "4th May 2026",
  classTeacherComment: "Brian is an industrious student with remarkable aptitude in pure sciences and mathematics. Exemplary teamwork in the lab.",
  principalComment: "Impressive academic consistency. Maintain this trajectory for an assured straight A in the upcoming KCSE series.",
  subjects: [
    { code: "101", name: "English Language", score: 79, grade: "A-", points: 11, department: "Languages", teacherRemarks: "Strong essay synthesis and vocabulary." },
    { code: "102", name: "Kiswahili Lugha", score: 84, grade: "A", points: 12, department: "Languages", teacherRemarks: "Ubunifu wa hali ya juu katika insha." },
    { code: "121", name: "Mathematics Alternative A", score: 88, grade: "A", points: 12, department: "Mathematics", teacherRemarks: "Superb analytical solving speed." },
    { code: "231", name: "Biology", score: 76, grade: "A-", points: 11, department: "Sciences", teacherRemarks: "Sharp precision in practical sketches." },
    { code: "232", name: "Physics", score: 72, grade: "B+", points: 10, department: "Sciences", teacherRemarks: "Solid conceptual grasp of kinematics." },
    { code: "233", name: "Chemistry", score: 81, grade: "A", points: 12, department: "Sciences", teacherRemarks: "Exceptional stoichiometry mastery." },
    { code: "311", name: "History and Government", score: 82, grade: "A", points: 12, department: "Humanities", teacherRemarks: "Articulate historical analysis." },
    { code: "313", name: "Christian Religious Education", score: 78, grade: "A-", points: 11, department: "Humanities", teacherRemarks: "Commendable moral insight." },
    { code: "443", name: "Agriculture", score: 86, grade: "A", points: 12, department: "Technicals", teacherRemarks: "Top project performance in crop trial plots." }
  ]
};

export const MOCK_FEE_STRUCTURE: FeeItem[] = [
  { id: "v1", voteHead: "Tuition & Teaching Materials (GoK Capitation)", approvedMoE: 22244, term1: 11122, term2: 6673, term3: 4449, category: "Government Capitation" },
  { id: "v2", voteHead: "Boarding Equipment, Stores & Meals", approvedMoE: 35000, term1: 18000, term2: 11000, term3: 6000, category: "Parent Obligation" },
  { id: "v3", voteHead: "Repairs, Maintenance & Improvement (RMI)", approvedMoE: 6500, term1: 3500, term2: 2000, term3: 1000, category: "Parent Obligation" },
  { id: "v4", voteHead: "Local Transport & Travel (School Bus)", approvedMoE: 4000, term1: 2000, term2: 1200, term3: 800, category: "Parent Obligation" },
  { id: "v5", voteHead: "Administrative Expenses & Communication", approvedMoE: 3000, term1: 1500, term2: 900, term3: 600, category: "Parent Obligation" },
  { id: "v6", voteHead: "Electricity, Water & Sanitation (EWS)", approvedMoE: 5500, term1: 2800, term2: 1700, term3: 1000, category: "Parent Obligation" },
  { id: "v7", voteHead: "Activity & Co-Curricular (KSSSA / Music)", approvedMoE: 3200, term1: 1600, term2: 1000, term3: 600, category: "Parent Obligation" },
  { id: "v8", voteHead: "PTA Teachers Motivation & Dev Fund", approvedMoE: 4000, term1: 2000, term2: 1200, term3: 800, category: "Optional Services" }
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "txn-101",
    receiptNo: "NHS-REC-2026-0891",
    admissionNo: "NHS/3412/2023",
    studentName: "Brian Mutua Musyoki",
    amount: 25000,
    paymentMethod: "M-PESA",
    referenceCode: "TK98XQ821P",
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
    date: "08 Jan 2026, 02:15 PM",
    term: "Term 1, 2026",
    status: "Completed",
    bankBranch: "Co-op Bank Machakos",
    receivedBy: "Senior Bursar (J. Mutua)"
  },
  {
    id: "txn-103",
    receiptNo: "NHS-REC-2026-0611",
    admissionNo: "NHS/3890/2024",
    studentName: "Emmanuel Kiprono Kosgei",
    amount: 15000,
    paymentMethod: "M-PESA",
    referenceCode: "TL41BM771A",
    date: "14 Jan 2026, 11:04 AM",
    term: "Term 1, 2026",
    status: "Completed",
    receivedBy: "Automated M-Pesa Gateway"
  }
];

export const SCHOOL_EVENTS: SchoolEvent[] = [
  {
    id: "ev-1",
    title: "Term 1 Mid-Term Exeat & Parents Academic Clinic",
    date: "2026-02-27",
    endDate: "2026-03-02",
    time: "08:30 AM - 03:30 PM",
    category: "Parents & PTA",
    venue: "School Multipurpose Assembly Pavilion",
    description: "One-on-one academic consultation between subject teachers, parents, and students. Distribution of Mid-Term progress dossiers and fee reconciliation.",
    highlighted: true
  },
  {
    id: "ev-2",
    title: "Regional STEM & Robotics Engineering Exhibition",
    date: "2026-03-14",
    time: "09:00 AM - 04:00 PM",
    category: "Sports & Co-Curricular",
    venue: "Nduluni Science Innovation Complex",
    description: "Nduluni hosts 14 secondary schools across Eastern Province showcasing renewable energy prototypes, automated irrigation systems, and software solutions.",
    highlighted: true
  },
  {
    id: "ev-3",
    title: "Form 4 KCSE Joint Mock Series Examination",
    date: "2026-03-23",
    endDate: "2026-04-03",
    time: "08:00 AM - 04:30 PM",
    category: "Exams",
    venue: "Main Examination Hall (KNEC Centre 12314502)",
    description: "Standardized KNEC-formatted assessment in partnership with Machakos-Makueni Academic Consortium to test candidates readiness."
  },
  {
    id: "ev-4",
    title: "Annual Sports Day & Inter-House Athletics Championship",
    date: "2026-04-08",
    time: "08:00 AM - 05:00 PM",
    category: "Sports & Co-Curricular",
    venue: "Nduluni Sports Grounds & Track",
    description: "Thrilling competition among Kilimanjaro, Tsavo, Mara, and Aberdare Houses in track, field, rugby 7s, and football finals."
  },
  {
    id: "ev-5",
    title: "Official Closing of Term 1, 2026",
    date: "2026-04-10",
    time: "07:30 AM - 11:00 AM",
    category: "Holidays & Breaks",
    venue: "All Dormitories & Gate 1 Departure",
    description: "Students release after final general assembly. Boarding students to board coordinated school transit buses to designated regional drop-off points."
  },
  {
    id: "ev-6",
    title: "Term 2 Opening Date & Form 1-4 Reporting",
    date: "2026-05-04",
    time: "07:00 AM - 04:00 PM",
    category: "Academics",
    venue: "Main Administration Block",
    description: "All students to report before 4:00 PM in complete uniform with Term 2 fee payment slips and verified clearance stamps."
  }
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "KCSE 2025 National Results: Nduluni Records Landmark Mean Grade of 8.92 (B+)",
    date: "24 Jan 2026",
    category: "Academic",
    summary: "Over 84% of candidates secure direct university entry to top state universities including UoN, KU, Kisii, and JKUAT.",
    content: "The Board of Management, Principal, and staff celebrate our class of 2025. With 18 straight A grades and 46 A- candidates, Nduluni High School remains among the leading institutions in Eastern Kenya. Congratulations to our teachers, students, and committed parents.",
    author: "Chief Principal's Office",
    isUrgent: true
  },
  {
    id: "ann-2",
    title: "Form One 2026 Admissions: Reporting Guidelines and Verification",
    date: "18 Jan 2026",
    category: "Ministry Notice",
    summary: "Online portal open for downloading admission letters, school uniform requirements, and NEMIS placement verification.",
    content: "Parents of newly placed Form One students are requested to complete biodata submission via this portal. Ensure all immunization documents, KCPE result slips, and fee deposits are uploaded ahead of induction week.",
    author: "Admissions Secretariat",
    isUrgent: false
  },
  {
    id: "ann-3",
    title: "Digital Fee Clearance Protocol via M-PESA Paybill 522123",
    date: "10 Jan 2026",
    category: "Administrative",
    summary: "School introduces automated instant receipt generation for all M-Pesa payments through the online school portal.",
    content: "Please note that all fee payments should strictly be made via M-Pesa Paybill 522123 or direct deposit to Co-operative Bank. Cash payments at school premises are strictly not accepted in accordance with Ministry of Education financial guidelines.",
    author: "Bursar & Accounts Office",
    isUrgent: false
  }
];

export const TIMETABLE_SAMPLE = [
  { period: "Period 1 (08:00 - 08:45)", mon: "Mathematics (Mr. Ochieng)", tue: "English (Mrs. Muthoni)", wed: "Chemistry (Mr. Mutunga)", thu: "Physics (Mr. Kilonzo)", fri: "Biology (Dr. Wambua)" },
  { period: "Period 2 (08:45 - 09:30)", mon: "Mathematics (Mr. Ochieng)", tue: "English (Mrs. Muthoni)", wed: "Chemistry (Mr. Mutunga)", thu: "Physics (Mr. Kilonzo)", fri: "Kiswahili (Mwl. Nzioki)" },
  { period: "Break (09:30 - 09:50)", mon: "Tea & Health Snack", tue: "Tea & Health Snack", wed: "Tea & Health Snack", thu: "Tea & Health Snack", fri: "Tea & Health Snack" },
  { period: "Period 3 (09:50 - 10:35)", mon: "Kiswahili (Mwl. Nzioki)", tue: "Biology (Dr. Wambua)", wed: "History (Mr. Maingi)", thu: "Mathematics (Mr. Ochieng)", fri: "English (Mrs. Muthoni)" },
  { period: "Period 4 (10:35 - 11:20)", mon: "Biology Lab (Dr. Wambua)", tue: "Chemistry Lab (Mr. Mutunga)", wed: "Agriculture (Mr. Kyalo)", thu: "Mathematics (Mr. Ochieng)", fri: "CRE (Mrs. Wayua)" },
  { period: "Period 5 (11:20 - 12:05)", mon: "History (Mr. Maingi)", tue: "Physics Practical", wed: "Agriculture (Mr. Kyalo)", thu: "Kiswahili (Mwl. Nzioki)", fri: "Computer Studies (ICT)" },
  { period: "Lunch & Rest (12:05 - 01:15)", mon: "Dining Hall", tue: "Dining Hall", wed: "Dining Hall", thu: "Dining Hall", fri: "Dining Hall" },
  { period: "Period 6 (01:15 - 02:00)", mon: "CRE (Mrs. Wayua)", tue: "Computer Studies (ICT)", wed: "Mathematics (Mr. Ochieng)", thu: "Biology (Dr. Wambua)", fri: "Clubs & Societies" },
  { period: "Period 7 (02:00 - 02:45)", mon: "English (Mrs. Muthoni)", tue: "History (Mr. Maingi)", wed: "English (Mrs. Muthoni)", thu: "Chemistry (Mr. Mutunga)", fri: "Guidance & Counseling" },
  { period: "Period 8 (02:45 - 03:30)", mon: "Physics (Mr. Kilonzo)", tue: "Agriculture (Mr. Kyalo)", wed: "Kiswahili (Mwl. Nzioki)", thu: "Geography (Mr. Musau)", fri: "Pastoral Program" },
  { period: "Games & Prep (03:30 - 05:00)", mon: "House Athletics", tue: "Ball Games & Rugby", wed: "Track & Field", thu: "Inter-House Matches", fri: "General Assembly" }
];
