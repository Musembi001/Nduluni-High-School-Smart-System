import React from 'react';
import { useAuth, PRESET_ROLES, UserRole } from '../context/AuthContext';
import { 
  Shield, 
  UserCheck, 
  GraduationCap, 
  CreditCard, 
  Award, 
  Check, 
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { currentUser, loginAsRole, isAuthModalOpen, setIsAuthModalOpen } = useAuth();

  if (!isAuthModalOpen) return null;

  const rolesList: {
    key: 'principal' | 'bursar' | 'teacher' | 'parent';
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    badgeColor: string;
    icon: any;
  }[] = [
    {
      key: 'principal',
      title: 'Chief Principal & Super Admin',
      subtitle: 'Mrs. Margaret M. Musyoka, OGW',
      description: 'Executive governance: approve published term KCSE grades, trigger mass SMS broadcasts to all guardians, view full school financial audits.',
      badge: 'Level 1: Super Admin',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      icon: Shield
    },
    {
      key: 'bursar',
      title: 'Senior Bursar & Finance Dept',
      subtitle: 'Mr. Julius Mutua',
      description: 'Accounts management: reconcile M-Pesa Paybill 522123 collections, verify bank deposit slips, issue official receipts, monitor Africa\'s Talking SMS delivery.',
      badge: 'Level 2: Financial Officer',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: CreditCard
    },
    {
      key: 'teacher',
      title: 'TSC Teacher / Academic HOD',
      subtitle: 'Mr. Dennis Ochieng (TSC #412093)',
      description: 'Academic grading: input & edit CAT 1, CAT 2, and End-Term scores, compute KCSE points & mean grades, print stream broadsheets.',
      badge: 'Level 3: Academic Faculty',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Award
    },
    {
      key: 'parent',
      title: 'Parent & Scholar Portal',
      subtitle: 'Patrick Musyoki / Brian Mutua',
      description: 'Student & guardian view: access authenticated terminal KCSE report forms, check fee balance, and execute instant online M-Pesa fee payments.',
      badge: 'Level 4: Scholar & Guardian',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      icon: GraduationCap
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-900 border border-rose-200">
              <Lock className="w-3 h-3 text-rose-800" />
              <span>Role-Based Access Control (RBAC) System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              Switch Institutional Access Role
            </h2>
            <p className="text-xs text-stone-500">
              Select any role below to experience live role-dependent views and permission controls in real time.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rolesList.map((item) => {
            const Icon = item.icon;
            const isSelected = currentUser.role === PRESET_ROLES[item.key].role;

            return (
              <div
                key={item.key}
                onClick={async () => {
                  await loginAsRole(item.key);
                  setIsAuthModalOpen(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 flex flex-col justify-between ${
                  isSelected
                    ? 'border-rose-950 bg-rose-50/50 ring-2 ring-rose-900/20 shadow-sm'
                    : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-900">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-rose-900">
                  <span>{isSelected ? 'Currently Loaded' : 'Switch to this Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Active Permissions Inspection */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-stone-700">
            <span>Logged in as: <strong>{currentUser.name}</strong></span>
            <span className="text-emerald-800 font-bold">[{currentUser.role}]</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Permissions granted: {currentUser.permissions.join(' · ')}
          </div>
        </div>
      </div>
    </div>
  );
};
