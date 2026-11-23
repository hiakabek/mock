/**
 * Synchronized payload validation & sanitization aligned verbatim with firebase-blueprint.json
 * and firestore.rules volumetric & schema constraints.
 */

export const ID_REGEX = /^[a-zA-Z0-9_-]+$/;
export const VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const VALID_ROLES = ['student', 'admin'] as const;
export const VALID_PLANS = ['free', 'premium'] as const;
export const VALID_ATTEMPT_TYPES = ['listening', 'reading', 'writing', 'speaking', 'full_mock'] as const;
export const VALID_WRITING_TYPES = ['academic_task1', 'gt_task1', 'task2'] as const;
export const VALID_SPEAKING_PARTS = ['part1', 'part2', 'part3'] as const;
export const VALID_CONTENT_TYPES = [
  'listening',
  'reading',
  'writing',
  'speaking',
  'vocabulary',
  'grammar',
  'article',
  'announcement',
] as const;

export const BOOTSTRAP_ADMIN_EMAIL = 'ur.usmonov@gmail.com';

export function isValidDocumentId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

export function clampString(value: string, maxLength: number): string {
  return String(value ?? '').trim().slice(0, maxLength);
}

export function clampStringArray(arr: string[], maxLength: number): string[] {
  const unique = Array.from(new Set(arr.filter((v) => typeof v === 'string' && v.trim().length > 0)));
  return unique.slice(0, maxLength);
}

export interface AuthContextMock {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAdmin?: boolean;
}

export function validateUserProfileCreate(
  docId: string,
  payload: Record<string, unknown>,
  auth: AuthContextMock | null
): { valid: boolean; reason?: string } {
  if (!auth || !auth.emailVerified) return { valid: false, reason: 'PERMISSION_DENIED: unverified user' };
  if (!isValidDocumentId(docId)) return { valid: false, reason: 'PERMISSION_DENIED: invalid id' };
  if (docId !== auth.uid) return { valid: false, reason: 'PERMISSION_DENIED: not owner' };

  const allowed = new Set([
    'uid', 'email', 'displayName', 'bio', 'role', 'plan',
    'currentLevel', 'targetBand', 'examDate', 'dailyStudyMinutes',
    'dailyWordGoal', 'xp', 'streak', 'studyHours',
    'masteredWordIds', 'favoriteWordIds', 'completedGrammarIds',
    'unlockedAchievementIds', 'createdAt', 'updatedAt',
  ]);
  const required = [
    'uid', 'email', 'displayName', 'role', 'plan',
    'currentLevel', 'targetBand', 'xp', 'streak', 'studyHours',
    'createdAt', 'updatedAt',
  ];

  for (const key of Object.keys(payload)) {
    if (!allowed.has(key)) return { valid: false, reason: `PERMISSION_DENIED: shadow field ${key}` };
  }
  for (const req of required) {
    if (!(req in payload)) return { valid: false, reason: `PERMISSION_DENIED: missing ${req}` };
  }

  if (payload.uid !== auth.uid) return { valid: false, reason: 'PERMISSION_DENIED: uid mismatch' };
  if (payload.email !== auth.email) return { valid: false, reason: 'PERMISSION_DENIED: email mismatch' };
  if (payload.role !== 'student') return { valid: false, reason: 'PERMISSION_DENIED: role escalation blocked' };
  if (payload.plan !== 'free') return { valid: false, reason: 'PERMISSION_DENIED: plan escalation blocked' };
  if (typeof payload.displayName !== 'string' || payload.displayName.length < 1 || payload.displayName.length > 100) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid displayName' };
  }
  return { valid: true };
}

export function validateAttemptCreate(
  docId: string,
  payload: Record<string, unknown>,
  auth: AuthContextMock | null,
  serverTimeTag: string
): { valid: boolean; reason?: string } {
  if (!auth || !auth.emailVerified) return { valid: false, reason: 'PERMISSION_DENIED: unverified user' };
  if (!isValidDocumentId(docId)) return { valid: false, reason: 'PERMISSION_DENIED: invalid doc id' };
  if (payload.userId !== auth.uid) return { valid: false, reason: 'PERMISSION_DENIED: identity spoof' };
  if (payload.status !== 'completed') return { valid: false, reason: 'PERMISSION_DENIED: invalid status' };
  if (payload.createdAt !== serverTimeTag) return { valid: false, reason: 'PERMISSION_DENIED: timestamp forgery' };
  return { valid: true };
}

export function validateWritingCreate(
  docId: string,
  payload: Record<string, unknown>,
  auth: AuthContextMock | null,
  serverTimeTag: string
): { valid: boolean; reason?: string } {
  if (!auth || !auth.emailVerified) return { valid: false, reason: 'PERMISSION_DENIED: unverified' };
  if (!isValidDocumentId(docId)) return { valid: false, reason: 'PERMISSION_DENIED: invalid id' };
  if (payload.userId !== auth.uid) return { valid: false, reason: 'PERMISSION_DENIED: userId mismatch' };
  if (payload.createdAt !== serverTimeTag) return { valid: false, reason: 'PERMISSION_DENIED: timestamp forgery' };
  if (typeof payload.essayText !== 'string' || payload.essayText.length < 1 || payload.essayText.length > 12000) {
    return { valid: false, reason: 'PERMISSION_DENIED: essayText exceeds 12000 chars' };
  }
  return { valid: true };
}

export function validateStudyPlanUpdate(
  payload: Record<string, unknown>,
  existing: Record<string, unknown>,
  auth: AuthContextMock | null
): { valid: boolean; reason?: string } {
  if (!auth || !auth.emailVerified) return { valid: false, reason: 'PERMISSION_DENIED: unverified' };
  if (existing.userId !== auth.uid && !auth.isAdmin) return { valid: false, reason: 'PERMISSION_DENIED: not owner' };
  if (!Array.isArray(payload.completedTaskIds) || payload.completedTaskIds.length > 400) {
    return { valid: false, reason: 'PERMISSION_DENIED: completedTaskIds exceeds 400 limit' };
  }
  return { valid: true };
}

export function validateAdminWrite(auth: AuthContextMock | null): { valid: boolean; reason?: string } {
  if (!auth || !auth.emailVerified) return { valid: false, reason: 'PERMISSION_DENIED: email_verified required' };
  const isAdmin = auth.email === BOOTSTRAP_ADMIN_EMAIL || Boolean(auth.isAdmin);
  if (!isAdmin) return { valid: false, reason: 'PERMISSION_DENIED: admin role required' };
  return { valid: true };
}
