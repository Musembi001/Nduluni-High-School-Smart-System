import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateClassBroadsheetPDF, generateStudentReportPDF } from '../../utils/pdfGenerator';
import { SCHOOL_SUBJECTS } from '../../data/subjects';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Printer, 
  Search, 
  SlidersHorizontal, 
  Edit3, 
  Save, 
  RefreshCw, 
  FileText,
  Users,
  Check,
  AlertCircle,
  Download
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState(3);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('121');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Mark Entry Modal State
  const [activeEditingStudent, setActiveEditingStudent] = useState<any | null>(null);
  const [cat1, setCat1] = useState(25);
  const [cat2, setCat2] = useState(26);
  const [endTerm, setEndTerm] = useState(35);
  const [remarks, setRemarks] = useState('Superb analytical solving speed.');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const subjectOptions = currentUser.department
    ? SCHOOL_SUBJECTS.filter(subject => subject.department.toLowerCase() === currentUser.department?.toLowerCase())
    : SCHOOL_SUBJECTS;

  const loadStudents = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/v1/students');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load the class roster.');
      setStudents(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      setStudents([]);
      setLoadError(error instanceof Error ? error.message : 'Could not load the class roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (!subjectOptions.some(subject => subject.code === selectedSubjectCode)) {
      setSelectedSubjectCode(subjectOptions[0]?.code || '');
    }
  }, [currentUser.department]);

  const openMarkEditor = (student: any) => {
    setActiveEditingStudent(student);
    const subject = student.subjects?.find((item: any) => item.code === selectedSubjectCode);
    if (!subject) {
      setActiveEditingStudent(null);
      setActionError('This student is not enrolled in the selected subject.');
      return;
    }
    setCat1(subject.cat1 ?? 0);
    setCat2(subject.cat2 ?? 0);
    setEndTerm(subject.endTerm ?? 0);
    setRemarks(subject.teacherRemarks || 'Satisfactory progress.');
    setActionError(null);
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingStudent) return;
    setIsSaving(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/v1/students/${encodeURIComponent(activeEditingStudent.admissionNo)}/marks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'TEACHER'
        },
        body: JSON.stringify({
          subjectCode: selectedSubjectCode,
          cat1: Number(cat1),
          cat2: Number(cat2),
          endTerm: Number(endTerm),
          teacherRemarks: remarks
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save marks.');
      setSaveSuccessMsg(`Marks saved for ${activeEditingStudent.fullName}. Recalculated mean: ${json.data.termSummary.meanGrade} (${json.data.termSummary.totalPoints} points).`);
      await loadStudents();
      setActiveEditingStudent(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save marks. Check your connection and try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const streamsForForm = [...new Set(students
    .filter(student => Number(student.form) === selectedForm)
    .map(student => student.stream))].sort();
  const filteredStudents = students.filter(student =>
    Number(student.form) === selectedForm &&
    (!selectedStream || student.stream === selectedStream) &&
    (!searchTerm || `${student.fullName} ${student.admissionNo}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const studentsWithSelectedSubject = filteredStudents.filter(student =>
    student.enrolledSubjectCodes?.includes(selectedSubjectCode) ||
    student.subjects?.some((subject: any) => subject.code === selectedSubjectCode)
  );
  const selectedSubjectStudents = studentsWithSelectedSubject.map(student =>
    student.subjects.find((subject: any) => subject.code === selectedSubjectCode)
  ).filter(Boolean);
  const marksEntered = selectedSubjectStudents.filter(subject =>
    subject.grade !== 'Not graded' && Number.isFinite(subject.cat1) && Number.isFinite(subject.cat2) && Number.isFinite(subject.endTerm)
  ).length;
  const gradedSubjectStudents = selectedSubjectStudents.filter(subject => subject.grade !== 'Not graded');
  const subjectMean = gradedSubjectStudents.length
    ? (gradedSubjectStudents.reduce((total, subject) => total + subject.score, 0) / gradedSubjectStudents.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Teacher Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-800 text-amber-300 text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Teachers Service Commission (TSC) Academic Faculty Desk</span>
              <span className="text-stone-500">·</span>
              <span className="text-emerald-400 font-bold">TEACHER ACCESS LEVEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Continuous Assessment & KCSE Examination Grading Desk
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans">
              Welcome, <strong className="text-white">{currentUser.name}</strong> ({currentUser.tscNumber || 'TSC Verified'}). Enter termly Continuous Assessment Tests (CAT 1 & CAT 2), submit End-Term examination marks, and review class broadsheets with automatic KNEC point conversion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => generateClassBroadsheetPDF(selectedForm, selectedStream, studentsWithSelectedSubject, selectedSubjectCode)}
              disabled={studentsWithSelectedSubject.length === 0}
              className="px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate printable PDF broadsheet with KNEC mean score statistics"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>Download Broadsheet (PDF)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>Print Browser View</span>
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
      {actionError && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span className="font-semibold">{actionError}</span>
        </div>
      )}
      {loadError && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center justify-between gap-3">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{loadError}</span>
          <button onClick={loadStudents} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Faculty Workload KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Selected Class</span>
          <div className="text-2xl font-bold font-display text-stone-900">Form {selectedForm} {selectedStream || 'All Streams'}</div>
          <p className="text-xs text-stone-500">{filteredStudents.length} candidates in this view</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Teaching Subject</span>
          <div className="text-xl font-bold font-display text-rose-950">{subjectOptions.find(subject => subject.code === selectedSubjectCode)?.name || 'No subject assigned'}</div>
          <p className="text-xs text-stone-500">Subject code {selectedSubjectCode || '—'}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Marks Entered</span>
          <div className="text-2xl font-bold font-mono text-emerald-800">{marksEntered} / {selectedSubjectStudents.length}</div>
          <p className="text-xs text-stone-500">For the selected class and subject</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Subject Mean Score</span>
          <div className="text-2xl font-bold font-mono text-stone-900">{subjectMean === null ? '—' : `${subjectMean}%`}</div>
          <p className="text-xs text-stone-500">Based on students enrolled in this subject</p>
        </div>
      </div>

      {/* Cohort & Subject Controls */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
              Select Class Form:
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedForm(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedForm === f
                      ? 'bg-rose-950 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Form {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
              Select Stream:
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-semibold"
            >
              <option value="">All streams</option>
              {streamsForForm.map(stream => <option key={stream} value={stream}>{stream}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
              Select Subject:
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-semibold"
            >
              {subjectOptions.map(subject => (
                <option key={subject.code} value={subject.code}>{subject.code} - {subject.name}</option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search name or admission number"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs"
            />
          </div>
        </div>

        <div className="text-xs text-stone-500">
          {isLoading ? 'Loading class roster…' : <>Showing <strong>{filteredStudents.length} candidates</strong></>}
        </div>
      </div>

      {/* Continuous Assessment Roster & Marks Desk */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-stone-900">
              Form {selectedForm} Continuous Assessment Ledger (Subject {selectedSubjectCode})
            </h3>
            <p className="text-xs text-stone-500">
              Kenyan MoE Weighting: CAT 1 (30%) + CAT 2 (30%) + End-Term Examination (40%) = 100%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-900 text-white font-medium">
                <th className="py-2.5 px-3">Adm No</th>
                <th className="py-2.5 px-3">Candidate Full Name</th>
                <th className="py-2.5 px-3 text-center">CAT 1 (/30)</th>
                <th className="py-2.5 px-3 text-center">CAT 2 (/30)</th>
                <th className="py-2.5 px-3 text-center">End Term (/40)</th>
                <th className="py-2.5 px-3 text-center">Total Score</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-center">Points</th>
                <th className="py-2.5 px-3">Subject Remarks</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {!isLoading && filteredStudents.map((std) => {
                const sub = std.subjects?.find((subject: any) => subject.code === selectedSubjectCode);
                const isEnrolled = Boolean(std.enrolledSubjectCodes?.includes(selectedSubjectCode) || sub);
                return (
                  <tr key={std.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-700">{std.admissionNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{std.fullName}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sub?.cat1 ?? '—'}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sub?.cat2 ?? '—'}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sub?.endTerm ?? '—'}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-950 text-sm">
                      {sub ? `${sub.score}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {sub ? <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">{sub.grade}</span> : isEnrolled ? 'Not graded' : 'Not enrolled'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-900">
                      {sub?.points ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 italic text-stone-600 truncate max-w-xs">
                      {sub?.teacherRemarks || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            const reportPayload = {
                              term: 1,
                              year: 2026,
                              meanGrade: std.termSummary?.meanGrade || 'A-',
                              totalPoints: std.termSummary?.totalPoints || 74,
                              meanScore: std.termSummary?.meanScore || 78.4,
                              streamRank: std.termSummary?.streamRank || 3,
                              streamTotal: std.termSummary?.streamTotal || 58,
                              overallRank: std.termSummary?.overallRank || 12,
                              overallTotal: std.termSummary?.overallTotal || 295,
                              closingDate: '03 Apr 2026',
                              openingDate: '04 May 2026',
                              classTeacherComment: std.termSummary?.classTeacherComment || 'Consistent academic discipline and aptitude.',
                              principalComment: std.termSummary?.principalComment || 'Keep striving for the highest honors in KCSE.',
                              subjects: std.subjects || []
                            };
                            generateStudentReportPDF(std, reportPayload);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          title="Generate printable PDF report card for this scholar"
                        >
                          <Download className="w-3 h-3 text-stone-600" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => openMarkEditor(std)}
                          disabled={!isEnrolled}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filteredStudents.length === 0 && (
                <tr><td colSpan={10} className="py-10 px-4 text-center text-sm text-stone-500">No students match these class and search filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Entry Modal */}
      {activeEditingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 font-display text-base">
                  Update Subject Marks
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {activeEditingStudent.fullName} ({activeEditingStudent.admissionNo})
                </p>
              </div>
              <button 
                onClick={() => setActiveEditingStudent(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CAT 1 (/30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={cat1}
                    onChange={(e) => setCat1(Number(e.target.value))}
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
                    value={cat2}
                    onChange={(e) => setCat2(Number(e.target.value))}
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
                    value={endTerm}
                    onChange={(e) => setEndTerm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 flex items-center justify-between text-xs font-mono">
                <span>Calculated Total Score:</span>
                <strong className="text-rose-950 text-base">
                  {cat1 + cat2 + endTerm} / 100%
                </strong>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject Teacher Remark</label>
                <input
                  type="text"
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveEditingStudent(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save to School Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
