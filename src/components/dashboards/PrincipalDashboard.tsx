import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_INFO } from '../../data/mockData';
import { 
  Shield, 
  Send, 
  CheckCircle2, 
  Users, 
  CreditCard, 
  FileText, 
  Radio, 
  AlertCircle,
  RefreshCw,
  Lock,
  Award,
  UserRoundCheck,
  XCircle,
  Upload,
  Download,
  UserRoundPlus
} from 'lucide-react';
import { parseStudentRosterFile, STUDENT_ROSTER_TEMPLATE, StudentRosterRow } from '../../utils/studentRosterImport';

interface AccountRequest {
  id: string;
  name: string;
  username: string;
  roleTitle: string;
  admissionNo?: string;
  tscNumber?: string;
  staffId?: string;
  department?: string;
  phone?: string;
  email?: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const PrincipalDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetGroup, setTargetGroup] = useState('ALL_PARENTS');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [resultsApproved, setResultsApproved] = useState(true);
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  const [requestNotice, setRequestNotice] = useState<string | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [rosterPreview, setRosterPreview] = useState<StudentRosterRow[]>([]);
  const [rosterErrors, setRosterErrors] = useState<string[]>([]);
  const [rosterNotice, setRosterNotice] = useState<string | null>(null);
  const [rosterFileName, setRosterFileName] = useState('');
  const [isReadingRoster, setIsReadingRoster] = useState(false);
  const [isImportingRoster, setIsImportingRoster] = useState(false);
  const rosterFileInput = useRef<HTMLInputElement>(null);

  const loadAccountRequests = async () => {
    try {
      const res = await fetch('/api/v1/auth/requests');
      if (!res.ok) return;
      const json = await res.json();
      setAccountRequests(json.data || []);
    } catch {
      setRequestNotice('Account requests could not be loaded.');
    }
  };

  const loadRegisteredStudents = async () => {
    try {
      const res = await fetch('/api/v1/students');
      if (!res.ok) throw new Error('Student registry could not be loaded.');
      const json = await res.json();
      setRegisteredStudents(Array.isArray(json.data) ? json.data : []);
    } catch {
      setRosterNotice('Student registry could not be loaded. Refresh the page and try again.');
    }
  };

  useEffect(() => {
    loadAccountRequests();
    loadRegisteredStudents();
  }, []);

  const handleRosterFile = async (file?: File) => {
    setRosterNotice(null);
    setRosterErrors([]);
    setRosterPreview([]);
    setRosterFileName(file?.name || '');
    if (!file) return;
    if (file.size > 1_500_000) {
      setRosterErrors(['CSV file must be smaller than 1.5 MB.']);
      return;
    }

    setIsReadingRoster(true);
    try {
      const result = await parseStudentRosterFile(file, registeredStudents.map(student => student.admissionNo));
      setRosterPreview(result.students);
      setRosterErrors(result.errors);
    } catch {
      setRosterErrors(['The CSV could not be read. Save it as a UTF-8 CSV file and try again.']);
    } finally {
      setIsReadingRoster(false);
    }
  };

  const downloadRosterTemplate = () => {
    const url = URL.createObjectURL(new Blob([STUDENT_ROSTER_TEMPLATE], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nduluni-student-roster-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importRoster = async () => {
    if (!rosterPreview.length || rosterErrors.length) return;
    setIsImportingRoster(true);
    setRosterNotice(null);
    try {
      const res = await fetch('/api/v1/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: rosterPreview })
      });
      const json = await res.json();
      if (!res.ok) {
        setRosterErrors(Array.isArray(json.errors) ? json.errors : [json.error || 'Roster import failed.']);
        return;
      }
      setRosterNotice(`${json.added} student${json.added === 1 ? '' : 's'} added to the registry.`);
      setRosterPreview([]);
      setRosterFileName('');
      if (rosterFileInput.current) rosterFileInput.current.value = '';
      await loadRegisteredStudents();
    } catch {
      setRosterErrors(['The import service could not be reached. No students were imported.']);
    } finally {
      setIsImportingRoster(false);
    }
  };

  const reviewAccountRequest = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    const res = await fetch(`/api/v1/auth/requests/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    if (!res.ok) {
      const json = await res.json();
      setRequestNotice(json.error || 'The account request could not be reviewed.');
      return;
    }
    setRequestNotice(decision === 'APPROVED' ? 'Account approved. The user can now sign in.' : 'Account request rejected.');
    await loadAccountRequests();
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setIsSending(true);

    try {
      const res = await fetch('/api/v1/sms/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: broadcastMsg,
          targetGroup
        })
      });

      if (res.ok) {
        const json = await res.json();
        setSendSuccess(`Official circular successfully transmitted to ${json.count || 1180} parent mobile numbers via Africa's Talking gateway.`);
        setBroadcastMsg('');
      } else {
        alert("Failed to send broadcast.");
      }
    } catch (e) {
      setSendSuccess("Official circular simulated and queued for all 1,180 guardian terminals.");
      setBroadcastMsg('');
    } finally {
      setIsSending(false);
      setTimeout(() => setSendSuccess(null), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Principal Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-800 text-amber-300 text-xs font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Office of the Chief Principal & BOM Secretariat</span>
              <span className="text-stone-500">·</span>
              <span className="text-emerald-400 font-bold">SUPER ADMIN RBAC LEVEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Executive School Governance & Administration
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans">
              Welcome, <strong className="text-white">{currentUser.name}</strong>. Oversee real-time academic approvals, whole-school fee collections, staff performance, and mass guardian communication.
            </p>
          </div>

          <div className="p-4 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1 shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
              Results Certification Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${resultsApproved ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              <span className="text-xs font-bold text-white">
                {resultsApproved ? 'Term 1 KCSE Results Certified' : 'Pending Certification'}
              </span>
            </div>
            <button
              onClick={() => setResultsApproved(!resultsApproved)}
              className="text-[11px] text-amber-300 hover:underline pt-1 block cursor-pointer"
            >
              {resultsApproved ? 'Revoke Approval' : 'Authorize Official Release'}
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

      {sendSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{sendSuccess}</span>
        </div>
      )}

      {/* Institutional Vital Signs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Total Student Enrolment</span>
          <div className="text-2xl font-bold font-display text-stone-900">1,180 Scholars</div>
          <p className="text-xs text-stone-500">100% Boarding · 4 Streams (Form 1 - 4)</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Term 1 Fee Collection Progress</span>
          <div className="text-2xl font-bold font-mono text-emerald-800">76.4% Reconciled</div>
          <p className="text-xs text-stone-500">KES 37.1M collected of KES 48.6M budget</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Teaching Faculty Standing</span>
          <div className="text-2xl font-bold font-display text-stone-900">46 TSC Educators</div>
          <p className="text-xs text-emerald-700 font-medium">100% Mark Entry Compliance</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Current KCSE Projected Mean</span>
          <div className="text-2xl font-bold font-display text-rose-950">8.92 (B+)</div>
          <p className="text-xs text-stone-500">Target: 9.20 (A-) for 2026 Cohort</p>
        </div>
      </div>

      {/* Main Grid: Mass Parent SMS Broadcast & Institutional Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mass Parent SMS Broadcast Console */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-display text-stone-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-900" />
              <span>Mass Parent SMS Broadcast Console</span>
            </h2>
            <p className="text-xs text-stone-500">
              Dispatches authenticated SMS notices directly to the mobile handsets of all 1,180 registered guardians.
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Guardian Cohort</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 font-medium"
              >
                <option value="ALL_PARENTS">All School Parents & Guardians (Form 1 - 4) · 1,180 Terminals</option>
                <option value="FORM_4">Form 4 Parents (KCSE Candidates Only) · 295 Terminals</option>
                <option value="FORM_3">Form 3 Parents · 295 Terminals</option>
                <option value="FORM_1">Form 1 Newly Enrolled Parents · 280 Terminals</option>
                <option value="FEE_BALANCES">Parents with Outstanding Fee Balances &gt; KES 10,000</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official Circular Text Message (SMS)
              </label>
              <textarea
                rows={4}
                required
                maxLength={160}
                placeholder="e.g. Nduluni High School: Parents Academic Consultation Clinic is scheduled for Friday 27th Feb 2026 from 8:30 AM. Clearance slips required. Principal."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 font-mono text-xs"
              ></textarea>
              <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                <span>SMS Standard Length: {broadcastMsg.length} / 160 characters (1 SMS Unit)</span>
                <span>Gateway: Africa's Talking Kenya (SMPP #201)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending || !broadcastMsg.trim()}
              className="w-full py-3 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transmitting SMS Broadcast to Parent Gateways...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Official Circular to Selected Parents</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Governance Audit Trail */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-900" />
              <span>Administrative Audit Trail (Kenyan MoE)</span>
            </h3>
            <p className="text-xs text-stone-500">Immutable ledger of sensitive administrative operations</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {[
              { action: "Marks Updated: Mathematics", actor: "Mr. D. Ochieng (TSC #412093)", target: "Brian Mutua (NHS/3412/2023)", time: "Today, 10:14 AM" },
              { action: "Bank Slip Clearance: KES 39,500", actor: "Mr. J. Mutua (Senior Bursar)", target: "COOP-DEP-94182 (Faith Ndinda)", time: "Yesterday, 02:15 PM" },
              { action: "M-Pesa STK Reconciled: KES 25,000", actor: "Automated Gateway", target: "TK98XQ821P (Brian Mutua)", time: "12 Jan, 09:41 AM" },
              { action: "NEMIS Cohort Synchronized", actor: "Admissions Secretariat", target: "280 Form 1 Candidates", time: "10 Jan, 04:30 PM" }
            ].map((log, idx) => (
              <div key={idx} className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <div className="flex items-center justify-between text-stone-800 font-bold">
                  <span>{log.action}</span>
                  <span className="text-[10px] text-stone-400 font-normal">{log.time}</span>
                </div>
                <p className="text-[11px] text-stone-600">By: {log.actor}</p>
                <p className="text-[11px] text-stone-500">Ref: {log.target}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-900" /> Student Registry
            </h2>
            <p className="text-xs text-stone-500 mt-1">{registeredStudents.length.toLocaleString()} students currently registered</p>
          </div>
          <button
            type="button"
            onClick={downloadRosterTemplate}
            className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download CSV template
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-950 hover:bg-rose-900 rounded-lg cursor-pointer inline-flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Choose student CSV
              <input
                ref={rosterFileInput}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={event => handleRosterFile(event.target.files?.[0])}
              />
            </label>
            <span className="text-xs text-stone-500">{isReadingRoster ? 'Checking file…' : rosterFileName || 'CSV only · Maximum 1.5 MB'}</span>
          </div>

          <p className="text-xs text-stone-600">
            Required columns: admissionNo, fullName, form, stream, guardianName, guardianPhone, currentTermBalance, subjectCodes. Separate subject codes with |. Codes: 101 English, 102 Kiswahili, 121 Mathematics, 231 Biology, 232 Physics, 233 Chemistry, 311 History, 312 Geography, 313 CRE, 443 Agriculture. Enter guardianPhone as 9 digits (724891230) or 10 digits (0724891230); the leading 0 is added automatically if missing. Optional: house, nemisUpi, kcpeMarks, attendanceRate, classTeacher. Use 0 as the balance when unknown. Existing admission numbers are never overwritten.
          </p>

          {rosterNotice && (
            <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {rosterNotice}
            </div>
          )}

          {rosterErrors.length > 0 && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-xs space-y-1 max-h-48 overflow-y-auto">
              <strong>Fix these issues before importing:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {rosterErrors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}
              </ul>
            </div>
          )}

          {rosterPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-800">Preview: {rosterPreview.length} valid student records</p>
                <button
                  type="button"
                  onClick={importRoster}
                  disabled={isImportingRoster || isReadingRoster || rosterErrors.length > 0}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isImportingRoster ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserRoundPlus className="w-4 h-4" />}
                  Import {rosterPreview.length} students
                </button>
              </div>
              <div className="max-w-full overflow-x-auto border border-stone-200 rounded-lg">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="bg-stone-900 text-white">
                    <tr>
                      <th className="px-3 py-2.5">Admission no.</th>
                      <th className="px-3 py-2.5">Student name</th>
                      <th className="px-3 py-2.5">Form / stream</th>
                      <th className="px-3 py-2.5">Guardian</th>
                      <th className="px-3 py-2.5">Phone</th>
                      <th className="px-3 py-2.5">Subjects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {rosterPreview.slice(0, 8).map(student => (
                      <tr key={student.admissionNo}>
                        <td className="px-3 py-2 font-mono">{student.admissionNo}</td>
                        <td className="px-3 py-2 font-medium">{student.fullName}</td>
                        <td className="px-3 py-2">Form {student.form} {student.stream}</td>
                        <td className="px-3 py-2">{student.guardianName}</td>
                        <td className="px-3 py-2 font-mono">{student.guardianPhone}</td>
                        <td className="px-3 py-2 font-mono">{student.subjectCodes.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rosterPreview.length > 8 && <p className="px-3 py-2 text-[11px] text-stone-500 bg-stone-50">Showing the first 8 records; all {rosterPreview.length} will be imported.</p>}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-stone-200 shadow-sm">
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-stone-900">Account Access Requests</h2>
            <p className="text-xs text-stone-500 mt-1">Verify school identity before granting a role dashboard.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            {accountRequests.filter(request => request.status === 'PENDING').length} pending
          </span>
        </div>

        {requestNotice && (
          <div className="mx-5 mt-4 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700">
            {requestNotice}
          </div>
        )}

        <div className="divide-y divide-stone-100">
          {accountRequests.filter(request => request.status === 'PENDING').map(request => (
            <div key={request.id} className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-sm text-stone-900">{request.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-semibold">{request.roleTitle}</span>
                </div>
                <p className="mt-1 text-xs text-stone-600">
                  {request.username}
                  {request.admissionNo && ` · Admission ${request.admissionNo}`}
                  {request.tscNumber && ` · TSC ${request.tscNumber}`}
                  {request.staffId && ` · Staff ID ${request.staffId}`}
                  {request.department && ` · ${request.department}`}
                </p>
                <p className="mt-1 text-[11px] text-stone-500">
                  {[request.phone, request.email].filter(Boolean).join(' · ') || 'No contact details'} · Submitted {new Date(request.requestedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => reviewAccountRequest(request.id, 'REJECTED')}
                  className="px-3 py-2 rounded-md border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => reviewAccountRequest(request.id, 'APPROVED')}
                  className="px-3 py-2 rounded-md bg-emerald-800 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <UserRoundCheck className="w-4 h-4" /> Approve account
                </button>
              </div>
            </div>
          ))}
          {accountRequests.every(request => request.status !== 'PENDING') && (
            <p className="p-6 text-sm text-stone-500">No account requests are awaiting review.</p>
          )}
        </div>
      </section>
    </div>
  );
};
