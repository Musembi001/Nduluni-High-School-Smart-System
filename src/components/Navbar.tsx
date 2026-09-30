import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  CreditCard, 
  Calendar, 
  BookOpen, 
  Menu, 
  X, 
  Phone, 
  ShieldCheck, 
  Building2, 
  FileText,
  UserCheck,
  Shield,
  Award,
  ChevronDown,
  LayoutDashboard,
  UserPlus
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, role, setIsAuthModalOpen } = useAuth();

  const getDashboardLabel = () => {
    switch (role) {
      case 'PRINCIPAL':
        return 'Executive Desk';
      case 'BURSAR':
        return 'Bursar Ledger';
      case 'TEACHER':
        return 'Teacher Marks Desk';
      default:
        return 'Student Portal';
    }
  };

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'my_dashboard', label: getDashboardLabel(), highlight: true },
    { id: 'fees', label: 'Online Fee Pay' },
    { id: 'library', label: 'Library & OPAC' },
    { id: 'calendar', label: 'Event Calendar' },
    { id: 'academics', label: 'Academics & KCSE' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'campus', label: 'Campus Life' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'PRINCIPAL':
        return { label: 'Chief Principal (Super Admin)', bg: 'bg-purple-900/60 text-purple-200 border-purple-500/40', icon: Shield };
      case 'BURSAR':
        return { label: 'Senior Bursar (Finance)', bg: 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40', icon: CreditCard };
      case 'TEACHER':
        return { label: 'TSC Teacher (HOD)', bg: 'bg-amber-900/60 text-amber-200 border-amber-500/40', icon: Award };
      default:
        return { label: 'Parent / Student', bg: 'bg-sky-900/60 text-sky-200 border-sky-500/40', icon: GraduationCap };
    }
  };

  const roleBadgeInfo = getRoleBadge();
  const RoleIcon = roleBadgeInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Institutional Utility Ribbon with Live RBAC Switcher */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 sm:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-rose-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Term 1, 2026 in Session
            </span>
            <span className="hidden sm:inline text-stone-500">|</span>
            <span className="hidden sm:inline text-stone-300">KNEC Centre: <span className="font-mono text-white">{SCHOOL_INFO.knecCode}</span></span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span className="hidden md:inline text-stone-300">County: {SCHOOL_INFO.county}</span>
          </div>

          <div className="flex items-center gap-3 text-stone-300">
            {/* Live Role & Registration Trigger Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer hover:brightness-125 ${roleBadgeInfo.bg}`}
              title="Click to switch role or register new institutional account"
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span>Role: {roleBadgeInfo.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            <span className="hidden sm:inline text-stone-500">|</span>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-amber-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3 h-3 text-amber-400" />
              <span>Register Account</span>
            </button>

            <span className="hidden sm:inline text-stone-500">|</span>

            <a href={`tel:${SCHOOL_INFO.helplinePhone}`} className="hover:text-white transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>{SCHOOL_INFO.helplinePhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Wordmark), Zone 2 (Nav Links), Zone 3 (Primary Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleNav('overview')} 
            className="text-left flex items-center gap-3 group focus:outline-none"
          >
            {/* School Crest Badge */}
            <div className="w-10 h-10 rounded-lg bg-rose-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shrink-0 group-hover:bg-rose-900 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-stone-900 font-display block leading-tight">
                NDULUNI HIGH SCHOOL
              </span>
              <span className="text-[11px] uppercase tracking-wider text-rose-800 font-medium hidden sm:block">
                Ministry of Education · Public Boarding
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                currentTab === link.id
                  ? 'text-rose-900 font-bold'
                  : link.highlight
                  ? 'text-rose-950 font-bold bg-rose-50 px-2.5 py-1 rounded-md'
                  : 'hover:text-stone-900'
              }`}
            >
              {link.label}
              {currentTab === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-900 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleNav('my_dashboard')}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-950 rounded-lg hover:bg-rose-900 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            <span>My {getDashboardLabel()}</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-1">
          <div className="p-3 mb-2 bg-stone-100 rounded-lg flex items-center justify-between text-xs">
            <span className="text-stone-600">Active Role:</span>
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="font-bold text-rose-900 underline"
            >
              {roleBadgeInfo.label} (Switch / Register)
            </button>
          </div>

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                currentTab === link.id
                  ? 'bg-rose-50 text-rose-900 font-semibold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <button
              onClick={() => handleNav('fees')}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-700"
            >
              Lipa Na M-PESA (Paybill {SCHOOL_INFO.mpesaPaybill})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
