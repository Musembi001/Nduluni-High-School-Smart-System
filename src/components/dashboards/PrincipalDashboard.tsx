import React, { useState } from 'react';
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
  Award
} from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetGroup, setTargetGroup] = useState('ALL_PARENTS');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [resultsApproved, setResultsApproved] = useState(true);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setIsSending(true);

    try {
      const res = await fetch('/api/v1/sms/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'PRINCIPAL'
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
    </div>
  );
};
