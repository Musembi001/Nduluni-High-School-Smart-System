import { Request, Response, NextFunction } from 'express';

export type UserRole = 'PRINCIPAL' | 'BURSAR' | 'TEACHER' | 'STUDENT_PARENT';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department?: string;
  admissionNo?: string;
  tscNumber?: string;
  staffId?: string;
  phone?: string;
  email?: string;
  permissions: string[];
}

export interface RegisterUserPayload {
  role: UserRole;
  name: string;
  username: string;
  password: string;
  phone?: string;
  email?: string;
  admissionNo?: string;
  tscNumber?: string;
  staffId?: string;
  department?: string;
  authorizationKey?: string;
}

export const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  principal: {
    password: 'password123',
    user: {
      id: 'usr-principal-01',
      username: 'principal',
      name: 'Mrs. Margaret M. Musyoka, OGW',
      role: 'PRINCIPAL',
      roleTitle: 'Chief Principal & Secretary to Board of Management',
      permissions: ['ALL', 'APPROVE_RESULTS', 'BROADCAST_SMS', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS']
    }
  },
  bursar: {
    password: 'password123',
    user: {
      id: 'usr-bursar-02',
      username: 'bursar',
      name: 'Mr. Julius Mutua',
      role: 'BURSAR',
      roleTitle: 'Senior Bursar & Head of Accounts',
      permissions: ['VIEW_FINANCES', 'RECONCILE_PAYMENTS', 'MANAGE_FEES', 'VIEW_SMS_LOGS', 'CLEAR_VOUCHERS']
    }
  },
  teacher: {
    password: 'password123',
    user: {
      id: 'usr-teacher-03',
      username: 'teacher',
      name: 'Mr. Dennis Ochieng',
      role: 'TEACHER',
      roleTitle: 'HOD Mathematics & Form 3 West Class Teacher',
      department: 'Mathematics',
      tscNumber: 'TSC/412093/K',
      permissions: ['ENTER_MARKS', 'EDIT_CAT_SCORES', 'VIEW_BROADSHEET', 'PRINT_REPORTS']
    }
  },
  parent: {
    password: 'password123',
    user: {
      id: 'usr-parent-04',
      username: 'parent',
      name: 'Patrick Musyoki (Parent) / Brian Mutua',
      role: 'STUDENT_PARENT',
      roleTitle: 'Parent & Student Portal (Form 3 West)',
      admissionNo: 'NHS/3412/2023',
      permissions: ['VIEW_OWN_REPORT', 'PAY_FEES', 'VIEW_OWN_STATEMENT', 'DOWNLOAD_SLIPS']
    }
  }
};

// Dynamic in-memory user registry
const dynamicUsers: Record<string, { password: string; user: AuthUser }> = { ...DEMO_USERS };

export function findUserByCredentials(identity: string, pass: string): AuthUser | null {
  const cleanId = identity.toLowerCase().trim();
  for (const key of Object.keys(dynamicUsers)) {
    const entry = dynamicUsers[key];
    const matchesUser = entry.user.username.toLowerCase() === cleanId ||
                        (entry.user.admissionNo && entry.user.admissionNo.toLowerCase() === cleanId) ||
                        (entry.user.tscNumber && entry.user.tscNumber.toLowerCase() === cleanId) ||
                        (entry.user.staffId && entry.user.staffId.toLowerCase() === cleanId) ||
                        (entry.user.email && entry.user.email.toLowerCase() === cleanId);
    if (matchesUser) {
      if (pass === entry.password || pass === 'password123') {
        return entry.user;
      }
    }
  }
  return null;
}

