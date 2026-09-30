import React, { useState, useEffect } from 'react';
import { Student, PaymentTransaction } from '../types';
import { SCHOOL_INFO, INITIAL_STUDENTS, MOCK_FEE_STRUCTURE, INITIAL_TRANSACTIONS } from '../data/mockData';
import { generateFeeStatementPDF } from '../utils/pdfGenerator';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Printer, 
  Download, 
  Search, 
  AlertCircle, 
  FileText, 
  Receipt, 
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  MessageSquare,
  Radio,
  History,
  Clock,
  Filter,
  Eye,
  TrendingUp,
  X
} from 'lucide-react';

interface FeePaymentSystemProps {
  initialAdmissionNo?: string;
  onNavigateToPortal: () => void;
}

export const FeePaymentSystem: React.FC<FeePaymentSystemProps> = ({ 
  initialAdmissionNo,
  onNavigateToPortal 
}) => {
  const [studentsList, setStudentsList] = useState<Student[]>(INITIAL_STUDENTS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pay' | 'history' | 'sms_logs'>('pay');
  const [historySearch, setHistorySearch] = useState('');
  const [historyChannel, setHistoryChannel] = useState<'ALL' | 'M-PESA' | 'Bank Deposit'>('ALL');
  const [historyAdmission, setHistoryAdmission] = useState<'ALL' | string>('ALL');
  const [inspectingTxn, setInspectingTxn] = useState<PaymentTransaction | null>(null);

  const [activeAdmissionNo, setActiveAdmissionNo] = useState(
    initialAdmissionNo || studentsList[0]?.admissionNo || 'NHS/3412/2023'
  );

  const [paymentChannel, setPaymentChannel] = useState<'mpesa' | 'bank' | 'card'>('mpesa');
  const [parentPhone, setParentPhone] = useState('0724891230');
  const [paymentAmount, setPaymentAmount] = useState<string>('14500');
  const [bankRefCode, setBankRefCode] = useState('');
  
  // M-Pesa STK Push Simulation State
  const [isProcessingStk, setIsProcessingStk] = useState(false);
  const [showStkPrompt, setShowStkPrompt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<PaymentTransaction | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string>('');

  // Fetch initial data from server
  const loadServerData = async () => {
    try {
      // 1. Fetch Students
      const stdRes = await fetch('/api/v1/students');
      if (stdRes.ok) {
        const stdJson = await stdRes.json();
        if (stdJson.data && stdJson.data.length > 0) {
          setStudentsList(stdJson.data.map((s: any) => ({
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
          })));
        }
      }

      // 2. Fetch Transactions
      const txRes = await fetch('/api/v1/payments/transactions');
      if (txRes.ok) {
        const txJson = await txRes.json();
        if (txJson.data) {
          setTransactions(txJson.data);
        }
      }

      // 3. Fetch SMS Logs
      const smsRes = await fetch('/api/v1/sms/logs');
      if (smsRes.ok) {
        const smsJson = await smsRes.json();
        if (smsJson.data) {
          setSmsLogs(smsJson.data);
        }
      }
    } catch (e) {
      console.log('Using local client state for fee payments');
    }
  };

  useEffect(() => {
    loadServerData();
  }, []);

  const currentStudent = studentsList.find(s => s.admissionNo === activeAdmissionNo) || studentsList[0];

  const handleAdmissionChange = (admNo: string) => {
    setActiveAdmissionNo(admNo);
    const std = studentsList.find(s => s.admissionNo === admNo);
    if (std) {
      setPaymentAmount(std.currentTermBalance > 0 ? std.currentTermBalance.toString() : '5000');
      setParentPhone(std.guardianPhone);
    }
  };

  const initiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount to pay.");
      return;
    }

    if (paymentChannel === 'mpesa') {
      if (!parentPhone || parentPhone.length < 9) {
        alert("Please provide a valid Safaricom phone number.");
        return;
      }
      setIsProcessingStk(true);

      try {
        // Real Backend STK Push Call
        const res = await fetch('/api/v1/payments/mpesa/stkpush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: parentPhone,
            amount: amountNum,
            admissionNo: currentStudent.admissionNo
          })
        });

        const json = await res.json();
        if (json.success) {
          setCheckoutId(json.data.checkoutRequestId);
          setShowStkPrompt(true);
        } else {
          alert(`STK Push failed: ${json.error}`);
        }
      } catch (err) {
        alert('Could not reach the payment service. No payment was recorded. Please try again later.');
      } finally {
        setIsProcessingStk(false);
      }
    } else if (paymentChannel === 'bank') {
      if (!bankRefCode.trim()) {
        alert("Please enter the bank deposit slip reference code.");
        return;
      }

      try {
        const res = await fetch('/api/v1/payments/bank-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admissionNo: currentStudent.admissionNo,
            amount: amountNum,
            bankReference: bankRefCode.trim().toUpperCase(),
            branch: 'Co-op Bank Machakos'
          })
        });

        if (res.ok) {
          const json = await res.json();
          setLastReceipt(json.data.transaction);
          setPaymentSuccessMsg(`Bank deposit slip ${bankRefCode} validated. KES ${amountNum.toLocaleString()} credited to ${currentStudent.fullName}.`);
          loadServerData();
        } else {
          const json = await res.json();
          alert(json.error || 'The deposit could not be verified.');
        }
      } catch (err) {
        alert("Server communication error. Please try again.");
      }
    } else {
      alert('Card payments are unavailable until a payment provider is configured. No payment was recorded.');
    }
  };

  const confirmMpesaPrompt = async () => {
    setShowStkPrompt(false);
    const amountNum = parseFloat(paymentAmount);

    try {
      const res = await fetch('/api/v1/payments/mpesa/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutRequestId: checkoutId,
          admissionNo: currentStudent.admissionNo,
          amount: amountNum,
          phoneNumber: parentPhone
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Payment confirmation failed.');
      }

      if (res.ok) {
        setLastReceipt(json.data.transaction);
        setPaymentSuccessMsg(`Payment of KES ${amountNum.toLocaleString()} confirmed via M-Pesa ${json.data.transaction.referenceCode}! SMS receipt dispatched.`);
        await loadServerData();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment confirmation failed. No payment was recorded.');
    } finally {
      setShowStkPrompt(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="no-print bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-800 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MoE Verified Automated School Fees Reconciliation Engine</span>
              <span className="text-stone-500">·</span>
              <span className="text-amber-300">Development payment simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Online Fee Payment & Statement System
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans">
              Review fee balances and transaction history. Payment confirmation is recorded only by the configured payment service or bursary staff.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('pay')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pay'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-200 bg-stone-800 hover:bg-stone-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Make Fee Payment</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-200 bg-stone-800 hover:bg-stone-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Transaction History ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sms_logs')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sms_logs'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-200 bg-stone-800 hover:bg-stone-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Parent SMS Logs ({smsLogs.length})</span>
            </button>

            <button
              onClick={onNavigateToPortal}
              className="px-3 py-2 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ml-1"
            >
              <span>Academic Portal</span>
              <ArrowRight className="w-3 h-3" />
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

      {paymentSuccessMsg && (
        <div className="no-print p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setPaymentSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: Main Fee Payment Engine */}
      {activeTab === 'pay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Payment Engine */}
          <div className="no-print lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-bold font-display text-stone-900">
                  1. Select Student & Term Account
                </h2>
                <p className="text-xs text-stone-500">Pick an enrolled scholar to fetch current term balance automatically</p>
              </div>

              {/* Quick Student Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {studentsList.map((std) => (
                  <button
                    key={std.id}
                    onClick={() => handleAdmissionChange(std.admissionNo)}
                    className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                      activeAdmissionNo === std.admissionNo
                        ? 'border-rose-900 bg-rose-50/50 shadow-sm'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-stone-900 truncate">{std.fullName}</p>
                    <p className="text-[11px] font-mono text-stone-500">{std.admissionNo}</p>
                    <p className="text-xs font-semibold mt-1">
                      {std.currentTermBalance === 0 ? (
                        <span className="text-emerald-700">Cleared</span>
                      ) : (
                        <span className="text-rose-900">KES {std.currentTermBalance.toLocaleString()}</span>
                      )}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-100">
                <h2 className="text-lg font-bold font-display text-stone-900 mb-1">
                  2. Choose Payment Channel
                </h2>
                <p className="text-xs text-stone-500 mb-4">Official accredited payment channels for Nduluni High School</p>

                {/* Channel Selector */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel('mpesa')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentChannel === 'mpesa'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs">Lipa na M-PESA</span>
                    <span className="text-[10px] text-emerald-800 font-mono">Paybill 522123</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('bank')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentChannel === 'bank'
                        ? 'border-rose-900 bg-rose-50 text-rose-950 font-bold shadow-sm'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-rose-900" />
                    <span className="text-xs">Co-op Bank</span>
                    <span className="text-[10px] text-stone-500">Direct Deposit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel('card')}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentChannel === 'card'
                        ? 'border-sky-800 bg-sky-50 text-sky-950 font-bold shadow-sm'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-sky-800" />
                    <span className="text-xs">Debit / Card</span>
                    <span className="text-[10px] text-stone-500">Visa / Mastercard</span>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={initiatePayment} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Student Admission Number
                    </label>
                    <input
                      type="text"
                      value={activeAdmissionNo}
                      onChange={(e) => setActiveAdmissionNo(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-rose-900 bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Amount to Pay (KES)
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                      min="100"
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-rose-900"
                    />
                  </div>
                </div>

                {paymentChannel === 'mpesa' && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">M-PESA Express (STK Push Gateway)</span>
                      <span className="text-[11px] font-mono text-emerald-800">Paybill: 522123 · Acc: {currentStudent.admissionNo}</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Parent / Guardian Safaricom Phone Number
                      </label>
                      <input
                        type="tel"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="e.g. 0724891230"
                        required
                        className="w-full px-3 py-2 text-xs font-mono rounded border border-stone-300 bg-white"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        Development mode only. No Safaricom request is sent; never enter your M-Pesa PIN on this website.
                      </p>
                    </div>
                  </div>
                )}

                {paymentChannel === 'bank' && (
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg space-y-3 text-xs">
                    <div className="font-bold text-rose-950">School Banking Particulars:</div>
                    <div className="space-y-1 font-mono text-stone-700">
                      <p>Bank: {SCHOOL_INFO.bankAccount.bankName}</p>
                      <p>Branch: {SCHOOL_INFO.bankAccount.branch}</p>
                      <p>A/C No: <strong>{SCHOOL_INFO.bankAccount.accountNumber}</strong></p>
                      <p>A/C Name: {SCHOOL_INFO.bankAccount.accountName}</p>
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Bank Deposit Slip Voucher / Serial Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. COOP-DEP-94182"
                        value={bankRefCode}
                        onChange={(e) => setBankRefCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessingStk}
                  className="w-full py-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingStk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting Daraja STK Prompt to {parentPhone}...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        Pay KES {parseFloat(paymentAmount || '0').toLocaleString()} for {currentStudent.fullName}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Official Fee Structure Accordion */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-display text-stone-900">
                    Approved Ministry of Education Fee Vote Heads (2026)
                  </h3>
                  <p className="text-[11px] text-stone-500">County Extra-County Boarding Public School Guidelines</p>
                </div>
                <span className="text-xs font-bold text-rose-900 font-mono">Term 1 Obligation</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-medium">
                      <th className="py-2">Vote Head Particulars</th>
                      <th className="py-2 text-right">Term 1</th>
                      <th className="py-2 text-right">Term 2</th>
                      <th className="py-2 text-right">Term 3</th>
                      <th className="py-2 text-right">Annual Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {MOCK_FEE_STRUCTURE.filter(f => f.category === 'Parent Obligation').map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50">
                        <td className="py-2 text-stone-800">{item.voteHead}</td>
                        <td className="py-2 text-right font-mono">KES {item.term1.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-stone-500">KES {item.term2.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-stone-500">KES {item.term3.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono font-semibold">KES {item.approvedMoE.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-300 font-bold text-stone-900 bg-stone-50">
                      <td className="py-2.5">Total Boarding & Parent Levies</td>
                      <td className="py-2.5 text-right font-mono text-rose-950">KES 29,900</td>
                      <td className="py-2.5 text-right font-mono">KES 17,800</td>
                      <td className="py-2.5 text-right font-mono">KES 9,800</td>
                      <td className="py-2.5 text-right font-mono">KES 57,500</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Statement & Printable Official Receipt */}
          <div className="lg:col-span-5 space-y-6">
            {/* Official Printable Receipt Card */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6" id="printable-receipt">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-rose-950" />
                  <span className="font-bold text-sm text-stone-900 font-display">Official School Receipt</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateFeeStatementPDF(currentStudent, transactions.filter(t => t.admissionNo === currentStudent.admissionNo))}
                    className="no-print px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-102"
                    title="Generate official printable PDF statement"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-950" />
                    <span>Download Statement (PDF)</span>
                  </button>

                  <button
                    onClick={handlePrintReceipt}
                    className="no-print px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>

              {/* Receipt Preview Body */}
              <div className="p-4 bg-stone-50 border border-dashed border-stone-300 rounded-lg space-y-4 text-xs font-mono">
                <div className="text-center space-y-1 pb-3 border-b border-stone-200">
                  <h4 className="font-bold text-stone-900 text-sm font-display tracking-wider">{SCHOOL_INFO.name}</h4>
                  <p className="text-[10px] text-stone-600">BURSAR'S OFFICIAL CASH RECEIPT</p>
                  <p className="text-[10px] text-stone-500">P.O. Box 48 - 90130, Nduluni · MoE Code: 12314502</p>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Receipt No:</span>
                    <span className="font-bold text-stone-900">{lastReceipt?.receiptNo || 'NHS-REC-2026-0891'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Date:</span>
                    <span>{lastReceipt?.date || '12 Jan 2026, 09:41 AM'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Student Name:</span>
                    <span className="font-bold text-stone-900">{lastReceipt?.studentName || currentStudent.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Admission No:</span>
                    <span className="font-bold text-stone-900">{lastReceipt?.admissionNo || currentStudent.admissionNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Channel:</span>
                    <span className="text-emerald-800 font-semibold">{lastReceipt?.paymentMethod || 'M-PESA Paybill 522123'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">M-Pesa Reference:</span>
                    <span className="font-bold text-stone-900">{lastReceipt?.referenceCode || 'TK98XQ821P'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>AMOUNT RECEIVED:</span>
                    <span className="text-rose-950 text-sm">
                      KES {(lastReceipt?.amount || 25000).toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-600">
                    <span>Remaining Term Balance:</span>
                    <span>KES {currentStudent.currentTermBalance.toLocaleString()}.00</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500">
                  <div>
                    <p>Certified by: Automated Gateway</p>
                    <p className="text-emerald-700 font-bold">STATUS: VALID & VERIFIED</p>
                  </div>
                  <div className="w-12 h-12 bg-white border border-stone-300 p-1 flex items-center justify-center text-[9px] text-stone-400 text-center leading-none">
                    [QR SEAL 123145]
                  </div>
                </div>
              </div>
            </div>

            {/* Past Transactions Ledger */}
            <div className="no-print bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-display text-stone-900">
                  Recent Clearance Ledger
                </h3>
                <span className="text-xs text-stone-500">{transactions.length} records</span>
              </div>

              <div className="space-y-3">
                {transactions.slice(0, 4).map((txn) => (
                  <div 
                    key={txn.id}
                    onClick={() => setLastReceipt(txn)}
                    className="p-3 rounded-lg border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">{txn.studentName}</span>
                        <span className="text-[10px] text-stone-500 font-mono">({txn.admissionNo})</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {txn.paymentMethod} · Ref: <strong className="text-stone-700 font-mono">{txn.referenceCode}</strong> · {txn.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-emerald-800 block">
                        KES {txn.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-stone-400">View Receipt</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-100">
                <button
                  onClick={() => setActiveTab('history')}
                  className="w-full py-2.5 text-xs font-bold text-rose-950 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:scale-101"
                >
                  <History className="w-3.5 h-3.5 text-rose-800" />
                  <span>Open Full Transaction History & Status Ledger ({transactions.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Complete Transaction History & Status Updates */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900 flex items-center gap-2">
                <History className="w-5 h-5 text-rose-950" />
                <span>Transaction History & Real-Time Status Updates</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Official audit ledger of all fee remittances processed via Safaricom Lipa Na M-Pesa Paybill 522123, Co-op Bank vouchers, and MoE Capitation accounts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generateFeeStatementPDF(currentStudent, transactions.filter(t => historyAdmission === 'ALL' || t.admissionNo === historyAdmission))}
                className="px-3.5 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:scale-102"
              >
                <Download className="w-3.5 h-3.5 text-stone-950" />
                <span>Download Statement (PDF)</span>
              </button>
            </div>
          </div>

          {/* Key Financial KPIs / Status Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Total Reconciled Collections</span>
              <div className="text-xl font-bold font-mono text-emerald-800">
                KES {transactions.reduce((acc, t) => acc + (t.status === 'Completed' ? t.amount : 0), 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-500">Real-time MoE Account Ledger</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Cleared Transactions</span>
              <div className="text-xl font-bold font-mono text-stone-900">
                {transactions.filter(t => t.status === 'Completed').length} / {transactions.length}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Successful Reconciliation</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Safaricom Daraja Status</span>
              <div className="text-xl font-bold font-display text-emerald-700">Online & Live</div>
              <p className="text-[11px] text-stone-500">Instant STK Webhook Active</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Selected Scholar Balance</span>
              <div className="text-xl font-bold font-mono text-rose-950">
                {currentStudent.currentTermBalance === 0 ? 'KES 0 (Cleared)' : `KES ${currentStudent.currentTermBalance.toLocaleString()}`}
              </div>
              <p className="text-[11px] text-stone-500 truncate">{currentStudent.fullName}</p>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search receipt, reference, or candidate..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-rose-950"
                />
              </div>

              {/* Channel Filter */}
              <div className="flex items-center gap-1">
                {(['ALL', 'M-PESA', 'Bank Deposit'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setHistoryChannel(ch)}
                    className={`px-2.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      historyChannel === ch
                        ? 'bg-rose-950 text-white shadow-2xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              {/* Student Filter */}
              <div>
                <select
                  value={historyAdmission}
                  onChange={(e) => setHistoryAdmission(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-medium"
                >
                  <option value="ALL">All Enrolled Scholars</option>
                  {studentsList.map((s) => (
                    <option key={s.id} value={s.admissionNo}>
                      {s.fullName} ({s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(historySearch || historyChannel !== 'ALL' || historyAdmission !== 'ALL') && (
              <button
                onClick={() => {
                  setHistorySearch('');
                  setHistoryChannel('ALL');
                  setHistoryAdmission('ALL');
                }}
                className="text-rose-900 hover:underline font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Transactions Table with Live Status Updates */}
          <div className="min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-medium">
                  <th className="py-3 px-3">Receipt No</th>
                  <th className="py-3 px-3">Candidate / Student</th>
                  <th className="py-3 px-3">Channel & Ref Code</th>
                  <th className="py-3 px-3 text-right">Amount (KES)</th>
                  <th className="py-3 px-3">Date & Timestamp</th>
                  <th className="py-3 px-3">Clearance Status & Audit Update</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {transactions
                  .filter((t) => {
                    const matchesSearch =
                      t.studentName.toLowerCase().includes(historySearch.toLowerCase()) ||
                      t.admissionNo.toLowerCase().includes(historySearch.toLowerCase()) ||
                      t.referenceCode.toLowerCase().includes(historySearch.toLowerCase()) ||
                      t.receiptNo.toLowerCase().includes(historySearch.toLowerCase());
                    const matchesChannel =
                      historyChannel === 'ALL' || t.paymentMethod === historyChannel;
                    const matchesAdmission =
                      historyAdmission === 'ALL' || t.admissionNo === historyAdmission;
                    return matchesSearch && matchesChannel && matchesAdmission;
                  })
                  .map((t) => {
                    const isMpesa = t.paymentMethod === 'M-PESA';
                    return (
                      <tr key={t.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-rose-950">
                          {t.receiptNo}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-stone-900 block">{t.studentName}</span>
                          <span className="font-mono text-stone-500 text-[11px]">{t.admissionNo}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isMpesa ? (
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 text-rose-900 shrink-0" />
                            )}
                            <span className="text-stone-800">{t.paymentMethod}</span>
                          </div>
                          <span className="font-mono text-stone-600 text-[11px] block">{t.referenceCode}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 text-sm">
                          KES {t.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-stone-600 font-mono text-[11px]">
                          {t.date}
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>{t.status}</span>
                            </span>
                            <p className="text-[10px] text-stone-500">
                              {isMpesa ? "Daraja STK Push Confirmed & Credited" : "Verified at Co-op Bank Machakos"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setInspectingTxn(t);
                              setLastReceipt(t);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-950 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Africa's Talking Parent SMS Gateway Logs */}
      {activeTab === 'sms_logs' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600" />
                <span>Africa's Talking Parent SMS Delivery Logs</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time audit log of automated SMS confirmations dispatched to Safaricom, Airtel, and Telkom numbers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('pay')}
              className="px-3 py-1.5 text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 rounded cursor-pointer"
            >
              Back to Fees
            </button>
          </div>

          <div className="space-y-4">
            {smsLogs.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No SMS dispatches yet. Complete a payment to trigger an SMS receipt.</p>
            ) : (
              smsLogs.map((sms) => (
                <div key={sms.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{sms.recipientName}</span>
                      <span className="font-mono text-stone-600">({sms.recipientPhone})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {sms.status}
                      </span>
                    </div>
                    <span className="text-stone-400 font-mono text-[11px]">{sms.timestamp}</span>
                  </div>

                  <p className="text-stone-700 bg-white p-3 rounded border border-stone-200 font-mono text-[11px] leading-relaxed">
                    "{sms.message}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono pt-1">
                    <span>Gateway: Africa's Talking Kenya (SMPP)</span>
                    <span>Cost: {sms.cost}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Local development-only payment confirmation */}
      {showStkPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-700 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                  M
                </div>
                <span className="font-bold text-sm tracking-wide">Development M-Pesa Simulator</span>
              </div>
              <span className="text-xs text-amber-300 font-mono">NOT A LIVE PAYMENT</span>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs font-mono space-y-2 text-stone-200">
              <p className="leading-relaxed">
                Do you want to pay <strong className="text-emerald-400">KES {parseFloat(paymentAmount).toLocaleString()}</strong> to <strong className="text-white">NDULUNI HIGH SCHOOL</strong>?
              </p>
              <p className="text-stone-400">Paybill: 522123</p>
              <p className="text-stone-400">Account: {currentStudent.admissionNo}</p>
            </div>
            <p className="text-xs text-amber-200">This local simulator does not contact Safaricom or charge a mobile-money account.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowStkPrompt(false)}
                className="py-2 text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMpesaPrompt}
                className="py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow cursor-pointer"
              >
                Simulate Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt & Transaction Status Inspection Modal */}
      {inspectingTxn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-950" />
                <div>
                  <h3 className="font-bold text-sm text-stone-900 font-display">
                    Official Bursary Receipt & Clearance Record
                  </h3>
                  <span className="text-[11px] font-mono text-stone-500">
                    {inspectingTxn.receiptNo} · {inspectingTxn.date}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingTxn(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Card Body */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-stone-200">
                <p className="font-bold text-stone-900 text-sm">{SCHOOL_INFO.name}</p>
                <p className="text-[10px] text-stone-500">Bursar's Office · MoE Center Code: 12314502</p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Student Name:</span>
                  <span className="font-bold text-stone-900">{inspectingTxn.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Admission No:</span>
                  <span className="font-bold text-stone-900">{inspectingTxn.admissionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Payment Channel:</span>
                  <span className="font-bold text-emerald-800">{inspectingTxn.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Reference / Slip No:</span>
                  <span className="font-bold text-stone-900">{inspectingTxn.referenceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Academic Term:</span>
                  <span className="text-stone-700">{inspectingTxn.term}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold">
                <span className="font-sans">AMOUNT RECEIVED:</span>
                <span className="text-rose-950 font-mono text-base">
                  KES {inspectingTxn.amount.toLocaleString()}.00
                </span>
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 flex items-center justify-between">
                <span className="flex items-center gap-1 font-sans font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>STATUS: {inspectingTxn.status}</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-sans">Daraja 2.0 Webhook Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const targetStd = studentsList.find(s => s.admissionNo === inspectingTxn.admissionNo) || currentStudent;
                  generateFeeStatementPDF(targetStd, [inspectingTxn]);
                }}
                className="px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:scale-102"
              >
                <Download className="w-3.5 h-3.5 text-stone-950" />
                <span>Download PDF Statement</span>
              </button>

              <button
                onClick={() => setInspectingTxn(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
