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
  phone?: string;
  email?: string;
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
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerAccount: (payload: any) => Promise<{ success: boolean; error?: string; pending?: boolean }>;
  updateAccount: (payload: { name: string; phone?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_ROLES.parent);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(async res => res.ok ? res.json() : null)
      .then(json => {
        if (json?.user) {
          setCurrentUser(json.user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => undefined);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Authentication failed.' };
      }
      setCurrentUser(json.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the authentication service.' };
    }
  };

  const registerAccount = async (payload: any): Promise<{ success: boolean; error?: string; pending?: boolean }> => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, pending: Boolean(json.pending) };
      }
      return { success: false, error: json.error || 'Registration failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server error' };
    }
  };

  const updateAccount = async (payload: { name: string; phone?: string; email?: string }) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) return { success: false, error: json.error || 'Settings could not be saved.' };
      setCurrentUser(json.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the account service.' };
    }
  };

  const logout = () => {
    fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => undefined);
    setCurrentUser(PRESET_ROLES.parent);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated) return false;
    if (currentUser.role === 'PRINCIPAL') return true;
    return currentUser.permissions.includes(permission) || currentUser.permissions.includes('ALL');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        isAuthenticated,
        login,
        registerAccount,
        updateAccount,
        logout,
        hasPermission,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSettingsOpen,
        setIsSettingsOpen
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
