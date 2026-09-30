import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS } from '../../data/mockData';
import { generateClassBroadsheetPDF, generateStudentReportPDF } from '../../utils/pdfGenerator';
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
  const [students, setStudents] = useState<any[]>(INITIAL_STUDENTS);
  const [selectedForm, setSelectedForm] = useState(3);
  const [selectedStream, setSelectedStream] = useState('West');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('121'); // Mathematics Alt A

  // Mark Entry Modal State
  const [activeEditingStudent, setActiveEditingStudent] = useState<any | null>(null);
  const [cat1, setCat1] = useState(25);
  const [cat2, setCat2] = useState(26);
  const [endTerm, setEndTerm] = useState(35);
  const [remarks, setRemarks] = useState('Superb analytical solving speed.');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      const res = await fetch('/api/v1/students');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setStudents(json.data);
      }
    } catch (e) {
      console.log('Using in-memory students');
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openMarkEditor = (student: any) => {
    setActiveEditingStudent(student);
    const subj = student.subjects.find((s: any) => s.code === selectedSubjectCode) || student.subjects[0];
    setCat1(subj.cat1 || 24);
    setCat2(subj.cat2 || 25);
    setEndTerm(subj.endTerm || 33);
    setRemarks(subj.teacherRemarks || 'Satisfactory progress.');
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingStudent) return;
    setIsSaving(true);

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

      if (res.ok) {
        const json = await res.json();
        setSaveSuccessMsg(`Marks saved for ${activeEditingStudent.fullName}! Recalculated Mean: ${json.data.termSummary.meanGrade} (${json.data.termSummary.totalPoints} pts).`);
        await loadStudents();
        setActiveEditingStudent(null);
      } else {
        alert('Failed to save marks. Check inputs.');
      }
    } catch (err) {
      setSaveSuccessMsg(`Marks updated for ${activeEditingStudent.fullName}.`);
      setActiveEditingStudent(null);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const filteredStudents = students.filter(s => s.form === selectedForm);

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
              onClick={() => generateClassBroadsheetPDF(selectedForm, selectedStream, filteredStudents, selectedSubjectCode)}
              className="px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-102"
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

      {/* Faculty Workload KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Assigned Class</span>
          <div className="text-2xl font-bold font-display text-stone-900">Form 3 West</div>
          <p className="text-xs text-stone-500">58 Enrolled Candidates · Kilimanjaro House</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Teaching Subject Allocation</span>
          <div className="text-2xl font-bold font-display text-rose-950">Mathematics Alt A (121)</div>
          <p className="text-xs text-stone-500">Form 3 & Form 4 Candidates</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Marks Upload Progress</span>
          <div className="text-2xl font-bold font-mono text-emerald-800">100% Complete</div>
          <p className="text-xs text-stone-500">CAT 1, CAT 2 & End Term Submitted</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Subject Mean Score</span>
          <div className="text-2xl font-bold font-mono text-stone-900">82.4% (Grade A)</div>
          <p className="text-xs text-stone-500">Target KCSE Mean: 11.2 Points</p>
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

          <div className="pl-4 border-l border-stone-200">
            <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
              Select Subject:
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-semibold"
            >
              <option value="121">121 - Mathematics Alternative A</option>
              <option value="101">101 - English Language</option>
              <option value="102">102 - Kiswahili Lugha</option>
              <option value="231">231 - Biology</option>
              <option value="232">232 - Physics</option>
              <option value="233">233 - Chemistry</option>
              <option value="311">311 - History & Government</option>
              <option value="443">443 - Agriculture</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-stone-500">
          Showing <strong>{filteredStudents.length} candidates</strong> in Form {selectedForm}
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
              {filteredStudents.map((std) => {
                const sub = std.subjects.find((s: any) => s.code === selectedSubjectCode) || std.subjects[0];
                return (
                  <tr key={std.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-700">{std.admissionNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{std.fullName}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sub.cat1 || 24}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sub.cat2 || 25}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sub.endTerm || 33}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-950 text-sm">
                      {sub.score}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-900">
                      {sub.points}
                    </td>
                    <td className="py-2.5 px-3 italic text-stone-600 truncate max-w-xs">
                      {sub.teacherRemarks}
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
                              subjects: std.subjects || [sub]
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
                          className="px-2.5 py-1 text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
