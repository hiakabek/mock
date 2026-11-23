import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUserProfileCreate,
  validateAttemptCreate,
  validateWritingCreate,
  validateStudyPlanUpdate,
  validateAdminWrite,
  BOOTSTRAP_ADMIN_EMAIL,
} from './src/utils/firestoreValidators';

const SERVER_TIME = '__SERVER_TIMESTAMP__';
const studentAuth = { uid: 'uid1', email: 'student@example.com', emailVerified: true };
const otherAuth = { uid: 'uid2', email: 'other@example.com', emailVerified: true };

const baseUserPayload = {
  uid: 'uid1',
  email: 'student@example.com',
  displayName: 'Aziza Karimova',
  role: 'student',
  plan: 'free',
  currentLevel: 'B2',
  targetBand: 7.5,
  xp: 0,
  streak: 1,
  studyHours: 0,
  createdAt: SERVER_TIME,
  updatedAt: SERVER_TIME,
};

test('Dirty Dozen #1: blocks role self-escalation on user profile create', () => {
  const res = validateUserProfileCreate('uid1', { ...baseUserPayload, role: 'admin' }, studentAuth);
  assert.equal(res.valid, false);
  assert.match(res.reason ?? '', /PERMISSION_DENIED/);
});

test('Dirty Dozen #2: blocks plan self-escalation on user profile create', () => {
  const res = validateUserProfileCreate('uid1', { ...baseUserPayload, plan: 'premium' }, studentAuth);
  assert.equal(res.valid, false);
  assert.match(res.reason ?? '', /PERMISSION_DENIED/);
});

test('Dirty Dozen #3: blocks shadow ghost field injection', () => {
  const res = validateUserProfileCreate('uid1', { ...baseUserPayload, isVerified: true }, studentAuth);
  assert.equal(res.valid, false);
  assert.match(res.reason ?? '', /shadow field/);
});

test('Dirty Dozen #4: blocks non-owner user profile creation / PII access', () => {
  const res = validateUserProfileCreate('uid1', baseUserPayload, otherAuth);
  assert.equal(res.valid, false);
});

test('Dirty Dozen #5: blocks identity spoofing on test attempt creation', () => {
  const res = validateAttemptCreate(
    'att_1',
    { userId: 'uid1', status: 'completed', createdAt: SERVER_TIME },
    otherAuth,
    SERVER_TIME
  );
  assert.equal(res.valid, false);
});

test('Dirty Dozen #7: blocks 200-char ID poisoning', () => {
  const poisonedId = 'a'.repeat(200);
  const res = validateAttemptCreate(
    poisonedId,
    { userId: 'uid1', status: 'completed', createdAt: SERVER_TIME },
    studentAuth,
    SERVER_TIME
  );
  assert.equal(res.valid, false);
});

test('Dirty Dozen #8: blocks forged backdated timestamps on writing submission', () => {
  const res = validateWritingCreate(
    'w_1',
    { userId: 'uid1', essayText: 'Valid academic essay.', createdAt: '2020-01-01T00:00:00Z' },
    studentAuth,
    SERVER_TIME
  );
  assert.equal(res.valid, false);
});

test('Dirty Dozen #9: blocks unverified admin email spoofing', () => {
  const spoofedAdmin = { uid: 'evil', email: BOOTSTRAP_ADMIN_EMAIL, emailVerified: false };
  const res = validateAdminWrite(spoofedAdmin);
  assert.equal(res.valid, false);
});

test('Dirty Dozen #10: blocks Denial-of-Wallet essay overflow (> 12000 chars)', () => {
  const res = validateWritingCreate(
    'w_2',
    { userId: 'uid1', essayText: 'x'.repeat(20000), createdAt: SERVER_TIME },
    studentAuth,
    SERVER_TIME
  );
  assert.equal(res.valid, false);
});

test('Dirty Dozen #11: blocks Study Plan array flood (> 400 items)', () => {
  const res = validateStudyPlanUpdate(
    { completedTaskIds: Array.from({ length: 600 }, (_, i) => `t${i}`) },
    { userId: 'uid1' },
    studentAuth
  );
  assert.equal(res.valid, false);
});

test('Valid student and verified bootstrap admin payloads pass validation', () => {
  assert.equal(validateUserProfileCreate('uid1', baseUserPayload, studentAuth).valid, true);
  assert.equal(
    validateAdminWrite({ uid: 'admin1', email: BOOTSTRAP_ADMIN_EMAIL, emailVerified: true }).valid,
    true
  );
});
