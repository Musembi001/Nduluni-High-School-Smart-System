import React from 'react';
import { SCHOOL_INFO, ANNOUNCEMENTS } from '../data/mockData';
import { 
  GraduationCap, 
  CreditCard, 
  Calendar, 
  Award, 
  Users, 
  Building, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  ChevronRight,
  Shield
} from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Marquee Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        {/* Background Image with Optical Scrim */}
        <div className="absolute inset-0">
          <img 
            src="/src/assets/images/nduluni_campus_gate_1790759053495.jpg" 
            alt="Nduluni High School Main Entrance Gate"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Gradients conforming to contrast rules */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />
        </div>

        {/* Heraldic Kenyan Colors Ribbon */}
        <div className="relative z-10 w-full h-1.5 flex">
          <div className="w-1/3 bg-black"></div>
          <div className="w-1/3 bg-rose-700"></div>
          <div className="w-1/3 bg-emerald-700"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl space-y-6">
            {/* Ministry & Institutional Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-stone-800/80 border border-stone-700/80 text-xs text-amber-300 font-medium tracking-wide">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Republic of Kenya · Ministry of Education</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-300 font-mono">KNEC Centre {SCHOOL_INFO.knecCode}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-display leading-tight text-balance">
              Nduluni High School
            </h1>

            <p className="text-lg sm:text-xl text-stone-200 font-serif italic text-amber-200/90">
              "{SCHOOL_INFO.motto}"
            </p>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
              Welcome to the digital gateway of Nduluni High School. We are an extra-county public boarding institution dedicated to academic brilliance, STEM leadership, and disciplined character formation in Eastern Kenya.
            </p>

            {/* Quick Action Triggers */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('my_dashboard')}
                className="px-5 py-3 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-stone-950" />
                Access Student Portal
              </button>

              <button
                onClick={() => onNavigate('fees')}
                className="px-5 py-3 text-sm font-semibold text-white bg-rose-900 hover:bg-rose-800 border border-rose-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                Lipa na M-Pesa / Online Fees
              </button>

              <button
                onClick={() => onNavigate('calendar')}
                className="px-4 py-3 text-sm font-medium text-stone-200 bg-stone-800/80 hover:bg-stone-700 border border-stone-600 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-stone-300" />
                2026 Academic Calendar
              </button>
            </div>

            {/* Real-time Status Strip */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-400 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Term 1 Fee Submissions Open</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>Form 1 Admissions NEMIS Reporting Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>M-PESA Paybill: <strong className="text-white font-mono">522123</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Vital Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <div className="space-y-1 border-r border-stone-100 last:border-none pr-4">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">KCSE Mean Grade (2025)</span>
            <div className="text-2xl sm:text-3xl font-bold text-rose-950 font-display tabular-nums">
              8.92 <span className="text-base font-normal text-rose-800">B+</span>
            </div>
            <p className="text-xs text-stone-500">84% Direct University KUCCPS Entry</p>
          </div>

          <div className="space-y-1 border-r border-stone-100 last:border-none pr-4">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Student Population</span>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-display tabular-nums">
              1,180
            </div>
            <p className="text-xs text-stone-500">100% Boarding & Pastoral Care</p>
          </div>

          <div className="space-y-1 border-r border-stone-100 last:border-none pr-4">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Teaching Faculty</span>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-display tabular-nums">
              46 <span className="text-base font-normal text-stone-600">Educators</span>
            </div>
            <p className="text-xs text-stone-500">TSC Certified & STEM Specialists</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Campus History</span>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-display tabular-nums">
              42 <span className="text-base font-normal text-stone-600">Years</span>
            </div>
            <p className="text-xs text-stone-500">Founded in 1984 · 4 Academic Streams</p>
          </div>
        </div>
      </section>

      {/* Principal's Address & Core Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Principal's Desk */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-rose-900 font-semibold">
                Principal's Communiqué
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
                Fostering Rigorous Minds & Resilient Characters
              </h2>
            </div>

            <div className="text-stone-600 space-y-4 text-sm sm:text-base leading-relaxed">
              <p>
                "At Nduluni High School, every student is recognized as a leader in incubation. From our state-of-the-art science laboratories to our lush sports grounds, we provide an ecosystem where discipline meets curiosity."
              </p>
              <p>
                "Through our new 2026 digital infrastructure, parents now enjoy instant access to terminal report forms, real-time fee reconciliation via automated M-Pesa channels, and transparent academic monitoring. We welcome our returning scholars and the newly joined Form One cohort to another transformative academic term."
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{SCHOOL_INFO.principalName}</h4>
                <p className="text-xs text-stone-500">{SCHOOL_INFO.principalTitle}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-stone-400">Office of the Chief Principal</span>
                <p className="text-xs text-emerald-700 font-medium">BOM & MoE Verified</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Feature Box */}
          <div className="lg:col-span-5 bg-stone-100 p-6 rounded-2xl border border-stone-200 space-y-5">
            <div className="relative rounded-xl overflow-hidden aspect-video shadow-sm">
              <img 
                src="/src/assets/images/nduluni_students_library_1790759068789.jpg" 
                alt="Nduluni High School Students in Library"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-stone-900 text-base font-display">
                Three Pillars of Nduluni Excellence
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
                  <span><strong>Holistic STEM Curriculum:</strong> Modern physics, chemistry, biology labs and computer-assisted learning suites.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
                  <span><strong>Discipline & Mentorship:</strong> Rigorous pastoral guidance, house mentorship system, and student leadership councils.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
                  <span><strong>Parental Partnership:</strong> Transparent terminal grade reports, instant fee tracking, and regular academic clinics.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Announcements & Official Ministry Circulars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-stone-200 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                Official Notices & Circulars
              </span>
              <h2 className="text-2xl font-bold text-stone-900 font-display mt-1">
                Latest School Bulletins
              </h2>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-rose-900 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Academic Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ANNOUNCEMENTS.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-6 rounded-xl border border-stone-200 hover:border-stone-300 transition-shadow shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-rose-900">{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">{item.author}</span>
                  <span className="font-semibold text-rose-900">MoE Circular</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Feature Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => onNavigate('portal')}
            className="p-6 bg-gradient-to-br from-stone-900 to-rose-950 text-white rounded-xl cursor-pointer hover:shadow-md transition-transform hover:-translate-y-0.5 space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display">Student & Parent Portal</h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Check real-time academic report cards, class attendance, weekly timetables, and download KCSE exam slips.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Open Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('fees')}
            className="p-6 bg-gradient-to-br from-emerald-950 to-stone-900 text-white rounded-xl cursor-pointer hover:shadow-md transition-transform hover:-translate-y-0.5 space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display">Online Fee Payment System</h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Instant M-PESA STK Push payment, bank deposit reconciliation, and instant verified PDF receipts.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Pay via M-Pesa 522123</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('calendar')}
            className="p-6 bg-gradient-to-br from-stone-800 to-stone-900 text-white rounded-xl cursor-pointer hover:shadow-md transition-transform hover:-translate-y-0.5 space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sky-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display">2026 Academic Calendar</h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Full term schedules, KNEC examination dates, parents academic clinics, and inter-school sports fixtures.
            </p>
            <div className="pt-2 text-xs font-semibold text-sky-400 flex items-center gap-1">
              <span>View Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
