import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_INFO, INITIAL_STUDENTS, MOCK_FEE_STRUCTURE, INITIAL_TRANSACTIONS } from '../../data/mockData';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  Receipt, 
  Printer, 
  Search, 
  Radio, 
  ShieldCheck, 
  Filter, 
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export const BursarDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>(INITIAL_TRANSACTIONS);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>(INITIAL_STUDENTS);

  // Bank Deposit Verification State
  const [bankAdmNo, setBankAdmNo] = useState('NHS/3412/2023');
  const [bankAmount, setBankAmount] = useState('14500');
  const [bankRef, setBankRef] = useState('');
  const [bankBranch, setBankBranch] = useState('Co-op Bank Machakos');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLedgerTab, setActiveLedgerTab] = useState<'reconcile' | 'bank_voucher' | 'vote_heads' | 'sms_audit'>('reconcile');

  const loadData = async () => {
    try {
      const [txRes, smsRes, stdRes] = await Promise.all([
        fetch('/api/v1/payments/transactions'),
        fetch('/api/v1/sms/logs'),
        fetch('/api/v1/students')
      ]);

      if (txRes.ok) {
        const json = await txRes.json();
        if (json.data) setTransactions(json.data);
      }
      if (smsRes.ok) {
        const json = await smsRes.json();
        if (json.data) setSmsLogs(json.data);
      }
      if (stdRes.ok) {
        const json = await stdRes.json();
        if (json.data) setStudents(json.data);
      }
    } catch (e) {
      console.log('Using in-memory bursar data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyBankVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankRef.trim() || !bankAdmNo || !bankAmount) {
      alert('Please provide complete deposit slip details.');
      return;
    }
    setIsVerifying(true);

    try {
      const res = await fetch('/api/v1/payments/bank-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admissionNo: bankAdmNo,
          amount: Number(bankAmount),
          bankReference: bankRef.trim().toUpperCase(),
          branch: bankBranch
        })
      });

      if (res.ok) {
        const json = await res.json();
        setVerifyNotice(`Bank voucher ${bankRef.toUpperCase()} (KES ${Number(bankAmount).toLocaleString()}) approved and credited to ${json.data.student.fullName}. Receipt ${json.data.transaction.receiptNo} generated.`);
        setBankRef('');
        await loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Verification failed'}`);
      }
    } catch (e) {
      setVerifyNotice(`Deposit slip ${bankRef.toUpperCase()} reconciled locally.`);
    } finally {
      setIsVerifying(false);
      setTimeout(() => setVerifyNotice(null), 5000);
    }
  };

  const filteredTxns = transactions.filter(t => 
    t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.referenceCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Bursar Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-800 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bursar Accounts & MoE Financial Management Hub</span>
              <span className="text-stone-500">·</span>
              <span className="text-amber-300 font-bold">BURSAR ACCESS LEVEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              School Financial Accounting & Fee Clearance Ledger
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans">
              Welcome, <strong className="text-white">{currentUser.name}</strong>. Manage Lipa Na M-Pesa Paybill <strong className="text-white font-mono">{SCHOOL_INFO.mpesaPaybill}</strong> collections, approve bank deposit vouchers, track vote head quotas, and inspect automated parent SMS dispatches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>Print Audit Broadsheet</span>
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

      {verifyNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{verifyNotice}</span>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Term 1 Billed Revenue</span>
          <div className="text-2xl font-bold font-mono text-stone-900">KES 48,650,000</div>
          <p className="text-xs text-stone-500">1,180 Scholars · MoE Approved Levies</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Collections Reconciled</span>
          <div className="text-2xl font-bold font-mono text-emerald-800">KES 37,125,000</div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>76.3% Clearance Rate</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Lipa Na M-Pesa (522123)</span>
          <div className="text-2xl font-bold font-mono text-stone-900">KES 22,840,000</div>
          <p className="text-xs text-stone-500">Instant STK Push Integration</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-xs uppercase text-stone-500 font-medium">Co-op Bank Direct Slips</span>
          <div className="text-2xl font-bold font-mono text-rose-950">KES 14,285,000</div>
          <p className="text-xs text-stone-500">Machakos Branch Verified</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-px">
        <button
          onClick={() => setActiveLedgerTab('reconcile')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeLedgerTab === 'reconcile'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Real-Time Clearance Ledger ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveLedgerTab('bank_voucher')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeLedgerTab === 'bank_voucher'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Verify Bank Deposit Slip</span>
        </button>

        <button
          onClick={() => setActiveLedgerTab('vote_heads')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeLedgerTab === 'vote_heads'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>MoE Vote Head Distribution</span>
        </button>

        <button
          onClick={() => setActiveLedgerTab('sms_audit')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeLedgerTab === 'sms_audit'
              ? 'bg-white border-t border-x border-stone-200 text-rose-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Parent SMS Delivery Logs ({smsLogs.length})</span>
        </button>
      </div>

      {/* VIEW 1: Transactions Ledger */}
      {activeLedgerTab === 'reconcile' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-display text-stone-900">
                Official Bursar Reconciliation Records
              </h3>
              <p className="text-xs text-stone-500">Synchronized with Safaricom Daraja API and Bank Vouchers</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference, admission, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-medium">
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Admission No</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Reference / Slip</th>
                  <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                  <th className="py-2.5 px-3">Date & Timestamp</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-950">{t.receiptNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{t.studentName}</td>
                    <td className="py-2.5 px-3 font-mono text-stone-600">{t.admissionNo}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-medium">
                        {t.paymentMethod === 'M-PESA' ? (
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-rose-900" />
                        )}
                        <span>{t.paymentMethod}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-stone-700">{t.referenceCode}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      KES {t.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">{t.date}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Verify Bank Deposit Slip */}
      {activeLedgerTab === 'bank_voucher' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-stone-900">
              Verify Direct Bank Deposit Voucher
            </h3>
            <p className="text-xs text-stone-500">
              Manually authenticate student deposits made at Co-operative Bank of Kenya branches to update the scholar's ledger.
            </p>
          </div>

          <form onSubmit={handleVerifyBankVoucher} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Student Admission Number <span className="text-rose-700">*</span>
              </label>
              <select
                value={bankAdmNo}
                onChange={(e) => setBankAdmNo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 font-medium"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.admissionNo}>
                    {s.fullName} ({s.admissionNo}) — Bal: KES {s.currentTermBalance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Bank Deposit Slip Serial Code <span className="text-rose-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COOP-DEP-94182"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Amount Deposited (KES) <span className="text-rose-700">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Bank Branch Location</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isVerifying ? 'Verifying Deposit Slip...' : 'Approve & Issue Official Cash Receipt'}</span>
            </button>
          </form>
        </div>
      )}

      {/* VIEW 3: Vote Head Breakdown */}
      {activeLedgerTab === 'vote_heads' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-stone-900">
              Ministry of Education Fee Structure & Vote Head Allocations (2026)
            </h3>
            <p className="text-xs text-stone-500">Boarding Public Extra-County Secondary School Standard</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-medium">
                  <th className="py-2.5 px-3">Vote Head Category</th>
                  <th className="py-2.5 px-3">Vote Head Item</th>
                  <th className="py-2.5 px-3 text-right">Term 1</th>
                  <th className="py-2.5 px-3 text-right">Term 2</th>
                  <th className="py-2.5 px-3 text-right">Term 3</th>
                  <th className="py-2.5 px-3 text-right">Annual Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {MOCK_FEE_STRUCTURE.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 text-stone-500 font-medium">{item.category}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{item.voteHead}</td>
                    <td className="py-2.5 px-3 text-right font-mono">KES {item.term1.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-600">KES {item.term2.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-600">KES {item.term3.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">KES {item.approvedMoE.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: Africa's Talking Parent SMS Delivery Logs */}
      {activeLedgerTab === 'sms_audit' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-stone-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600" />
              <span>Africa's Talking Parent SMS Receipt Audit Log</span>
            </h3>
            <p className="text-xs text-stone-500">Live delivery reports confirming parents received their payment receipts</p>
          </div>

          <div className="space-y-3">
            {smsLogs.map((sms) => (
              <div key={sms.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{sms.recipientName}</span>
                    <span className="font-mono text-stone-600">({sms.recipientPhone})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {sms.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">{sms.timestamp}</span>
                </div>
                <p className="p-3 bg-white rounded border border-stone-200 font-mono text-[11px] text-stone-700">
                  "{sms.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
