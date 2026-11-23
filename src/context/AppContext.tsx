import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  clampString,
  clampStringArray,
} from '../utils/firestoreValidators';
import type {
  PageId,
  UserProfile,
  TestAttempt,
  WritingSubmission,
  SpeakingSubmission,
  LeaderboardEntry,
  CustomContentItem,
  CEFRLevel,
} from '../types/ielts';
import { SEEDED_LEADERBOARD } from '../data/learningData';
import type { PlanDuration } from '../utils/studyPlanGenerator';

export interface ActiveStudyPlanState {
  id: string;
  durationDays: PlanDuration;
  currentLevel: CEFRLevel;
  targetBand: number;
  examDate: string;
  dailyMinutes: number;
  completedTaskIds: string[];
}

interface AppContextValue {
  page: PageId;
  setPage: (p: PageId) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
  isAdmin: boolean;
  adminVerifiedServer: boolean;
  profile: UserProfile;
  attempts: TestAttempt[];
  writingSubmissions: WritingSubmission[];
  speakingSubmissions: SpeakingSubmission[];
  leaderboard: LeaderboardEntry[];
  customContent: CustomContentItem[];
  studyPlan: ActiveStudyPlanState;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (patch: Partial<UserProfile>) => Promise<void>;
  recordAttempt: (attempt: Omit<TestAttempt, 'id' | 'userId' | 'createdAtIso' | 'status'>) => Promise<void>;
  saveWritingSubmission: (sub: Omit<WritingSubmission, 'id' | 'userId' | 'createdAtIso'>) => Promise<void>;
  saveSpeakingSubmission: (sub: Omit<SpeakingSubmission, 'id' | 'userId' | 'createdAtIso'>) => Promise<void>;
  toggleMasteredWord: (wordId: string) => Promise<void>;
  toggleFavoriteWord: (wordId: string) => Promise<void>;
  markGrammarCompleted: (lessonId: string) => Promise<void>;
  saveStudyPlanConfig: (plan: Omit<ActiveStudyPlanState, 'id'>) => Promise<void>;
  toggleStudyPlanTask: (taskId: string) => Promise<void>;
  publishCustomContent: (item: Omit<CustomContentItem, 'id' | 'authorId' | 'createdAtIso'>) => Promise<void>;
  deleteCustomContent: (id: string) => Promise<void>;
  allUsersAdmin: UserProfile[];
  toast: string | null;
  showToast: (msg: string) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  uid: 'guest-learner',
  email: 'guest@ieltsmaster.app',
  displayName: 'Guest Scholar',
  bio: 'Preparing for IELTS Academic Band 7.5+',
  role: 'student',
  plan: 'free',
  currentLevel: 'B2',
  targetBand: 7.5,
  examDate: '2027-02-15',
  dailyStudyMinutes: 90,
  dailyWordGoal: 15,
  xp: 640,
  streak: 5,
  studyHours: 14.5,
  masteredWordIds: ['v-ac-1', 'v-env-1', 'v-edu-2', 'v-wr-1'],
  favoriteWordIds: ['v-ac-2', 'v-sp-2'],
  completedGrammarIds: ['g-tenses', 'g-articles'],
  unlockedAchievementIds: ['ach-writing-improve'],
};