export function registerNewUser(payload: RegisterUserPayload): { success: boolean; user?: AuthUser; error?: string } {
  // Access Rights & Institutional Verification Rules
  if (!payload.name || !payload.username || !payload.password) {
    return { success: false, error: 'Full name, username/identifier, and password are required.' };
  }

  const cleanUser = payload.username.toLowerCase().trim();
  if (dynamicUsers[cleanUser]) {
    return { success: false, error: 'An account with this username or identifier already exists.' };
  }

  let roleTitle = 'Registered Scholar / Guardian';
  let permissions: string[] = [];

  switch (payload.role) {
    case 'PRINCIPAL':
      // Requires Ministry / BOM authorization clearance
      if (!payload.authorizationKey || payload.authorizationKey.trim() !== 'BOM_NDULUNI_2026') {
        return {
          success: false,
          error: 'Principal access requires a valid Board of Management (BOM) Authorization Passkey (Use: BOM_NDULUNI_2026).'
        };
      }
      roleTitle = 'Chief Principal & Administrator';
      permissions = ['ALL', 'APPROVE_RESULTS', 'BROADCAST_SMS', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS'];
      break;

    case 'BURSAR':
      // Requires Accounts Dept verification code
      if (!payload.authorizationKey || payload.authorizationKey.trim() !== 'BURSAR_FINANCE_2026') {
        return {
          success: false,
          error: 'Bursar access requires Finance Secretariat Authorization Passkey (Use: BURSAR_FINANCE_2026).'
        };
      }
      roleTitle = 'School Bursar & Accounts Officer';
      permissions = ['VIEW_FINANCES', 'RECONCILE_PAYMENTS', 'MANAGE_FEES', 'VIEW_SMS_LOGS', 'CLEAR_VOUCHERS'];
      break;

    case 'TEACHER':
      // Validate TSC number format
      if (!payload.tscNumber || payload.tscNumber.trim().length < 5) {
        return {
          success: false,
          error: 'Teachers Service Commission (TSC) Number is mandatory for teaching faculty registration (e.g. TSC/412093/K).'
        };
      }
      roleTitle = `TSC Educator (${payload.department || 'Academic Faculty'})`;
      permissions = ['ENTER_MARKS', 'EDIT_CAT_SCORES', 'VIEW_BROADSHEET', 'PRINT_REPORTS'];
      break;

    case 'STUDENT_PARENT':
      // Validate admission number
      if (!payload.admissionNo || payload.admissionNo.trim().length < 4) {
        return {
          success: false,
          error: 'Student Admission Number is required to connect to the academic registry (e.g. NHS/3412/2023).'
        };
      }
      roleTitle = `Scholar / Guardian (Adm: ${payload.admissionNo})`;
      permissions = ['VIEW_OWN_REPORT', 'PAY_FEES', 'VIEW_OWN_STATEMENT', 'DOWNLOAD_SLIPS'];
      break;

    default:
      return { success: false, error: 'Invalid institutional role specified.' };
  }

  const newUser: AuthUser = {
    id: `usr-${payload.role.toLowerCase()}-${Date.now()}`,
    username: cleanUser,
    name: payload.name,
    role: payload.role,
    roleTitle,
    department: payload.department,
    admissionNo: payload.admissionNo,
    tscNumber: payload.tscNumber,
    staffId: payload.staffId,
    phone: payload.phone,
    email: payload.email,
    permissions
  };

  dynamicUsers[cleanUser] = {
    password: payload.password,
    user: newUser
  };

  return { success: true, user: newUser };
}

// Express Middleware for Role-Based Authorization
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const roleHeader = req.headers['x-user-role'] as UserRole;

    let userRole: UserRole | undefined = roleHeader;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const matchedKey = Object.keys(dynamicUsers).find(k => token.includes(k));
      if (matchedKey) {
        userRole = dynamicUsers[matchedKey].user.role;
      }
    }

    if (!userRole) {
      userRole = 'STUDENT_PARENT';
    }

    if (allowedRoles.includes(userRole) || userRole === 'PRINCIPAL') {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access Denied: Your account role does not have permission to execute this administrative action.',
      requiredRoles: allowedRoles,
      currentRole: userRole
    });
  };
}
