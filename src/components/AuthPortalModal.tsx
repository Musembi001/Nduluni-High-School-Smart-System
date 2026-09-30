import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { 
  Shield, 
  CreditCard, 
  Award, 
  GraduationCap, 
  Lock, 
  UserPlus, 
  LogIn, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const AuthPortalModal: React.FC = () => {
  const { login, registerAccount, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
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
      const result = await login(loginIdentifier.trim(), loginPassword);
      if (result.success) {
        setIsAuthModalOpen(false);
      } else {
        setLoginError(result.error || 'Authentication failed. Please verify credentials.');
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
      const result = await registerAccount({
          role: regRole,
          name: regName,
          username: regUsername || (regAdmNo || regTscNo || regStaffId || regName.toLowerCase().replace(/\s+/g, '.')),
          password: regPassword,
          phone: regPhone,
          email: regEmail,
          admissionNo: regAdmNo,
          tscNumber: regTscNo,
          staffId: regStaffId,
          department: regDepartment
      });

      if (result.success) {
        setRegSuccess('Request submitted. The school will verify your details and approve access. You can sign in once your account is approved.');
      } else {
        setRegError(result.error || 'Registration failed. Check access requirements.');
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
            {/* Standard Credentials Sign In Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold block">
                Sign in with your approved school account:
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
                    required
                    placeholder="Enter your password"
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
                  { role: 'STUDENT_PARENT' as UserRole, label: 'Parent / Student', icon: GraduationCap },
                  { role: 'TEACHER' as UserRole, label: 'Teacher', icon: Award },
                  { role: 'BURSAR' as UserRole, label: 'Bursar / Accounts', icon: CreditCard }
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
                </div>
              )}
              <p className="text-[11px] text-stone-500">Staff access is activated by the Principal after school records are checked. Principal accounts are created by the school, not through public registration.</p>
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
                  minLength={12}
                  placeholder="At least 12 characters"
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
