import React from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { GraduationCap, Shield, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="no-print bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1 & 2: School Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-display block leading-tight">
                  NDULUNI HIGH SCHOOL
                </span>
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-medium">
                  Public Boarding · KNEC Centre {SCHOOL_INFO.knecCode}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed font-sans max-w-sm">
              An extra-county public secondary school committed to nurturing disciplined, academically formidable, and morally upright scholars who excel nationally and globally.
            </p>

            <div className="p-3 bg-stone-900 rounded-lg border border-stone-800 text-xs text-stone-300 space-y-1 max-w-sm">
              <p className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">Official M-PESA Paybill</p>
              <div className="flex items-center justify-between font-mono">
                <span>Business No: <strong className="text-white">522123</strong></span>
                <span>Acc: <strong className="text-white">Adm Number</strong></span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Institutional Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('portal')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  Student & Parent Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('fees')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  Online Fee Payment (M-Pesa)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('calendar')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  2026 Academic Calendar
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('portal')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  Terminal KCSE Report Forms
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('academics')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  KCSE Performance Analysis
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Admissions & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Admissions & Welfare
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('admissions')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  Form 1 NEMIS Placement
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('admissions')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  Joining Instructions Booklet
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('campus')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  Boarding Houses & Facilities
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('campus')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  STEM Robotics & Drama Clubs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-300 transition-colors text-stone-400 cursor-pointer"
                >
                  Child Protection & Welfare Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Secretariat & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact Secretariat
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{SCHOOL_INFO.helplinePhone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{SCHOOL_INFO.officeEmail}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Nduluni, Eastern Kenya</span>
              </p>
              <p className="pt-2 text-[11px] text-stone-500 font-mono">
                P.O. Box 48 - 90130, Nduluni
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Kenyan Flag Bands & MoE accreditation */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Nduluni High School. All rights reserved. Registered under the Kenya Ministry of Education.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>KNEC Centre No. {SCHOOL_INFO.knecCode}</span>
            <span>·</span>
            <span>NEMIS Portal Verified</span>
            <span>·</span>
            <span>Extra-County Boarding</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
