import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { 
  FileText, 
  CheckCircle2, 
  Download, 
  HelpCircle, 
  AlertCircle,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';

export const AdmissionsSection: React.FC = () => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryClass, setInquiryClass] = useState('Form 1');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryName('');
      setInquiryPhone('');
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            National NEMIS & Ministry of Education Placement
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold font-display">
            Admissions & Joining Instructions
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Welcome to prospective parents and scholars. Nduluni High School admits students through the Ministry of Education NEMIS portal as well as selective transfer vacancies based on academic merit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form 1 & Transfer Guides */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step-by-Step Flow */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-display text-stone-900">
              Form One Reporting & Enrolment Protocols
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-full bg-rose-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-900">Download Official Admission Letter</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Verify student placement via Ministry NEMIS portal or collect physical letter package directly from the Principal's secretariat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-full bg-rose-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-900">Medical Examination & Immunization Form</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Have the enclosed medical form stamped and signed by a registered medical practitioner at a recognized Government Sub-County or County Referral Hospital.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-full bg-rose-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-900">Term 1 Fees Payment via M-Pesa / Bank</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Pay official Term 1 boarding and maintenance levy via M-Pesa Paybill <strong className="font-mono">522123</strong> (Account: Student NEMIS Assessment No) or Co-op Bank. Bring original bank slip or M-Pesa confirmation code.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-50 border border-stone-200">
                <div className="w-8 h-8 rounded-full bg-rose-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-900">Personal Effects & Uniform Kit Inspection</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    All items must be strictly labeled with the student's admission number. Non-standard casual clothing, electronic gadgets, and unauthorized medicines are prohibited.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Downloadable Documents */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-stone-900">
              Download Official Admissions Documentation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "2026 Form 1 Joining Instructions Package", size: "3.8 MB", type: "PDF" },
                { title: "Student Medical Clearance Examination Form", size: "1.2 MB", type: "PDF" },
                { title: "Official Boarding Kit & Uniform Specifications", size: "950 KB", type: "PDF" },
                { title: "Form 2 & 3 Transfer Request Form", size: "1.4 MB", type: "PDF" }
              ].map((doc, i) => (
                <div key={i} className="p-4 border border-stone-200 rounded-lg flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-stone-900">{doc.title}</h5>
                    <p className="text-[10px] text-stone-500">{doc.type} · {doc.size}</p>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading "${doc.title}"...`)}
                    className="p-2 text-rose-900 hover:bg-rose-50 rounded cursor-pointer"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Admission Enquiry */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-display text-stone-900">
              Admissions Desk Inquiry
            </h3>
            <p className="text-xs text-stone-500">
              Request guidance on vacancy availability or verify your student's placement status with our registry.
            </p>

            {inquirySubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Thank you. Our admissions registrar will contact you shortly on {inquiryPhone}.</span>
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Mutuku"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0722 000 000"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Class of Interest</label>
                  <select
                    value={inquiryClass}
                    onChange={(e) => setInquiryClass(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-stone-300 bg-stone-50 focus:outline-none"
                  >
                    <option value="Form 1">Form 1 (NEMIS Fresh Intake)</option>
                    <option value="Form 2">Form 2 (Transfer Candidate)</option>
                    <option value="Form 3">Form 3 (Transfer Candidate)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-rose-950 hover:bg-rose-900 rounded cursor-pointer transition-colors shadow-sm"
                >
                  Submit Admission Inquiry
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
              <p>Admissions Office: <strong className="text-stone-700">+254 722 849 201</strong></p>
              <p>Hours: Mon - Fri: 8:00 AM - 4:30 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
