import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'PRINCIPAL' | 'BURSAR' | 'TEACHER' | 'STUDENT_PARENT';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department?: string;
  admissionNo?: string;
  tscNumber?: string;
  permissions: string[];
}

export const PRESET_ROLES: Record<string, UserProfile> = {
  parent: {
    id: 'usr-parent-04',
    username: 'parent',
    name: 'Patrick Musyoki (Parent) / Brian Mutua',
    role: 'STUDENT_PARENT',
    roleTitle: 'Parent & Student Portal (Form 3 West)',
    admissionNo: 'NHS/3412/2023',
    permissions: ['VIEW_OWN_REPORT', 'PAY_FEES', 'VIEW_OWN_STATEMENT', 'DOWNLOAD_SLIPS']
  },
  teacher: {
    id: 'usr-teacher-03',
    username: 'teacher',
    name: 'Mr. Dennis Ochieng',
    role: 'TEACHER',
    roleTitle: 'HOD Mathematics & Form 3 West Class Teacher',
    department: 'Mathematics',
    tscNumber: 'TSC/412093/K',
    permissions: ['ENTER_MARKS', 'EDIT_CAT_SCORES', 'VIEW_BROADSHEET', 'PRINT_REPORTS']
  },
  bursar: {
    id: 'usr-bursar-02',
    username: 'bursar',
    name: 'Mr. Julius Mutua',
    role: 'BURSAR',
    roleTitle: 'Senior Bursar & Head of Accounts',
    permissions: ['VIEW_FINANCES', 'RECONCILE_PAYMENTS', 'MANAGE_FEES', 'VIEW_SMS_LOGS', 'CLEAR_VOUCHERS']
  },
  principal: {
    id: 'usr-principal-01',
    username: 'principal',
    name: 'Mrs. Margaret M. Musyoka, OGW',
    role: 'PRINCIPAL',
    roleTitle: 'Chief Principal & Secretary to Board of Management',
    permissions: ['ALL', 'APPROVE_RESULTS', 'BROADCAST_SMS', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS']
  }
};

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  token: string;
  loginAsRole: (roleKey: 'principal' | 'bursar' | 'teacher' | 'parent') => Promise<void>;
  registerAccount: (payload: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nduluni_auth_user');
    return saved ? JSON.parse(saved) : PRESET_ROLES.parent;
  });

  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('nduluni_auth_token') || 'token-parent-default';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loginAsRole = async (roleKey: 'principal' | 'bursar' | 'teacher' | 'parent') => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: roleKey, password: 'password123' })
      });
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.user);
        setToken(json.token);
        localStorage.setItem('nduluni_auth_user', JSON.stringify(json.user));
        localStorage.setItem('nduluni_auth_token', json.token);
      } else {
        const profile = PRESET_ROLES[roleKey];
        setCurrentUser(profile);
        localStorage.setItem('nduluni_auth_user', JSON.stringify(profile));
      }
    } catch (e) {
      const profile = PRESET_ROLES[roleKey];
      setCurrentUser(profile);
      localStorage.setItem('nduluni_auth_user', JSON.stringify(profile));
    }
  };

  const registerAccount = async (payload: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCurrentUser(json.user);
        setToken(json.token);
        localStorage.setItem('nduluni_auth_user', JSON.stringify(json.user));
        localStorage.setItem('nduluni_auth_token', json.token);
        return { success: true };
      }
      return { success: false, error: json.error || 'Registration failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server error' };
    }
  };

  const logout = () => {
    setCurrentUser(PRESET_ROLES.parent);
    localStorage.removeItem('nduluni_auth_user');
    localStorage.removeItem('nduluni_auth_token');
  };

  const hasPermission = (permission: string): boolean => {
    if (currentUser.role === 'PRINCIPAL') return true;
    return currentUser.permissions.includes(permission) || currentUser.permissions.includes('ALL');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        token,
        loginAsRole,
        registerAccount,
        logout,
        hasPermission,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
