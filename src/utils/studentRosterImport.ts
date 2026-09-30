import Papa from 'papaparse';
import { SCHOOL_SUBJECTS } from '../data/subjects';
import { normalizeKenyanMobilePhone } from './kenyanPhone';

export interface StudentRosterRow {
  admissionNo: string;
  fullName: string;
  form: number;
  stream: string;
  house: string;
  guardianName: string;
  guardianPhone: string;
  currentTermBalance: number;
  nemisUpi: string;
  kcpeMarks: number | null;
  attendanceRate: number | null;
  classTeacher: string;
  subjectCodes: string[];
}

export interface StudentRosterParseResult {
  students: StudentRosterRow[];
  errors: string[];
}

const REQUIRED_HEADERS = [
  'admissionNo',
  'fullName',
  'form',
  'stream',
  'guardianName',
  'guardianPhone',
  'currentTermBalance',
  'subjectCodes'
];

export const STUDENT_ROSTER_TEMPLATE = [
  'admissionNo,fullName,form,stream,house,guardianName,guardianPhone,currentTermBalance,nemisUpi,kcpeMarks,attendanceRate,classTeacher,subjectCodes'
].join('\n');

export function parseStudentRosterFile(file: File, existingAdmissions: string[]): Promise<StudentRosterParseResult> {
  return file.text().then(csvText => new Promise<StudentRosterParseResult>(resolve => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: header => header.trim(),
      complete: result => {
        const errors: string[] = result.errors.map(error => `CSV row ${error.row === undefined ? 'unknown' : error.row + 2}: ${error.message}`);
        const headers = result.meta.fields || [];
        const missingHeaders = REQUIRED_HEADERS.filter(header => !headers.includes(header));
        if (missingHeaders.length) {
          resolve({ students: [], errors: [`Missing required columns: ${missingHeaders.join(', ')}`] });
          return;
        }
        if (!result.data.length) {
          resolve({ students: [], errors: ['CSV contains no student rows.'] });
          return;
        }

        const existing = new Set(existingAdmissions.map(admission => admission.trim().toLowerCase()));
        const seen = new Set<string>();
        const students: StudentRosterRow[] = [];
        const allowedSubjects = new Set<string>(SCHOOL_SUBJECTS.map(subject => subject.code));

        result.data.forEach((row, index) => {
          const line = index + 2;
          const admissionNo = (row.admissionNo || '').trim().toUpperCase();
          const fullName = (row.fullName || '').trim();
          const form = Number(row.form);
          const stream = (row.stream || '').trim();
          const house = (row.house || '').trim();
          const guardianName = (row.guardianName || '').trim();
          const guardianPhone = (row.guardianPhone || '').trim();
          const normalizedPhone = normalizeKenyanMobilePhone(guardianPhone);
          const balanceText = (row.currentTermBalance || '').trim();
          const currentTermBalance = Number(balanceText);
          const subjectCodes = [...new Set((row.subjectCodes || '').split(/[|;]/).map(code => code.trim()).filter(Boolean))];
          const issues: string[] = [];

          if (!admissionNo) issues.push('admissionNo is required');
          if (!fullName) issues.push('fullName is required');
          if (!Number.isInteger(form) || form < 1 || form > 4) issues.push('form must be 1, 2, 3, or 4');
          if (!stream) issues.push('stream is required');
          if (!guardianName) issues.push('guardianName is required');
          if (!normalizedPhone) issues.push('guardianPhone must be 9 or 10 digits, e.g. 724891230 or 0724891230');
          if (!balanceText || !Number.isFinite(currentTermBalance) || currentTermBalance < 0) issues.push('currentTermBalance must be zero or more');
          if (!subjectCodes.length) issues.push('at least one subjectCode is required');
          if (subjectCodes.some(code => !allowedSubjects.has(code))) issues.push('subjectCodes contains an unknown code');

          const normalizedAdmission = admissionNo.toLowerCase();
          if (normalizedAdmission && existing.has(normalizedAdmission)) issues.push('admissionNo already exists in the registry');
          if (normalizedAdmission && seen.has(normalizedAdmission)) issues.push('admissionNo is duplicated in this file');
          if (normalizedAdmission) seen.add(normalizedAdmission);

          const optionalNumber = (field: 'kcpeMarks' | 'attendanceRate', min: number, max: number): number | null => {
            const raw = (row[field] || '').trim();
            if (!raw) return null;
            const value = Number(raw);
            if (!Number.isFinite(value) || value < min || value > max) {
              issues.push(`${field} must be between ${min} and ${max}`);
              return null;
            }
            return value;
          };

          const kcpeMarks = optionalNumber('kcpeMarks', 0, 500);
          const attendanceRate = optionalNumber('attendanceRate', 0, 100);
          if (issues.length) {
            errors.push(`Row ${line}: ${issues.join('; ')}`);
            return;
          }

          students.push({
            admissionNo,
            fullName,
            form,
            stream,
            house,
            guardianName,
            guardianPhone: normalizedPhone!,
            currentTermBalance,
            nemisUpi: (row.nemisUpi || '').trim(),
            kcpeMarks,
            attendanceRate,
            classTeacher: (row.classTeacher || '').trim(),
            subjectCodes
          });
        });

        resolve({ students: errors.length ? [] : students, errors: errors.slice(0, 50) });
      },
      error: (error: Error) => resolve({ students: [], errors: [error.message] })
    });
  })).catch(error => ({
    students: [],
    errors: [error instanceof Error ? error.message : 'The CSV file could not be read.']
  }));
}
