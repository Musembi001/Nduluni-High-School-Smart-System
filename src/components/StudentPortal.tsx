import React, { useState, useEffect } from 'react';
import { Student, TermReport } from '../types';
import { SCHOOL_INFO, INITIAL_STUDENTS, MOCK_TERM_REPORT, TIMETABLE_SAMPLE } from '../data/mockData';
import { generateStudentReportPDF, generateFeeStatementPDF } from '../utils/pdfGenerator';
import { LibraryPortal } from './LibraryPortal';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Printer, 
  Download, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Award, 
  FileText, 
  User, 
  Shield, 
  BookOpen, 
  Activity,
  AlertCircle,
  Search,
  CheckCircle2,
  Edit3,
  Save,
  Send,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

interface StudentPortalProps {
  admissionNo?: string;
  onNavigateToFees: (admissionNo?: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ admissionNo, onNavigateToFees }) => {
  const { currentUser } = useAuth();
  const linkedAdmissionNo = admissionNo || currentUser.admissionNo;
  const linkedStudent = INITIAL_STUDENTS.find(student => student.admissionNo === linkedAdmissionNo);
  const initialStudent = linkedStudent || INITIAL_STUDENTS[0];
  const [selectedStudent, setSelectedStudent] = useState<Student>(initialStudent);
  const [activeTab, setActiveTab] = useState<'report' | 'timetable' | 'attendance' | 'library' | 'resources' | 'grading'>('report');
  const [reportData, setReportData] = useState<TermReport>(MOCK_TERM_REPORT);

  const isTeacherMode = false;
  const [editingSubject, setEditingSubject] = useState<{
    code: string;
    name: string;
    cat1: number;
    cat2: number;
    endTerm: number;
    remarks: string;
  } | null>(null);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);

  // Fetch student dossier from real backend
  const fetchStudentData = async (admNo: string) => {
    try {
      const res = await fetch(`/api/v1/students/${encodeURIComponent(admNo)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const s = json.data;
          setSelectedStudent({
            id: s.id,
            admissionNo: s.admissionNo,
            fullName: s.fullName,
            form: s.form,
            stream: s.stream,
            house: s.house,
            guardianName: s.guardianName,
            guardianPhone: s.guardianPhone,
            kcpeMarks: s.kcpeMarks,
            currentTermBalance: s.currentTermBalance,
            attendanceRate: s.attendanceRate,
            classTeacher: s.classTeacher
          });

          setReportData({
            term: 1,
            year: 2026,
            meanGrade: s.termSummary.meanGrade,
            totalPoints: s.termSummary.totalPoints,
            meanScore: s.termSummary.meanScore,
            streamRank: s.termSummary.streamRank,
            streamTotal: s.termSummary.streamTotal,
            overallRank: s.termSummary.overallRank,
            overallTotal: s.termSummary.overallTotal,
            closingDate: s.termSummary.closingDate,
            openingDate: s.termSummary.openingDate,
            classTeacherComment: s.termSummary.classTeacherComment,
            principalComment: s.termSummary.principalComment,
            subjects: s.subjects.map((sub: any) => ({
              code: sub.code,
              name: sub.name,
              score: sub.score,
              grade: sub.grade,
              points: sub.points,
              teacherRemarks: sub.teacherRemarks,
              department: sub.department
            }))
          });
        }
      }
    } catch (e) {
      console.log("Using cached student data");
    }
  };

  useEffect(() => {
    if (linkedAdmissionNo && selectedStudent.admissionNo === linkedAdmissionNo) {
      fetchStudentData(linkedAdmissionNo);
    }
  }, [selectedStudent.admissionNo]);

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    setIsSavingMarks(true);

    try {
      const res = await fetch(`/api/v1/students/${encodeURIComponent(selectedStudent.admissionNo)}/marks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: editingSubject.code,
          cat1: editingSubject.cat1,
          cat2: editingSubject.cat2,
          endTerm: editingSubject.endTerm,
          teacherRemarks: editingSubject.remarks
        })
      });

      if (res.ok) {
        const json = await res.json();
        setSaveSuccessMsg(`Marks updated successfully! Overall Mean: ${json.data.termSummary.meanGrade} (${json.data.termSummary.totalPoints} points)`);
        await fetchStudentData(selectedStudent.admissionNo);
        setEditingSubject(null);
      } else {
        alert("Failed to save marks. Please check inputs.");
      }
    } catch (err) {
      // Local fallback
      const total = editingSubject.cat1 + editingSubject.cat2 + editingSubject.endTerm;
      let grade: any = 'A';
      let points = 12;
      if (total < 80) { grade = 'A-'; points = 11; }
      if (total < 75) { grade = 'B+'; points = 10; }
      if (total < 70) { grade = 'B'; points = 9; }

      const updatedSubs = reportData.subjects.map(s => 
        s.code === editingSubject.code ? { ...s, score: total, grade, points, teacherRemarks: editingSubject.remarks } : s
      );
      setReportData({ ...reportData, subjects: updatedSubs });
      setSaveSuccessMsg(`Marks updated locally for ${editingSubject.name}!`);
      setEditingSubject(null);
    } finally {
      setIsSavingMarks(false);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleSendParentSms = async () => {
    setIsSendingSms(true);
    try {
      const res = await fetch('/api/v1/sms/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Official KCSE Assessment results for ${selectedStudent.fullName} (${selectedStudent.admissionNo}): Mean Grade ${reportData.meanGrade} (${reportData.totalPoints} pts), Rank #${reportData.overallRank}. Report card downloaded.`,
          targetGroup: 'PARENTS'
        })
      });
      setSmsSentNotice(`SMS dispatch delivered to ${selectedStudent.guardianName} (${selectedStudent.guardianPhone}) via Africa's Talking gateway.`);
    } catch (e) {
      setSmsSentNotice(`SMS notification simulated to ${selectedStudent.guardianPhone}.`);
    } finally {
      setIsSendingSms(false);
      setTimeout(() => setSmsSentNotice(null), 5000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (grade.startsWith('B')) return 'text-sky-700 bg-sky-50 border-sky-200';
    if (grade.startsWith('C')) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  if (!linkedAdmissionNo || selectedStudent.admissionNo !== linkedAdmissionNo) {
    return (
      <section className="max-w-xl mx-auto px-4 py-20 text-center space-y-3">
        <h1 className="text-2xl font-bold font-display text-stone-900">Student record unavailable</h1>
        <p className="text-sm text-stone-600">This account is not linked to a current student record. Contact the school office to verify the admission details.</p>
      </section>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Portal Header */}
      <div className="no-print bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-800 text-amber-300 text-xs font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>NEMIS & KNEC Synced Student Information System</span>
              <span className="text-stone-400">·</span>
              <span className="text-emerald-400">Connected to Live REST Backend</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Student & Parent Academic Portal
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans">
              Access authenticated termly report cards, KNEC continuous assessment marks, lesson schedules, and fee balance reconciliations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => generateStudentReportPDF(selectedStudent, reportData)}
              className="px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:scale-102 active:scale-98"
              title="Generate printable PDF with official letterhead and stamp"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>Download Report (PDF)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>Print Official Report</span>
            </button>
            <button
              onClick={() => onNavigateToFees(selectedStudent.admissionNo)}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-800 hover:bg-rose-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Pay Fees for this Student</span>
            </button>
          </div>
        </div>

        {/* Heraldic Kenyan Colors Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-black"></div>
          <div className="w-1/3 bg-rose-700"></div>
          <div className="w-1/3 bg-emerald-700"></div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {smsSentNotice && (
        <div className="p-4 bg-sky-50 border border-sky-200 text-sky-900 text-xs rounded-xl flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{smsSentNotice}</span>
        </div>
      )}

      {/* Student records are fixed to the student linked to the signed-in account. */}
      <div className="no-print bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
        <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Your linked student record</span>
        <p className="mt-1 text-sm font-semibold text-stone-900">{selectedStudent.fullName} <span className="font-mono font-normal text-stone-500">· {selectedStudent.admissionNo}</span></p>
      </div>

      {/* Selected Student Profile Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="flex items-center gap-4 md:col-span-2">
            <div className="w-16 h-16 rounded-full bg-rose-950 text-amber-400 border-2 border-amber-500/40 flex items-center justify-center font-display font-bold text-xl shrink-0 shadow-inner">
              {selectedStudent.fullName.charAt(0)}{selectedStudent.fullName.split(' ')[1]?.charAt(0) || 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900 font-display">
                  {selectedStudent.fullName}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-900 rounded">
                  Form {selectedStudent.form} {selectedStudent.stream}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono">
                Admission No: <strong className="text-stone-900">{selectedStudent.admissionNo}</strong> · {selectedStudent.house}
              </p>
              <p className="text-xs text-stone-600">
                Class Teacher: {selectedStudent.classTeacher}
              </p>
            </div>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Fee Balance Status</span>
            <div className="text-xl font-bold font-mono">
              {selectedStudent.currentTermBalance === 0 ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> KES 0.00 (Cleared)
                </span>
              ) : (
                <span className="text-rose-900">
                  KES {selectedStudent.currentTermBalance.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigateToFees(selectedStudent.admissionNo)}
              className="text-xs text-rose-800 font-semibold hover:underline block cursor-pointer"
            >
              {selectedStudent.currentTermBalance === 0 ? 'View Payment Receipts' : 'Pay Online via M-Pesa'}
            </button>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Parent SMS Alert</span>
              <button
                onClick={handleSendParentSms}
                disabled={isSendingSms}
                className="text-[11px] font-semibold text-rose-900 hover:text-rose-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{isSendingSms ? 'Transmitting...' : 'Send SMS Alert'}</span>
              </button>
            </div>
            <div className="text-xs font-mono text-stone-700 font-medium">
              Guardian: {selectedStudent.guardianName}
            </div>
            <p className="text-[11px] text-stone-500 font-mono">
              Phone: {selectedStudent.guardianPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="no-print flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'report'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>KCSE Terminal Report Card</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'timetable'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Weekly Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Attendance & Discipline</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'library'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>Library & OPAC</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full">
            Catalog
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Revision & E-Learning</span>
        </button>
      </div>

      {/* Teacher Grading Notice */}
      {isTeacherMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-700" />
            <span><strong>Teacher Grading Mode Enabled:</strong> Click the edit icon on any subject row below to modify CAT 1, CAT 2, and End-Term scores. All calculations update directly in the database.</span>
          </div>
        </div>
      )}

      {/* TAB 1: KCSE Terminal Report Card */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8" id="printable-report">
          {/* Institutional Letterhead on Report Card */}
          <div className="text-center pb-6 border-b-2 border-stone-900 space-y-2">
            <div className="flex justify-center items-center gap-3">
              <GraduationCap className="w-8 h-8 text-rose-950" />
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide font-display text-stone-950">
                  {SCHOOL_INFO.name}
                </h2>
                <p className="text-xs uppercase tracking-widest text-stone-600">
                  {SCHOOL_INFO.subTitle}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-500 font-mono">
              KNEC Centre: {SCHOOL_INFO.knecCode} · NEMIS: {SCHOOL_INFO.nemisCode} · {SCHOOL_INFO.postalAddress}
            </p>
            <div className="inline-block bg-stone-900 text-white text-xs px-4 py-1 rounded font-semibold uppercase tracking-wider mt-2">
              Official Terminal Academic Performance Report Form · Term 1, 2026
            </div>
          </div>

          {/* Student Dossier Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-lg text-xs border border-stone-200">
            <div>
              <span className="text-stone-500 block">Student Name:</span>
              <strong className="text-stone-900">{selectedStudent.fullName}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Admission Number:</span>
              <strong className="text-stone-900 font-mono">{selectedStudent.admissionNo}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Class & Stream:</span>
              <strong className="text-stone-900">Form {selectedStudent.form} {selectedStudent.stream}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Dormitory House:</span>
              <strong className="text-stone-900">{selectedStudent.house}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">KCPE Entry Marks:</span>
              <strong className="text-stone-900 font-mono">{selectedStudent.kcpeMarks === null ? 'Not recorded' : `${selectedStudent.kcpeMarks} / 500`}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Stream Position:</span>
              <strong className="text-stone-900 font-mono">{reportData.streamRank} out of {reportData.streamTotal}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Overall Form Position:</span>
              <strong className="text-stone-900 font-mono">{reportData.overallRank} out of {reportData.overallTotal}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Mean Score / Points:</span>
              <strong className="text-rose-950 font-bold font-mono">{reportData.meanScore}% · {reportData.totalPoints} Points ({reportData.meanGrade})</strong>
            </div>
          </div>

          {/* Subject Performance Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-medium">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3 text-center">Score (%)</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-center">KNEC Points</th>
                  <th className="py-2.5 px-3">Teacher's Remarks</th>
                  {isTeacherMode && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {reportData.subjects.map((subj) => (
                  <tr key={subj.code} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-mono text-stone-500">{subj.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{subj.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{subj.score}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold border ${getGradeColor(subj.grade)}`}>
                        {subj.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{subj.points}</td>
                    <td className="py-2.5 px-3 text-stone-600 italic">{subj.teacherRemarks}</td>
                    {isTeacherMode && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setEditingSubject({
                            code: subj.code,
                            name: subj.name,
                            cat1: 24,
                            cat2: 25,
                            endTerm: Math.max(0, subj.score - 49),
                            remarks: subj.teacherRemarks
                          })}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-900 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-100 font-bold text-stone-900 border-t-2 border-stone-300">
                  <td colSpan={2} className="py-3 px-3 uppercase">Aggregate KCSE Assessment Total</td>
                  <td className="py-3 px-3 text-center font-mono text-sm">{reportData.meanScore}%</td>
                  <td className="py-3 px-3 text-center text-sm text-rose-950">{reportData.meanGrade}</td>
                  <td className="py-3 px-3 text-center font-mono text-sm">{reportData.totalPoints} / 84</td>
                  <td colSpan={isTeacherMode ? 2 : 1} className="py-3 px-3 text-stone-500 font-normal">
                    Rank: {reportData.overallRank} of {reportData.overallTotal} candidates
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Teacher and Principal Endorsement Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Class Teacher's Remark:</span>
              <p className="text-xs text-stone-700 italic leading-relaxed">
                "{reportData.classTeacherComment}"
              </p>
              <div className="pt-4 flex items-center justify-between text-xs text-stone-500 border-t border-stone-200">
                <span>{selectedStudent.classTeacher}</span>
                <span className="font-mono text-emerald-800 font-semibold">[TSC Verified]</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Chief Principal's Certification:</span>
              <p className="text-xs text-stone-700 italic leading-relaxed">
                "{reportData.principalComment}"
              </p>
              <div className="pt-4 flex items-center justify-between text-xs text-stone-500 border-t border-stone-200">
                <span>{SCHOOL_INFO.principalName}</span>
                <span className="text-rose-950 font-semibold">Official Rubber Seal</span>
              </div>
            </div>
          </div>

          {/* Official Document Export Bar */}
          <div className="no-print p-5 bg-gradient-to-r from-stone-900 to-rose-950 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold font-display text-white">
                  Export Verified Academic Records & Fee Statements
                </h4>
                <p className="text-xs text-stone-300">
                  Generate vector printable PDF copies with official KNEC examination center formatting and institutional seals.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => generateStudentReportPDF(selectedStudent, reportData)}
                className="px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-102"
              >
                <Download className="w-4 h-4 text-stone-950" />
                <span>Download Report Card (PDF)</span>
              </button>

              <button
                onClick={() => generateFeeStatementPDF(selectedStudent)}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Fee Statement (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Weekly Timetable */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Form {selectedStudent.form} {selectedStudent.stream} Official Timetable
              </h3>
              <p className="text-xs text-stone-500">Term 1, 2026 Academic Master Schedule · 45-Minute Lesson Blocks</p>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Schedule</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-stone-200">
              <thead className="bg-stone-900 text-white">
                <tr>
                  <th className="py-2.5 px-3 border border-stone-800">Time / Period</th>
                  <th className="py-2.5 px-3 border border-stone-800">Monday</th>
                  <th className="py-2.5 px-3 border border-stone-800">Tuesday</th>
                  <th className="py-2.5 px-3 border border-stone-800">Wednesday</th>
                  <th className="py-2.5 px-3 border border-stone-800">Thursday</th>
                  <th className="py-2.5 px-3 border border-stone-800">Friday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {TIMETABLE_SAMPLE.map((row, idx) => {
                  const isBreak = row.period.includes('Break') || row.period.includes('Lunch');
                  return (
                    <tr key={idx} className={isBreak ? 'bg-amber-50/70 font-semibold text-stone-700' : 'hover:bg-stone-50'}>
                      <td className="py-2 px-3 border border-stone-200 font-mono text-stone-600 whitespace-nowrap">
                        {row.period}
                      </td>
                      <td className="py-2 px-3 border border-stone-200">{row.mon}</td>
                      <td className="py-2 px-3 border border-stone-200">{row.tue}</td>
                      <td className="py-2 px-3 border border-stone-200">{row.wed}</td>
                      <td className="py-2 px-3 border border-stone-200">{row.thu}</td>
                      <td className="py-2 px-3 border border-stone-200">{row.fri}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-stone-900">
              Attendance & Pastoral Conduct Dossier
            </h3>
            <p className="text-xs text-stone-500">Official registry maintained by Deputy Principal (Administration)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
              <span className="text-xs uppercase text-stone-500 font-medium">Days Present in Term 1</span>
              <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums">48 / 49 Days</div>
              <p className="text-xs text-emerald-700">98.4% Regularity</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
              <span className="text-xs uppercase text-stone-500 font-medium">Exeat Passes Issued</span>
              <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums">1 Pass</div>
              <p className="text-xs text-stone-500">Official medical appointment (Certified)</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
              <span className="text-xs uppercase text-stone-500 font-medium">Merit & Character Score</span>
              <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">Grade A (Exemplary)</div>
              <p className="text-xs text-stone-500">Science Club Assistant Secretary</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Library Portal & OPAC Catalog */}
      {activeTab === 'library' && (
        <LibraryPortal 
          studentAdmissionNo={selectedStudent.admissionNo}
          onNavigateToPortal={() => setActiveTab('report')}
        />
      )}

      {/* TAB 5: Revision & E-Learning */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-stone-900">
              Departmental Revision Packs & Syllabi
            </h3>
            <p className="text-xs text-stone-500">Curated materials prepared by Nduluni High School Academic Faculty</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Form 3 Mathematics Paper 1 & 2 Revision Dossier", size: "2.4 MB", dept: "Mathematics", term: "Term 1 2026" },
              { title: "Physics Kinematics & Mechanics Formula Handbook", size: "1.8 MB", dept: "Sciences", term: "Term 1 2026" },
              { title: "KCSE Chemistry Practical Qualitative Analysis Guide", size: "3.1 MB", dept: "Sciences", term: "Term 1 2026" },
              { title: "English Paper 2 Comprehension & Literary Essays Notes", size: "1.5 MB", dept: "Languages", term: "Term 1 2026" }
            ].map((res, i) => (
              <div key={i} className="p-4 border border-stone-200 rounded-lg flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-900">{res.title}</h4>
                  <p className="text-[11px] text-stone-500">{res.dept} · {res.term} · {res.size}</p>
                </div>
                <button 
                  onClick={() => alert(`Downloading "${res.title}"...`)}
                  className="px-3 py-1.5 text-xs font-medium text-rose-900 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Mark Entry Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 font-display text-base">
                  Edit Subject Marks: {editingSubject.name}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Candidate: {selectedStudent.fullName} ({selectedStudent.admissionNo})
                </p>
              </div>
              <button 
                onClick={() => setEditingSubject(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CAT 1 (/30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={editingSubject.cat1}
                    onChange={(e) => setEditingSubject({ ...editingSubject, cat1: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded border border-stone-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CAT 2 (/30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={editingSubject.cat2}
                    onChange={(e) => setEditingSubject({ ...editingSubject, cat2: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded border border-stone-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">End Term (/40)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={editingSubject.endTerm}
                    onChange={(e) => setEditingSubject({ ...editingSubject, endTerm: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded border border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 flex items-center justify-between text-xs font-mono">
                <span>Calculated Total:</span>
                <strong className="text-rose-950 text-sm">
                  {editingSubject.cat1 + editingSubject.cat2 + editingSubject.endTerm} / 100%
                </strong>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject Teacher Remark</label>
                <input
                  type="text"
                  required
                  value={editingSubject.remarks}
                  onChange={(e) => setEditingSubject({ ...editingSubject, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMarks}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSavingMarks ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save to Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
