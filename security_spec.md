# IELTS MASTER — Firestore Security Specification

## 1. Data Invariants
1. **PII Isolation**: Private user documents (`/users/{userId}`) containing email, exam date, and personal settings are strictly readable and writable only by the authenticated owner (`request.auth.uid == userId`) or a verified Admin. Public rankings reside exclusively in `/leaderboard/{userId}` with zero PII.
2. **No Self-Escalation**: Standard users creating `/users/{userId}` must have `role == 'student'` and `plan == 'free'`, and cannot mutate `role`, `plan`, `uid`, or `createdAt` on update.
3. **Immutable Terminal Attempts**: Completed test/mock attempts (`/attempts/{attemptId}`) enter terminal state `status == 'completed'` on creation and cannot be altered by non-admin users.
4. **Admin Content Authority**: `/customContent/{contentId}` and `/admins/{userId}` writes are strictly restricted to verified Admins (`exists(/databases/$(database)/documents/admins/$(uid))` or verified bootstrap admin `ur.usmonov@gmail.com`).
5. **Temporal Integrity**: All `createdAt` and `updatedAt` timestamps must match `request.time`.
6. **Bounded Strings & Arrays**: Every string and array enforces explicit max size limits matching `firebase-blueprint.json`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Role Self-Escalation on Create**: Student creates `/users/uid1` with `{ role: "admin", plan: "free", ... }` -> MUST DENY.
2. **Plan Self-Escalation on Update**: Student updates `/users/uid1` changing `plan` from `"free"` to `"premium"` -> MUST DENY.
3. **Ghost Shadow Field Injection**: Student creates `/users/uid1` with extra field `isVerified: true` -> MUST DENY.
4. **PII Blanket Scrape**: Authenticated user `uid2` attempts `get` on `/users/uid1` -> MUST DENY.
5. **Identity Spoofing on Attempt**: User `uid2` creates `/attempts/att1` with `userId: "uid1"` -> MUST DENY.
6. **Terminal State Tampering**: User `uid1` updates `/attempts/att1` (`status: "completed"`) to inflate `estimatedBand: 9.0` -> MUST DENY.
7. **ID Poisoning**: User creates `/attempts/<200-char-invalid-id>` -> MUST DENY.
8. **Timestamp Forgery**: User creates `/writingSubmissions/w1` with backdated `createdAt` != `request.time` -> MUST DENY.
9. **Unverified Admin Email Spoof**: Request with `email: "ur.usmonov@gmail.com"` and `email_verified: false` attempts write to `/customContent/c1` -> MUST DENY.
10. **Denial-of-Wallet Essay Overflow**: User submits `/writingSubmissions/w1` with 20,000-char `essayText` (max 12,000) -> MUST DENY.
11. **Array Flood on Study Plan**: User updates `/studyPlans/p1` with 600 items in `completedTaskIds` (max 400) -> MUST DENY.
12. **Unauthorized List Scrape**: User `uid2` runs unfiltered list query on `/writingSubmissions` -> MUST DENY (rule enforces `resource.data.userId == request.auth.uid`).