const SEEDED_ATTEMPTS: TestAttempt[] = [
  {
    id: 'demo-att-1',
    userId: 'guest-learner',
    type: 'listening',
    testId: 'listening-1',
    testTitle: 'IELTS Listening Practice Test 1',
    score: 31,
    maxScore: 40,
    estimatedBand: 7.0,
    listeningBand: 7.0,
    durationSeconds: 1620,
    status: 'completed',
    createdAtIso: '2026-11-18T14:20:00.000Z',
  },
  {
    id: 'demo-att-2',
    userId: 'guest-learner',
    type: 'reading',
    testId: 'reading-1',
    testTitle: 'IELTS Academic Reading Test 1',
    score: 33,
    maxScore: 40,
    estimatedBand: 7.5,
    readingBand: 7.5,
    durationSeconds: 3210,
    status: 'completed',
    createdAtIso: '2026-11-20T09:45:00.000Z',
  },
  {
    id: 'demo-att-3',
    userId: 'guest-learner',
    type: 'full_mock',
    testId: 'mock-1',
    testTitle: 'Full IELTS Mock Examination #1',
    score: 64,
    maxScore: 80,
    estimatedBand: 7.0,
    listeningBand: 7.0,
    readingBand: 7.5,
    writingBand: 6.5,
    speakingBand: 7.0,
    durationSeconds: 6180,
    status: 'completed',
    createdAtIso: '2026-11-21T16:10:00.000Z',
  },
];

const DEFAULT_STUDY_PLAN: ActiveStudyPlanState = {
  id: 'default-plan',
  durationDays: 30,
  currentLevel: 'B2',
  targetBand: 7.5,
  examDate: '2027-02-15',
  dailyMinutes: 90,
  completedTaskIds: ['d1-listening', 'd1-vocab', 'd2-reading'],
};

const AppContext = createContext<AppContextValue | null>(null);

