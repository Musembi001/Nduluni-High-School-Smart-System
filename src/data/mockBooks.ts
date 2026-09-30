export interface Book {
  id: string;
  accessionNo: string;
  title: string;
  author: string;
  isbn: string;
  category: 'KCSE Set Books' | 'Sciences & STEM' | 'Mathematics' | 'Humanities & Business' | 'Languages & Dictionaries' | 'Past Papers & Revision';
  formLevel: 'All Forms' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';
  shelfLocation: string;
  deweyDecimal: string;
  publisher: string;
  yearPublished: number;
  totalCopies: number;
  availableCopies: number;
  status: 'Available' | 'Borrowed' | 'Reference Only' | 'Reserved';
  synopsis: string;
  isDigital: boolean;
  digitalFileSize?: string;
  currentBorrower?: {
    studentName: string;
    admissionNo: string;
    dueDate: string;
  };
}

export const INITIAL_BOOKS: Book[] = [
  {
    id: "bk-1",
    accessionNo: "NHS-LIB-2024-0012",
    title: "Fathers of Nations",
    author: "Paul B. Vitta",
    isbn: "978-9966-25-891-2",
    category: "KCSE Set Books",
    formLevel: "Form 3",
    shelfLocation: "Aisle A · Shelf 1 (Literature Bay)",
    deweyDecimal: "823.92 VIT",
    publisher: "Oxford University Press East Africa",
    yearPublished: 2021,
    totalCopies: 45,
    availableCopies: 12,
    status: "Available",
    synopsis: "Official KCSE Compulsory English Novel exploring governance, African leadership crises, and ideological conflict during the Banjul African Summit.",
    isDigital: true,
    digitalFileSize: "3.8 MB (PDF Study Guide)"
  },
  {
    id: "bk-2",
    accessionNo: "NHS-LIB-2024-0045",
    title: "The Samaritan",
    author: "John Lara",
    isbn: "978-9966-36-740-1",
    category: "KCSE Set Books",
    formLevel: "Form 4",
    shelfLocation: "Aisle A · Shelf 2 (Drama & Plays)",
    deweyDecimal: "822.3 LAR",
    publisher: "Kenya Literature Bureau (KLB)",
    yearPublished: 2022,
    totalCopies: 50,
    availableCopies: 8,
    status: "Available",
    synopsis: "Official KCSE Compulsory Play centered on municipal corruption, civic whistleblowing via technology, and integrity in Maracas Municipality.",
    isDigital: true,
    digitalFileSize: "4.2 MB (PDF Notes & Guide)"
  },
  {
    id: "bk-3",
    accessionNo: "NHS-LIB-2023-0189",
    title: "Bembea ya Maisha",
    author: "Timothy Arege",
    isbn: "978-9966-10-512-8",
    category: "KCSE Set Books",
    formLevel: "Form 4",
    shelfLocation: "Aisle B · Shelf 1 (Fasihi ya Kiswahili)",
    deweyDecimal: "896.392 ARE",
    publisher: "Access Publishers",
    yearPublished: 2021,
    totalCopies: 40,
    availableCopies: 0,
    status: "Borrowed",
    synopsis: "Tamthilia ya lazima ya Kiswahili inayochunguza mabadiliko ya maisha, migogoro ya ndoa, malezi ya watoto na uhusiano wa kifamilia.",
    isDigital: false,
    currentBorrower: {
      studentName: "Brian Mutua Musyoki",
      admissionNo: "NHS/3412/2023",
      dueDate: "08 Apr 2026"
    }
  },
  {
    id: "bk-4",
    accessionNo: "NHS-LIB-2024-0210",
    title: "Mapambazuko ya Machweo na Hadithi Nyingine",
    author: "D.W. Lutomia na Phibbian Muthama",
    isbn: "978-9966-01-382-7",
    category: "KCSE Set Books",
    formLevel: "Form 3",
    shelfLocation: "Aisle B · Shelf 2 (Fasihi ya Kiswahili)",
    deweyDecimal: "896.392 LUT",
    publisher: "Mountain Top Publishers",
    yearPublished: 2022,
    totalCopies: 35,
    availableCopies: 14,
    status: "Available",
    synopsis: "Mkusanyiko wa hadithi fupi za lazima za KCSE zinazomulika masuala nyeti kama vile ufisadi, elimu, umaskini na utu katika jamii.",
    isDigital: true,
    digitalFileSize: "2.9 MB (Uchambuzi PDF)"
  },
  {
    id: "bk-5",
    accessionNo: "NHS-LIB-2025-0511",
    title: "KLB Secondary Mathematics Form 3 (Students' Book 4th Edition)",
    author: "Kenya Literature Bureau Authors Panel",
    isbn: "978-9966-44-893-0",
    category: "Mathematics",
    formLevel: "Form 3",
    shelfLocation: "Aisle C · Shelf 3 (Mathematics Bay)",
    deweyDecimal: "510.712 KLB",
    publisher: "Kenya Literature Bureau (KLB)",
    yearPublished: 2023,
    totalCopies: 120,
    availableCopies: 32,
    status: "Available",
    synopsis: "Approved Ministry of Education coursebook covering Quadratic Expressions, Approximations & Errors, Trigonometry II, Surds, and Commercial Arithmetic.",
    isDigital: true,
    digitalFileSize: "12.4 MB (E-Coursebook)"
  },
  {
    id: "bk-6",
    accessionNo: "NHS-LIB-2024-0618",
    title: "Longhorn Secondary Chemistry Form 4",
    author: "P.N. Okatch & M. Kang'ethe",
    isbn: "978-9966-36-118-8",
    category: "Sciences & STEM",
    formLevel: "Form 4",
    shelfLocation: "Aisle D · Shelf 2 (Physical Sciences)",
    deweyDecimal: "540.7 OKA",
    publisher: "Longhorn Publishers PLC",
    yearPublished: 2022,
    totalCopies: 85,
    availableCopies: 19,
    status: "Available",
    synopsis: "Comprehensive curriculum coverage of Acids, Bases & Salts, Energy Changes in Chemical Reactions, Reaction Rates, and Organic Chemistry II.",
    isDigital: true,
    digitalFileSize: "15.1 MB (Lab Manual Included)"
  },
  {
    id: "bk-7",
    accessionNo: "NHS-LIB-2023-0782",
    title: "Principles of Physics for Secondary Schools",
    author: "M. Nelkon & P. Parker",
    isbn: "978-0435-67-100-3",
    category: "Sciences & STEM",
    formLevel: "Form 4",
    shelfLocation: "Aisle D · Shelf 4 (Reserve Physics Bay)",
    deweyDecimal: "530.1 NEL",
    publisher: "Heinemann Educational Books",
    yearPublished: 2020,
    totalCopies: 15,
    availableCopies: 0,
    status: "Borrowed",
    synopsis: "In-depth advanced reference on Electromagnetic Induction, Cathode Rays, X-Rays, Radioactivity, and Electronics for top KCSE candidates.",
    isDigital: false,
    currentBorrower: {
      studentName: "Faith Ndinda Mwanzia",
      admissionNo: "NHS/3205/2022",
      dueDate: "11 Apr 2026"
    }
  },
  {
    id: "bk-8",
    accessionNo: "NHS-LIB-2022-0994",
    title: "Oxford Advanced Learner's Dictionary (10th International Edition)",
    author: "A.S. Hornby & Diana Lea",
    isbn: "978-0194-79-848-8",
    category: "Languages & Dictionaries",
    formLevel: "All Forms",
    shelfLocation: "Circulation Desk · Reference Carrel R-1",
    deweyDecimal: "423 HOR",
    publisher: "Oxford University Press",
    yearPublished: 2020,
    totalCopies: 25,
    availableCopies: 25,
    status: "Reference Only",
    synopsis: "Authoritative English lexical reference with pronunciation guides, collocations, phrasal verbs, and writing toolkits. Strictly non-circulating.",
    isDigital: false
  },
  {
    id: "bk-9",
    accessionNo: "NHS-LIB-2024-1102",
    title: "Kamusi Kuu ya Kiswahili (Toleo la Pili)",
    author: "Baraza la Kiswahili la Afrika Mashariki (BAKAMA)",
    isbn: "978-9966-36-992-4",
    category: "Languages & Dictionaries",
    formLevel: "All Forms",
    shelfLocation: "Circulation Desk · Reference Carrel R-2",
    deweyDecimal: "496.392 BAK",
    publisher: "Longhorn Publishers",
    yearPublished: 2021,
    totalCopies: 20,
    availableCopies: 20,
    status: "Reference Only",
    synopsis: "Kamusi pana zaidi ya istilahi, methali, nahau, tashbihi na misemo ya Kiswahili Sanifu kwa wanafunzi wa upili na vyuo vikuu.",
    isDigital: false
  },
  {
    id: "bk-10",
    accessionNo: "NHS-LIB-2025-1401",
    title: "KNEC KCSE Past Papers & Confidential Solutions (2018 - 2025)",
    author: "KNEC Examiners Joint Academic Syndicate",
    isbn: "978-9966-88-219-9",
    category: "Past Papers & Revision",
    formLevel: "Form 4",
    shelfLocation: "Aisle E · Shelf 1 (KCSE Revision Vault)",
    deweyDecimal: "373.126 KNE",
    publisher: "Machakos County Teachers Syndicate",
    yearPublished: 2025,
    totalCopies: 60,
    availableCopies: 2,
    status: "Reserved",
    synopsis: "Complete 8-year compendium of all KCSE national examinations with official KNEC marking schemes and chief examiners' advisory notes.",
    isDigital: true,
    digitalFileSize: "45.0 MB (All Subjects Bundle)"
  },
  {
    id: "bk-11",
    accessionNo: "NHS-LIB-2024-1520",
    title: "Milestones in History and Government Form 4",
    author: "B.K. Kipkoech & G.N. Ndung'u",
    isbn: "978-9966-22-671-5",
    category: "Humanities & Business",
    formLevel: "Form 4",
    shelfLocation: "Aisle F · Shelf 2 (Social Sciences)",
    deweyDecimal: "967.62 KIP",
    publisher: "East African Educational Publishers",
    yearPublished: 2023,
    totalCopies: 55,
    availableCopies: 24,
    status: "Available",
    synopsis: "Focuses on World Wars, the League of Nations & United Nations, Devolution in Kenya under the 2010 Constitution, and Public Finance.",
    isDigital: true,
    digitalFileSize: "8.7 MB (PDF)"
  },
  {
    id: "bk-12",
    accessionNo: "NHS-LIB-2023-1633",
    title: "A Parliament of Owls",
    author: "Adipo Sidang",
    isbn: "978-9966-13-882-9",
    category: "KCSE Set Books",
    formLevel: "Form 3",
    shelfLocation: "Aisle A · Shelf 3 (Modern African Drama)",
    deweyDecimal: "822.92 SID",
    publisher: "Contact Zone Books",
    yearPublished: 2022,
    totalCopies: 40,
    availableCopies: 16,
    status: "Available",
    synopsis: "Satirical African play using animal allegory to critique tribalism, oppressive legislation, corruption, and the courage of youthful reformists.",
    isDigital: true,
    digitalFileSize: "3.1 MB (Notes PDF)"
  }
];
