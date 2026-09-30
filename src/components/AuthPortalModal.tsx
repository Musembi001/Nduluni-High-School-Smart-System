import React, { useState } from 'react';
import { useAuth, PRESET_ROLES, UserRole } from '../context/AuthContext';
import { 
  Shield, 
  CreditCard, 
  Award, 
  GraduationCap, 
  Lock, 
  Check, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Key, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const AuthPortalModal: React.FC = () => {
  const { currentUser, loginAsRole, registerAccount, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Registration Form State
  const [regRole, setRegRole] = useState<UserRole>('STUDENT_PARENT');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAdmNo, setRegAdmNo] = useState('');
  const [regTscNo, setRegTscNo] = useState('');
  const [regStaffId, setRegStaffId] = useState('');
  const [regDepartment, setRegDepartment] = useState('Mathematics');
  const [regAuthKey, setRegAuthKey] = useState('');
  
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your username, admission number, or TSC number.');
      return;
    }
    setIsSubmittingLogin(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginIdentifier.trim(),
          password: loginPassword || 'password123'
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Find matching preset key or reload
        const roleKey = json.user.role.toLowerCase().includes('principal') ? 'principal'
          : json.user.role.toLowerCase().includes('bursar') ? 'bursar'
          : json.user.role.toLowerCase().includes('teacher') ? 'teacher' : 'parent';
        
        await loginAsRole(roleKey as any);
        setIsAuthModalOpen(false);
      } else {
        setLoginError(json.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError('Communication error with authentication gateway.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);
    setIsRegistering(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: regRole,
          name: regName,
          username: regUsername || (regAdmNo || regTscNo || regStaffId || regName.toLowerCase().replace(/\s+/g, '.')),
          password: regPassword,
          phone: regPhone,
          email: regEmail,
          admissionNo: regAdmNo,
          tscNumber: regTscNo,
          staffId: regStaffId,
          department: regDepartment,
          authorizationKey: regAuthKey
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setRegSuccess(`Account provisioned successfully for ${json.user.name} (${json.user.roleTitle})! Logging you in...`);
        setTimeout(async () => {
          const roleKey = regRole.toLowerCase().includes('principal') ? 'principal'
            : regRole.toLowerCase().includes('bursar') ? 'bursar'
            : regRole.toLowerCase().includes('teacher') ? 'teacher' : 'parent';
          await loginAsRole(roleKey as any);
          setIsAuthModalOpen(false);
        }, 1200);
      } else {
        setRegError(json.error || 'Registration failed. Check access requirements.');
      }
    } catch (err) {
      setRegError('Server error processing registration.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-900 border border-rose-200">
              <Shield className="w-3 h-3 text-rose-800" />
              <span>Nduluni High School Identity & Access Management</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              Institutional Portal Access
            </h2>
            <p className="text-xs text-stone-500">
              Sign in with institutional credentials or register an authenticated role profile.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Your Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-rose-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-rose-800" />
            <span>Register New Institutional Role</span>
          </button>
        </div>

        {/* TAB 1: SIGN IN & 1-CLICK ROLE SWITCHER */}
        {activeTab === 'signin' && (
          <div className="space-y-6">
            {/* Quick 1-Click Institutional Demo Profiles */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">
                Instant 1-Click Role Switcher (Select to View Role Dashboard):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: 'principal',
                    role: 'PRINCIPAL',
                    title: 'Chief Principal',
                    subtitle: 'Mrs. Margaret M. Musyoka, OGW',
                    badge: 'Executive Super Admin',
                    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
                    icon: Shield
                  },
                  {
                    key: 'bursar',
                    role: 'BURSAR',
                    title: 'Senior Bursar',
                    subtitle: 'Mr. Julius Mutua',
                    badge: 'Finance & M-Pesa Hub',
                    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                    icon: CreditCard
                  },
                  {
                    key: 'teacher',
                    role: 'TEACHER',
                    title: 'TSC Teacher (HOD)',
                    subtitle: 'Mr. Dennis Ochieng (TSC #412093)',
                    badge: 'Marks & Academic Desk',
                    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                    icon: Award
                  },
                  {
                    key: 'parent',
                    role: 'STUDENT_PARENT',
                    title: 'Parent & Scholar',
                    subtitle: 'Patrick Musyoki / Brian Mutua',
                    badge: 'Report Card & Fees',
                    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
                    icon: GraduationCap
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = currentUser.role === item.role;

                  return (
                    <div
                      key={item.key}
                      onClick={async () => {
                        await loginAsRole(item.key as any);
                        setIsAuthModalOpen(false);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-rose-950 bg-rose-50/60 ring-2 ring-rose-900/20 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-stone-900">{item.title}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium">{item.subtitle}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-rose-950 text-white flex items-center justify-center text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Standard Credentials Sign In Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 pt-4 border-t border-stone-200 text-xs">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">
                Or Sign In with Individual Staff ID / Admission Number:
              </span>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Institutional Username / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. principal, bursar, NHS/3412/2023, TSC/412093"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Security Password
                  </label>
                  <input
                    type="password"
                    placeholder="Default demo pass: password123"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full py-2.5 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingLogin ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Authenticate Credentials & Open Dashboard</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTER NEW INSTITUTIONAL ROLE */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegistration} className="space-y-4 text-xs">
            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Step 1: Select Role */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Select Institutional Access Level to Register:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { role: 'STUDENT_PARENT' as UserRole, label: 'Parent / Scholar', icon: GraduationCap },
                  { role: 'TEACHER' as UserRole, label: 'TSC Teacher', icon: Award },
                  { role: 'BURSAR' as UserRole, label: 'Bursar / Accounts', icon: CreditCard },
                  { role: 'PRINCIPAL' as UserRole, label: 'Chief Principal', icon: Shield }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = regRole === item.role;
                  return (
                    <button
                      type="button"
                      key={item.role}
                      onClick={() => setRegRole(item.role)}
                      className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-rose-950 bg-rose-50 font-bold text-rose-950 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Role-Specific Verification Credentials */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-rose-900 font-bold block">
                Required Institutional Credentials:
              </span>

              {regRole === 'STUDENT_PARENT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Student Admission Number <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NHS/3890/2024"
                      value={regAdmNo}
                      onChange={(e) => setRegAdmNo(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Guardian Safaricom Phone Number <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0722 000 000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {regRole === 'TEACHER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      TSC Registration Number <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TSC/582104/K"
                      value={regTscNo}
                      onChange={(e) => setRegTscNo(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Teaching Subject Department
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Languages">Languages (English / Kiswahili)</option>
                      <option value="Sciences">Sciences (Biology / Physics / Chem)</option>
                      <option value="Humanities">Humanities (Hist / CRE / Geog)</option>
                      <option value="Technicals">Technicals & Applied (Agric / Business)</option>
                    </select>
                  </div>
                </div>
              )}

              {regRole === 'BURSAR' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Staff ID / Accounts Clearance Code <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NHS/ACC/2026"
                      value={regStaffId}
                      onChange={(e) => setRegStaffId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Finance Dept Passkey <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Passkey: BURSAR_FINANCE_2026"
                      value={regAuthKey}
                      onChange={(e) => setRegAuthKey(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {regRole === 'PRINCIPAL' && (
                <div className="space-y-2">
                  <label className="block font-semibold text-stone-700">
                    BOM / Ministry of Education Authorization Passkey <span className="text-rose-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter clearance key (Hint: BOM_NDULUNI_2026)"
                    value={regAuthKey}
                    onChange={(e) => setRegAuthKey(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-stone-500">
                    Restricted executive clearance required to authorize exam result publishing and school mass SMS dispatches.
                  </p>
                </div>
              )}
            </div>

            {/* Step 3: Account Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Legal Name <span className="text-rose-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel K. Mutua"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Desired Username / Login ID <span className="text-rose-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. samuel.mutua"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Password <span className="text-rose-700">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Choose a secure password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-2.5 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRegistering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Verify Institutional Rights & Create Account</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
