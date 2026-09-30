import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { initializePostgresStore, readPostgresStore, writePostgresStore } from './postgresStore.js';

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

interface CredentialRecord {
  demoPassword?: string;
  passwordHash?: string;
  user: AuthUser;
}

export interface AccountRequest {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  roleTitle: string;
  admissionNo?: string;
  tscNumber?: string;
  staffId?: string;
  department?: string;
  phone?: string;
  email?: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface StoredAccountRequest extends AccountRequest {
  credential?: CredentialRecord;
}

interface SessionRecord {
  user: AuthUser;
  expiresAt: number;
}

const dynamicUsers: Record<string, CredentialRecord> = process.env.NODE_ENV === 'production'
  ? {}
  : Object.fromEntries(Object.entries(DEMO_USERS).map(([key, entry]) => [key, { demoPassword: entry.password, user: entry.user }]));
const accountRequests: StoredAccountRequest[] = [];
const authStorePath = path.resolve(process.cwd(), 'src/server/auth_accounts.json');
const AUTH_STORE_KEY = 'auth-data';
const sessions = new Map<string, SessionRecord>();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

async function saveAuthStore(): Promise<boolean> {
  const users = Object.fromEntries(
    Object.entries(dynamicUsers).filter(([username]) => !DEMO_USERS[username])
  );
  const store = { users, requests: accountRequests };
  if (process.env.NODE_ENV === 'production') {
    try {
      await writePostgresStore(AUTH_STORE_KEY, store);
      return true;
    } catch (error) {
      console.error('Unable to persist account records to PostgreSQL:', error);
      return false;
    }
  }
  try {
    fs.writeFileSync(authStorePath, JSON.stringify(store, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Unable to persist account records:', error);
    return false;
  }
}

try {
  if (process.env.NODE_ENV !== 'production' && fs.existsSync(authStorePath)) {
    const stored = JSON.parse(fs.readFileSync(authStorePath, 'utf-8')) as {
      users?: Record<string, CredentialRecord>;
      requests?: StoredAccountRequest[];
    };
    Object.assign(dynamicUsers, stored.users || {});
    accountRequests.push(...(stored.requests || []));
  }
} catch (error) {
  console.error('Unable to load account records:', error);
}

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, keyHex] = storedHash.split(':');
  if (!saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function initializeAuthStore(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return;
  await initializePostgresStore();

  const stored = await readPostgresStore<{
    users?: Record<string, CredentialRecord>;
    requests?: StoredAccountRequest[];
  }>(AUTH_STORE_KEY);
  if (stored) {
    Object.assign(dynamicUsers, stored.users || {});
    accountRequests.push(...(stored.requests || []));
  }

  const principalExists = Object.values(dynamicUsers).some(record => record.user.role === 'PRINCIPAL');
  if (!principalExists) {
    const username = process.env.INITIAL_PRINCIPAL_USERNAME?.trim().toLowerCase();
    const password = process.env.INITIAL_PRINCIPAL_PASSWORD;
    if (!username || !password || password.length < 12) {
      throw new Error('Set INITIAL_PRINCIPAL_USERNAME and a 12+ character INITIAL_PRINCIPAL_PASSWORD before production startup.');
    }
    const user: AuthUser = {
      id: randomBytes(16).toString('hex'),
      username,
      name: 'School Principal',
      role: 'PRINCIPAL',
      roleTitle: 'Chief Principal & School Administrator',
      permissions: ['ALL', 'APPROVE_RESULTS', 'BROADCAST_SMS', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS']
    };
    dynamicUsers[username] = { passwordHash: hashPassword(password), user };
    if (!(await saveAuthStore())) {
      delete dynamicUsers[username];
      throw new Error('Unable to provision the initial Principal in PostgreSQL.');
    }
  }
}

function matchesSecret(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const providedHash = createHash('sha256').update(provided).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export function createSession(user: AuthUser): string {
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { user, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function getAuthenticatedUser(req: Request): AuthUser | undefined {
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  const cookieToken = req.headers.cookie
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith('nduluni_session='))
    ?.slice('nduluni_session='.length);
  const token = bearerToken || cookieToken;
  if (!token) return undefined;

  const session = sessions.get(token);
  if (!session) return undefined;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return undefined;
  }
  return session.user;
}

export function revokeSession(req: Request): void {
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  const cookieToken = req.headers.cookie
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith('nduluni_session='))
    ?.slice('nduluni_session='.length);
  const token = bearerToken || cookieToken;
  if (token) sessions.delete(token);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!getAuthenticatedUser(req)) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  return next();
}

export function findUserByCredentials(identity: string, pass: string): AuthUser | null {
  const cleanId = identity.toLowerCase().trim();
  for (const key of Object.keys(dynamicUsers)) {
    const entry = dynamicUsers[key];
    if (DEMO_USERS[key] && process.env.NODE_ENV === 'production') continue;
    const matchesUser = entry.user.username.toLowerCase() === cleanId ||
                        (entry.user.admissionNo && entry.user.admissionNo.toLowerCase() === cleanId) ||
                        (entry.user.tscNumber && entry.user.tscNumber.toLowerCase() === cleanId) ||
                        (entry.user.staffId && entry.user.staffId.toLowerCase() === cleanId) ||
                        (entry.user.email && entry.user.email.toLowerCase() === cleanId);
    if (matchesUser) {
      const validPassword = entry.passwordHash
        ? verifyPassword(pass, entry.passwordHash)
        : process.env.NODE_ENV !== 'production' && entry.demoPassword === pass;
      if (validPassword) {
        return entry.user;
      }
    }
  }
  return null;
}

export function hasPendingAccountCredentials(identity: string, pass: string): boolean {
  const cleanId = identity.toLowerCase().trim();
  return accountRequests.some(request => {
    if (request.status !== 'PENDING' || !request.credential) return false;
    const user = request.credential.user;
    const matchesUser = [user.username, user.admissionNo, user.tscNumber, user.staffId, user.email]
      .some(value => value?.toLowerCase() === cleanId);
    return matchesUser && Boolean(request.credential.passwordHash) && verifyPassword(pass, request.credential.passwordHash!);
  });
}

export function getAccountRequests(): AccountRequest[] {
  return accountRequests.map(({ credential: _credential, ...request }) => request);
}

export async function updateAccountProfile(
  userId: string,
  updates: { name: string; phone?: string; email?: string }
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const entry = Object.values(dynamicUsers).find(record => record.user.id === userId);
  if (!entry || DEMO_USERS[entry.user.username]) {
    return { success: false, error: 'Demo accounts are read-only. Use an approved school account to update settings.' };
  }
  if (!updates.name.trim()) {
    return { success: false, error: 'Your name is required.' };
  }

  const previousUser = { ...entry.user };
  entry.user.name = updates.name.trim();
  entry.user.phone = updates.phone?.trim() || undefined;
  entry.user.email = updates.email?.trim().toLowerCase() || undefined;
  if (!(await saveAuthStore())) {
    Object.assign(entry.user, previousUser);
    return { success: false, error: 'Settings could not be saved to school storage. Please try again.' };
  }
  for (const session of sessions.values()) {
    if (session.user.id === userId) session.user = entry.user;
  }
  return { success: true, user: entry.user };
}

export async function reviewAccountRequest(id: string, decision: 'APPROVED' | 'REJECTED'): Promise<boolean> {
  const request = accountRequests.find(item => item.id === id && item.status === 'PENDING');
  if (!request) return false;

  const previousCredential = request.credential;
  const previousUser = decision === 'APPROVED' ? dynamicUsers[request.username] : undefined;
  if (decision === 'APPROVED' && request.credential) {
    dynamicUsers[request.username] = request.credential;
  }
  request.status = decision;
  delete request.credential;
  if (!(await saveAuthStore())) {
    request.status = 'PENDING';
    request.credential = previousCredential;
    if (previousUser) dynamicUsers[request.username] = previousUser;
    else delete dynamicUsers[request.username];
    return false;
  }
  return true;
}

export async function registerNewUser(payload: RegisterUserPayload): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  // Registration creates a request; the account is not usable until approved.
  if (!payload.name || !payload.username || !payload.password) {
    return { success: false, error: 'Full name, username/identifier, and password are required.' };
  }
  if (payload.password.length < 12) {
    return { success: false, error: 'Password must be at least 12 characters.' };
  }

  const cleanUser = payload.username.toLowerCase().trim();
  const identityInUse = Object.values(dynamicUsers).some(({ user }) =>
    [user.username, user.admissionNo, user.tscNumber, user.staffId, user.email]
      .some(value => value?.toLowerCase() === cleanUser)
  ) || accountRequests.some(request => request.status === 'PENDING' &&
    [request.username, request.admissionNo, request.tscNumber, request.staffId, request.email]
      .some(value => value?.toLowerCase() === cleanUser));
  if (identityInUse) {
    return { success: false, error: 'An account with this username or identifier already exists.' };
  }

  let roleTitle = 'Registered Scholar / Guardian';
  let permissions: string[] = [];

  switch (payload.role) {
    case 'PRINCIPAL':
      return { success: false, error: 'Principal accounts can only be provisioned by an existing Principal.' };

    case 'BURSAR':
      if (!payload.staffId?.trim()) {
        return { success: false, error: 'A school-issued staff ID is required for Bursar registration.' };
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

  const request: StoredAccountRequest = {
    id: randomBytes(16).toString('hex'),
    name: newUser.name,
    username: newUser.username,
    role: newUser.role,
    roleTitle: newUser.roleTitle,
    admissionNo: newUser.admissionNo,
    tscNumber: newUser.tscNumber,
    staffId: newUser.staffId,
    department: newUser.department,
    phone: newUser.phone,
    email: newUser.email,
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
    credential: { passwordHash: hashPassword(payload.password), user: newUser }
  };
  accountRequests.push(request);
  if (!(await saveAuthStore())) {
    accountRequests.pop();
    return { success: false, error: 'Account request could not be saved. Please try again.' };
  }

  return { success: true, user: newUser };
}

// Express Middleware for Role-Based Authorization
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (allowedRoles.includes(user.role) || user.role === 'PRINCIPAL') {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access Denied: Your account role does not have permission to execute this administrative action.',
      requiredRoles: allowedRoles,
      currentRole: user.role
    });
  };
}