function getInitialPage(): PageId {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const autostart = params.get('autostart');
  const pageParam = params.get('page') as PageId | null;
  const validPages: PageId[] = [
    'home', 'dashboard', 'listening', 'reading', 'writing', 'speaking',
    'mock-exams', 'vocabulary', 'grammar', 'study-plans', 'ai-writing',
    'ai-speaking', 'ai-tutor', 'band9-samples', 'leaderboard', 'articles',
    'profile', 'achievements', 'settings', 'admin',
  ];
  if (pageParam && validPages.includes(pageParam)) return pageParam;
  if (autostart === '1') return 'dashboard';
  return 'home';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPageState] = useState<PageId>(getInitialPage);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('ielts-master-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminVerifiedServer, setAdminVerifiedServer] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [attempts, setAttempts] = useState<TestAttempt[]>(SEEDED_ATTEMPTS);
  const [writingSubmissions, setWritingSubmissions] = useState<WritingSubmission[]>([]);
  const [speakingSubmissions, setSpeakingSubmissions] = useState<SpeakingSubmission[]>([]);
  const [firestoreLeaderboard, setFirestoreLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [customContent, setCustomContent] = useState<CustomContentItem[]>([]);
  const [studyPlan, setStudyPlan] = useState<ActiveStudyPlanState>(DEFAULT_STUDY_PLAN);
  const [allUsersAdmin, setAllUsersAdmin] = useState<UserProfile[]>([]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3600);
  }, []);

  const setPage = useCallback((next: PageId) => {
    setPageState(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('ielts-master-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const isAdmin = useMemo(() => {
    if (!firebaseUser) return false;
    return (
      adminVerifiedServer ||
      (firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() &&
        firebaseUser.emailVerified) ||
      profile.role === 'admin'
    );
  }, [firebaseUser, adminVerifiedServer, profile.role]);

  // Verify admin status via server endpoint when signed in
  useEffect(() => {
    if (!firebaseUser) {
      setAdminVerifiedServer(false);
      return;
    }
    let active = true;
    firebaseUser
      .getIdToken()
      .then((token) =>
        fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((r) => (r.ok ? r.json() : { authorized: false }))
      .then((data: { authorized?: boolean }) => {
        if (active) setAdminVerifiedServer(Boolean(data.authorized));
      })
      .catch(() => {
        if (active) setAdminVerifiedServer(false);
      });
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  // Auth listener + Firestore user profile bootstrap
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);

      if (!user) {
        setProfile(DEFAULT_PROFILE);
        setAttempts(SEEDED_ATTEMPTS);
        setWritingSubmissions([]);
        setSpeakingSubmissions([]);
        setStudyPlan(DEFAULT_STUDY_PLAN);
        setAllUsersAdmin([]);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            uid: user.uid,
            email: String(d.email ?? user.email ?? ''),
            displayName: String(d.displayName ?? user.displayName ?? 'IELTS Learner'),
            bio: String(d.bio ?? ''),
            role: d.role === 'admin' ? 'admin' : 'student',
            plan: d.plan === 'premium' ? 'premium' : 'free',
            currentLevel: (d.currentLevel as CEFRLevel) || 'B2',
            targetBand: Number(d.targetBand ?? 7.5),
            examDate: String(d.examDate ?? '2027-02-15'),
            dailyStudyMinutes: Number(d.dailyStudyMinutes ?? 90),
            dailyWordGoal: Number(d.dailyWordGoal ?? 15),
            xp: Number(d.xp ?? 0),
            streak: Number(d.streak ?? 1),
            studyHours: Number(d.studyHours ?? 0),
            masteredWordIds: Array.isArray(d.masteredWordIds) ? d.masteredWordIds : [],
            favoriteWordIds: Array.isArray(d.favoriteWordIds) ? d.favoriteWordIds : [],
            completedGrammarIds: Array.isArray(d.completedGrammarIds) ? d.completedGrammarIds : [],
            unlockedAchievementIds: Array.isArray(d.unlockedAchievementIds) ? d.unlockedAchievementIds : [],
          });
        } else if (user.emailVerified && user.email) {
          const initialName = clampString(user.displayName || user.email.split('@')[0], 100);
          await setDoc(userRef, {
            uid: user.uid,
            email: clampString(user.email, 200),
            displayName: initialName,
            bio: 'Preparing for IELTS with IELTS MASTER',
            role: 'student',
            plan: 'free',
            currentLevel: 'B2',
            targetBand: 7.5,
            examDate: '2027-02-15',
            dailyStudyMinutes: 90,
            dailyWordGoal: 15,
            xp: 100,
            streak: 1,
            studyHours: 0,
            masteredWordIds: [],
            favoriteWordIds: [],
            completedGrammarIds: [],
            unlockedAchievementIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await setDoc(doc(db, 'leaderboard', user.uid), {
            userId: user.uid,
            displayName: clampString(initialName, 80),
            xp: 100,
            weeklyXp: 100,
            monthlyXp: 100,
            streak: 1,
            bestBand: 0,
            mocksCompleted: 0,
            updatedAt: serverTimestamp(),
          });
          setProfile({
            ...DEFAULT_PROFILE,
            uid: user.uid,
            email: user.email,
            displayName: initialName,
            xp: 100,
            streak: 1,
            studyHours: 0,
            masteredWordIds: [],
            favoriteWordIds: [],
            completedGrammarIds: [],
            unlockedAchievementIds: [],
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Public published customContent listener (articles, announcements, admin-added items)
  useEffect(() => {
    const q = query(collection(db, 'customContent'), where('published', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: CustomContentItem[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            contentType: data.contentType,
            title: String(data.title ?? ''),
            category: String(data.category ?? ''),
            summary: String(data.summary ?? ''),
            body: String(data.body ?? ''),
            published: Boolean(data.published),
            authorId: String(data.authorId ?? ''),
            createdAtIso: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          };
        });
        setCustomContent(items);
      },
      (err) => {
        console.warn('Public customContent listener note:', err.message);
      }
    );
    return () => unsub();
  }, []);

  // Authenticated Firestore real-time listeners
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubAttempts = onSnapshot(
      query(collection(db, 'attempts'), where('userId', '==', uid)),
      (snap) => {
        const list: TestAttempt[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: String(data.userId),
              type: data.type,
              testId: String(data.testId),
              testTitle: String(data.testTitle),
              score: Number(data.score ?? 0),
              maxScore: Number(data.maxScore ?? 40),
              estimatedBand: Number(data.estimatedBand ?? 0),
              listeningBand: data.listeningBand != null ? Number(data.listeningBand) : undefined,
              readingBand: data.readingBand != null ? Number(data.readingBand) : undefined,
              writingBand: data.writingBand != null ? Number(data.writingBand) : undefined,
              speakingBand: data.speakingBand != null ? Number(data.speakingBand) : undefined,
              durationSeconds: Number(data.durationSeconds ?? 0),
              status: 'completed' as const,
              createdAtIso: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
            };
          })
          .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
        setAttempts(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'attempts')
    );

    const unsubWriting = onSnapshot(
      query(collection(db, 'writingSubmissions'), where('userId', '==', uid)),
      (snap) => {
        const list: WritingSubmission[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: String(data.userId),
              taskType: data.taskType,
              promptTitle: String(data.promptTitle),
              essayText: String(data.essayText),
              wordCount: Number(data.wordCount ?? 0),
              estimatedBand: Number(data.estimatedBand ?? 0),
              feedbackSummary: String(data.feedbackSummary ?? ''),
              createdAtIso: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
            };
          })
          .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
        setWritingSubmissions(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'writingSubmissions')
    );

    const unsubSpeaking = onSnapshot(
      query(collection(db, 'speakingSubmissions'), where('userId', '==', uid)),
      (snap) => {
        const list: SpeakingSubmission[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: String(data.userId),
              part: data.part,
              topicTitle: String(data.topicTitle),
              transcript: String(data.transcript),
              durationSeconds: Number(data.durationSeconds ?? 0),
              estimatedBand: Number(data.estimatedBand ?? 0),
              feedbackSummary: String(data.feedbackSummary ?? ''),
              createdAtIso: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
            };
          })
          .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
        setSpeakingSubmissions(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'speakingSubmissions')
    );

    const unsubPlan = onSnapshot(
      query(collection(db, 'studyPlans'), where('userId', '==', uid), limit(1)),
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data();
          setStudyPlan({
            id: d.id,
            durationDays: (data.durationDays as PlanDuration) || 30,
            currentLevel: (data.currentLevel as CEFRLevel) || 'B2',
            targetBand: Number(data.targetBand ?? 7.5),
            examDate: String(data.examDate ?? '2027-02-15'),
            dailyMinutes: Number(data.dailyMinutes ?? 90),
            completedTaskIds: Array.isArray(data.completedTaskIds) ? data.completedTaskIds : [],
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'studyPlans')
    );

    const unsubLeaderboard = onSnapshot(
      query(collection(db, 'leaderboard'), where('xp', '>=', 0), orderBy('xp', 'desc'), limit(25)),
      (snap) => {
        const rows: LeaderboardEntry[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            userId: String(data.userId),
            displayName: String(data.displayName),
            xp: Number(data.xp ?? 0),
            weeklyXp: Number(data.weeklyXp ?? 0),
            monthlyXp: Number(data.monthlyXp ?? 0),
            streak: Number(data.streak ?? 0),
            bestBand: Number(data.bestBand ?? 0),
            mocksCompleted: Number(data.mocksCompleted ?? 0),
          };
        });
        setFirestoreLeaderboard(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'leaderboard')
    );

    return () => {
      unsubAttempts();
      unsubWriting();
      unsubSpeaking();
      unsubPlan();
      unsubLeaderboard();
    };
  }, [authReady, firebaseUser]);

  // Admin-only user directory listener
  useEffect(() => {
    if (!authReady || !firebaseUser || !isAdmin) return;
    if (firebaseUser.email?.toLowerCase() !== BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) return;
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setAllUsersAdmin(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              ...DEFAULT_PROFILE,
              uid: d.id,
              email: String(data.email ?? ''),
              displayName: String(data.displayName ?? ''),
              role: data.role === 'admin' ? 'admin' : 'student',
              plan: data.plan === 'premium' ? 'premium' : 'free',
              currentLevel: (data.currentLevel as CEFRLevel) || 'B2',
              targetBand: Number(data.targetBand ?? 7.5),
              xp: Number(data.xp ?? 0),
              streak: Number(data.streak ?? 0),
              studyHours: Number(data.studyHours ?? 0),
            };
          })
        );
      },
      (err) => console.warn('Admin user list listener:', err.message)
    );
    return () => unsub();
  }, [authReady, firebaseUser, isAdmin]);

  const leaderboard = useMemo(() => {
    const merged = new Map<string, LeaderboardEntry>();
    for (const s of SEEDED_LEADERBOARD) merged.set(s.userId, s);
    for (const f of firestoreLeaderboard) merged.set(f.userId, f);
    if (!firebaseUser) {
      merged.set(profile.uid, {
        userId: profile.uid,
        displayName: `${profile.displayName} (You)`,
        xp: profile.xp,
        weeklyXp: Math.min(profile.xp, 340),
        monthlyXp: profile.xp,
        streak: profile.streak,
        bestBand: attempts.reduce((m, a) => Math.max(m, a.estimatedBand), 0),
        mocksCompleted: attempts.filter((a) => a.type === 'full_mock').length,
      });
    }
    return Array.from(merged.values()).sort((a, b) => b.xp - a.xp);
  }, [firestoreLeaderboard, firebaseUser, profile, attempts]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
    setAuthModalOpen(false);
    showToast('Signed in with Google. Your progress now syncs to Firestore.');
  }, [showToast]);

  const signInEmail = useCallback(async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    setAuthModalOpen(false);
    showToast('Signed in successfully.');
  }, [showToast]);

  const signUpEmail = useCallback(async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    setAuthModalOpen(false);
    showToast('Account created! Verify your email to enable full cloud sync.');
  }, [showToast]);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
    showToast('Password reset email dispatched.');
  }, [showToast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    showToast('Signed out.');
  }, [showToast]);

  const syncProfileToFirestore = useCallback(
    async (nextProfile: UserProfile) => {
      if (!firebaseUser || !firebaseUser.emailVerified) return;
      const userRef = doc(db, 'users', firebaseUser.uid);
      try {
        await updateDoc(userRef, {
          displayName: clampString(nextProfile.displayName, 100),
          bio: clampString(nextProfile.bio, 400),
          currentLevel: nextProfile.currentLevel,
          targetBand: nextProfile.targetBand,
          examDate: clampString(nextProfile.examDate, 32),
          dailyStudyMinutes: Math.max(15, Math.min(600, nextProfile.dailyStudyMinutes)),
          dailyWordGoal: Math.max(5, Math.min(200, nextProfile.dailyWordGoal)),
          xp: Math.max(0, Math.min(1000000, nextProfile.xp)),
          streak: Math.max(0, Math.min(3650, nextProfile.streak)),
          studyHours: Math.max(0, Math.min(50000, Number(nextProfile.studyHours.toFixed(1)))),
          masteredWordIds: clampStringArray(nextProfile.masteredWordIds, 500),
          favoriteWordIds: clampStringArray(nextProfile.favoriteWordIds, 500),
          completedGrammarIds: clampStringArray(nextProfile.completedGrammarIds, 100),
          unlockedAchievementIds: clampStringArray(nextProfile.unlockedAchievementIds, 100),
          updatedAt: serverTimestamp(),
        });

        await setDoc(
          doc(db, 'leaderboard', firebaseUser.uid),
          {
            userId: firebaseUser.uid,
            displayName: clampString(nextProfile.displayName, 80),
            xp: nextProfile.xp,
            weeklyXp: Math.min(100000, nextProfile.xp),
            monthlyXp: Math.min(300000, nextProfile.xp),
            streak: nextProfile.streak,
            bestBand: attempts.reduce((m, a) => Math.max(m, a.estimatedBand), 0),
            mocksCompleted: attempts.filter((a) => a.type === 'full_mock').length,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    },
    [firebaseUser, attempts]
  );

  const updateUserProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      const next: UserProfile = { ...profile, ...patch };
      setProfile(next);
      await syncProfileToFirestore(next);
      showToast('Profile settings saved.');
    },
    [profile, syncProfileToFirestore, showToast]
  );

  const recordAttempt = useCallback(
    async (attempt: Omit<TestAttempt, 'id' | 'userId' | 'createdAtIso' | 'status'>) => {
      const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const xpGain = attempt.type === 'full_mock' ? 250 : 120;
      const hoursGain = Math.max(0.1, Number((attempt.durationSeconds / 3600).toFixed(2)));

      const newUnlocked = new Set(profile.unlockedAchievementIds);
      if (attempt.type === 'full_mock') newUnlocked.add('ach-first-mock');
      if (attempt.type === 'reading' && attempt.estimatedBand >= 6.5) newUnlocked.add('ach-reading-10');

      const nextProfile: UserProfile = {
        ...profile,
        xp: profile.xp + xpGain,
        studyHours: Number((profile.studyHours + hoursGain).toFixed(1)),
        unlockedAchievementIds: Array.from(newUnlocked),
      };
      setProfile(nextProfile);

      if (!firebaseUser || !firebaseUser.emailVerified) {
        setAttempts((prev) => [
          {
            ...attempt,
            id,
            userId: profile.uid,
            status: 'completed',
            createdAtIso: new Date().toISOString(),
          },
          ...prev,
        ]);
        showToast(`Result saved! +${xpGain} XP earned.`);
        return;
      }

      try {
        const payload: Record<string, unknown> = {
          userId: firebaseUser.uid,
          type: attempt.type,
          testId: clampString(attempt.testId, 128),
          testTitle: clampString(attempt.testTitle, 200),
          score: attempt.score,
          maxScore: attempt.maxScore,
          estimatedBand: attempt.estimatedBand,
          durationSeconds: Math.max(0, Math.min(28800, Math.round(attempt.durationSeconds))),
          status: 'completed',
          createdAt: serverTimestamp(),
        };
        if (attempt.listeningBand != null) payload.listeningBand = attempt.listeningBand;
        if (attempt.readingBand != null) payload.readingBand = attempt.readingBand;
        if (attempt.writingBand != null) payload.writingBand = attempt.writingBand;
        if (attempt.speakingBand != null) payload.speakingBand = attempt.speakingBand;

        await setDoc(doc(db, 'attempts', id), payload);
        await syncProfileToFirestore(nextProfile);
        showToast(`Result synced to Firestore! +${xpGain} XP earned.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `attempts/${id}`);
      }
    },
    [firebaseUser, profile, syncProfileToFirestore, showToast]
  );

  const saveWritingSubmission = useCallback(
    async (sub: Omit<WritingSubmission, 'id' | 'userId' | 'createdAtIso'>) => {
      const id = `wr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newUnlocked = Array.from(new Set([...profile.unlockedAchievementIds, 'ach-writing-improve']));
      const nextProfile: UserProfile = {
        ...profile,
        xp: profile.xp + 100,
        studyHours: Number((profile.studyHours + 0.5).toFixed(1)),
        unlockedAchievementIds: newUnlocked,
      };
      setProfile(nextProfile);

      if (!firebaseUser || !firebaseUser.emailVerified) {
        setWritingSubmissions((prev) => [
          { ...sub, id, userId: profile.uid, createdAtIso: new Date().toISOString() },
          ...prev,
        ]);
        showToast('Writing submission saved! +100 XP.');
        return;
      }

      try {
        await setDoc(doc(db, 'writingSubmissions', id), {
          userId: firebaseUser.uid,
          taskType: sub.taskType,
          promptTitle: clampString(sub.promptTitle, 250),
          essayText: clampString(sub.essayText, 12000),
          wordCount: sub.wordCount,
          estimatedBand: sub.estimatedBand,
          feedbackSummary: clampString(sub.feedbackSummary, 4000),
          createdAt: serverTimestamp(),
        });
        await syncProfileToFirestore(nextProfile);
        showToast('Writing submission synced to Firestore! +100 XP.');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `writingSubmissions/${id}`);
      }
    },
    [firebaseUser, profile, syncProfileToFirestore, showToast]
  );

  const saveSpeakingSubmission = useCallback(
    async (sub: Omit<SpeakingSubmission, 'id' | 'userId' | 'createdAtIso'>) => {
      const id = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newUnlocked = Array.from(new Set([...profile.unlockedAchievementIds, 'ach-speaking-champ']));
      const nextProfile: UserProfile = {
        ...profile,
        xp: profile.xp + 90,
        studyHours: Number((profile.studyHours + 0.25).toFixed(1)),
        unlockedAchievementIds: newUnlocked,
      };
      setProfile(nextProfile);

      if (!firebaseUser || !firebaseUser.emailVerified) {
        setSpeakingSubmissions((prev) => [
          { ...sub, id, userId: profile.uid, createdAtIso: new Date().toISOString() },
          ...prev,
        ]);
        showToast('Speaking session saved! +90 XP.');
        return;
      }

      try {
        await setDoc(doc(db, 'speakingSubmissions', id), {
          userId: firebaseUser.uid,
          part: sub.part,
          topicTitle: clampString(sub.topicTitle, 200),
          transcript: clampString(sub.transcript, 8000),
          durationSeconds: Math.max(0, Math.min(1800, Math.round(sub.durationSeconds))),
          estimatedBand: sub.estimatedBand,
          feedbackSummary: clampString(sub.feedbackSummary, 4000),
          createdAt: serverTimestamp(),
        });
        await syncProfileToFirestore(nextProfile);
        showToast('Speaking session synced to Firestore! +90 XP.');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `speakingSubmissions/${id}`);
      }
    },
    [firebaseUser, profile, syncProfileToFirestore, showToast]
  );

  const toggleMasteredWord = useCallback(
    async (wordId: string) => {
      const exists = profile.masteredWordIds.includes(wordId);
      const nextIds = exists
        ? profile.masteredWordIds.filter((id) => id !== wordId)
        : [...profile.masteredWordIds, wordId];
      const nextAch =
        nextIds.length >= 10
          ? Array.from(new Set([...profile.unlockedAchievementIds, 'ach-vocab-100']))
          : profile.unlockedAchievementIds;
      const nextProfile: UserProfile = {
        ...profile,
        masteredWordIds: nextIds,
        xp: profile.xp + (exists ? 0 : 15),
        unlockedAchievementIds: nextAch,
      };
      setProfile(nextProfile);
      await syncProfileToFirestore(nextProfile);
    },
    [profile, syncProfileToFirestore]
  );

  const toggleFavoriteWord = useCallback(
    async (wordId: string) => {
      const exists = profile.favoriteWordIds.includes(wordId);
      const nextIds = exists
        ? profile.favoriteWordIds.filter((id) => id !== wordId)
        : [...profile.favoriteWordIds, wordId];
      const nextProfile: UserProfile = { ...profile, favoriteWordIds: nextIds };
      setProfile(nextProfile);
      await syncProfileToFirestore(nextProfile);
    },
    [profile, syncProfileToFirestore]
  );

  const markGrammarCompleted = useCallback(
    async (lessonId: string) => {
      if (profile.completedGrammarIds.includes(lessonId)) return;
      const nextProfile: UserProfile = {
        ...profile,
        completedGrammarIds: [...profile.completedGrammarIds, lessonId],
        xp: profile.xp + 60,
      };
      setProfile(nextProfile);
      await syncProfileToFirestore(nextProfile);
      showToast('Grammar lesson completed! +60 XP.');
    },
    [profile, syncProfileToFirestore, showToast]
  );

  const saveStudyPlanConfig = useCallback(
    async (planInput: Omit<ActiveStudyPlanState, 'id'>) => {
      const planId = firebaseUser ? `plan_${firebaseUser.uid}` : 'default-plan';
      const nextPlan: ActiveStudyPlanState = { ...planInput, id: planId };
      setStudyPlan(nextPlan);

      if (!firebaseUser || !firebaseUser.emailVerified) {
        showToast(`${planInput.durationDays}-day IELTS study plan generated.`);
        return;
      }

      try {
        const ref = doc(db, 'studyPlans', planId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          await updateDoc(ref, {
            durationDays: planInput.durationDays,
            currentLevel: planInput.currentLevel,
            targetBand: planInput.targetBand,
            examDate: clampString(planInput.examDate, 32),
            dailyMinutes: planInput.dailyMinutes,
            completedTaskIds: clampStringArray(planInput.completedTaskIds, 400),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(ref, {
            userId: firebaseUser.uid,
            durationDays: planInput.durationDays,
            currentLevel: planInput.currentLevel,
            targetBand: planInput.targetBand,
            examDate: clampString(planInput.examDate, 32),
            dailyMinutes: planInput.dailyMinutes,
            completedTaskIds: clampStringArray(planInput.completedTaskIds, 400),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        showToast(`${planInput.durationDays}-day study plan saved to Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `studyPlans/${planId}`);
      }
    },
    [firebaseUser, showToast]
  );

  const toggleStudyPlanTask = useCallback(
    async (taskId: string) => {
      const exists = studyPlan.completedTaskIds.includes(taskId);
      const nextCompleted = exists
        ? studyPlan.completedTaskIds.filter((id) => id !== taskId)
        : [...studyPlan.completedTaskIds, taskId];
      await saveStudyPlanConfig({
        durationDays: studyPlan.durationDays,
        currentLevel: studyPlan.currentLevel,
        targetBand: studyPlan.targetBand,
        examDate: studyPlan.examDate,
        dailyMinutes: studyPlan.dailyMinutes,
        completedTaskIds: nextCompleted,
      });
    },
    [studyPlan, saveStudyPlanConfig]
  );

  const publishCustomContent = useCallback(
    async (item: Omit<CustomContentItem, 'id' | 'authorId' | 'createdAtIso'>) => {
      if (!firebaseUser || !isAdmin) {
        showToast('Administrator privileges required to publish platform content.');
        return;
      }
      const id = `cnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        await setDoc(doc(db, 'customContent', id), {
          contentType: item.contentType,
          title: clampString(item.title, 200),
          category: clampString(item.category, 100),
          summary: clampString(item.summary, 1000),
          body: clampString(item.body, 20000),
          published: item.published,
          authorId: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast(`Published "${item.title}" to Firestore.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `customContent/${id}`);
      }
    },
    [firebaseUser, isAdmin, showToast]
  );

  const deleteCustomContent = useCallback(
    async (id: string) => {
      if (!firebaseUser || !isAdmin) return;
      try {
        await deleteDoc(doc(db, 'customContent', id));
        showToast('Content item removed.');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `customContent/${id}`);
      }
    },
    [firebaseUser, isAdmin, showToast]
  );

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        theme,
        toggleTheme,
        firebaseUser,
        authReady,
        isAdmin,
        adminVerifiedServer,
        profile,
        attempts,
        writingSubmissions,
        speakingSubmissions,
        leaderboard,
        customContent,
        studyPlan,
        authModalOpen,
        setAuthModalOpen,
        signInWithGoogle,
        signInEmail,
        signUpEmail,
        resetPassword,
        logout,
        updateUserProfile,
        recordAttempt,
        saveWritingSubmission,
        saveSpeakingSubmission,
        toggleMasteredWord,
        toggleFavoriteWord,
        markGrammarCompleted,
        saveStudyPlanConfig,
        toggleStudyPlanTask,
        publishCustomContent,
        deleteCustomContent,
        allUsersAdmin,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
