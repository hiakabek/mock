import React, { useState } from 'react';
import {
  User,
  Award,
  CheckCircle2,
  Lock,
  Flame,
  Sun,
  Moon,
  LogOut,
  LogIn,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../data/learningData';
import type { CEFRLevel } from '../types/ielts';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    firebaseUser,
    attempts,
    writingSubmissions,
    speakingSubmissions,
    updateUserProfile,
    setAuthModalOpen,
    logout,
  } = useApp();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>(profile.currentLevel);
  const [targetBand, setTargetBand] = useState<number>(profile.targetBand);
  const [examDate, setExamDate] = useState(profile.examDate);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ displayName, bio, currentLevel, targetBand, examDate });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Candidate Account
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            User Profile
          </h1>
        </div>

        {firebaseUser ? (
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" />
            Sign In to Sync Cloud Progress
          </button>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total XP</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {profile.xp.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Tests Completed</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {attempts.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">AI Evaluations</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {writingSubmissions.length + speakingSubmissions.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Mastered Words</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {profile.masteredWordIds.length}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={(e) => void handleSave(e)}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{profile.displayName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {firebaseUser ? firebaseUser.email : 'Guest Preview Mode (Sign in to save across devices)'} · Role: {profile.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Display Name
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Target Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Current CEFR Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as CEFRLevel)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Target IELTS Band
            </label>
            <select
              value={targetBand}
              onChange={(e) => setTargetBand(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {[5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                <option key={b} value={b}>
                  Band {b.toFixed(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Learning Bio / Study Goal
          </label>
          <textarea
            rows={3}
            maxLength={400}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export const AchievementsPage: React.FC = () => {
  const { profile } = useApp();
  const unlockedCount = ACHIEVEMENTS_LIST.filter((a) =>
    profile.unlockedAchievementIds.includes(a.id)
  ).length;
  const level = Math.floor(profile.xp / 500) + 1;
  const xpInLevel = profile.xp % 500;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Milestones & Streaks
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Achievements & Progress Badges
        </h1>
      </div>

      {/* Level & Streak Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-[#0B172A] p-5 text-white md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                Candidate Rank
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tabular-nums">
                Level {level} Scholar
              </h2>
            </div>
            <span className="font-mono text-lg font-bold text-blue-300 tabular-nums">
              {profile.xp.toLocaleString()} XP
            </span>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.round((xpInLevel / 500) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-300 tabular-nums">
            {500 - xpInLevel} XP remaining until Level {level + 1} · {unlockedCount} of{' '}
            {ACHIEVEMENTS_LIST.length} badges unlocked
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-amber-500">
            <Flame className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Study Streak</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {profile.streak} Days
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Complete any daily drill or mock test to extend your streak.
          </p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS_LIST.map((ach) => {
          const unlocked = profile.unlockedAchievementIds.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`rounded-2xl border p-5 transition ${
                unlocked
                  ? 'border-blue-300 bg-white dark:border-blue-800 dark:bg-slate-900'
                  : 'border-slate-200 bg-slate-50/70 opacity-85 dark:border-slate-800 dark:bg-slate-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    unlocked
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {unlocked ? <Award className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    unlocked
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Unlocked
                    </>
                  ) : (
                    'Locked'
                  )}
                </span>
              </div>

              <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">
                {ach.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {ach.description}
              </p>
              <p className="mt-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {ach.category} · +{ach.xpReward} XP
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, profile, updateUserProfile, showToast } = useApp();
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyStudyMinutes);
  const [dailyWords, setDailyWords] = useState(profile.dailyWordGoal);
  const [billingNoteVisible, setBillingNoteVisible] = useState(false);

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      dailyStudyMinutes: dailyMinutes,
      dailyWordGoal: dailyWords,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Preferences & Plan
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Platform Settings
        </h1>
      </div>

      {/* Appearance */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Interface Appearance
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Switch between bright daylight mode and low-glare dark navy mode for evening exam prep.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-600" />}
          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      {/* Study Goals */}
      <form
        onSubmit={(e) => void handleSaveGoals(e)}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Daily Learning Targets
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Daily Study Minutes
            </label>
            <input
              type="number"
              min={15}
              max={600}
              step={15}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Daily Vocabulary Word Goal
            </label>
            <input
              type="number"
              min={5}
              max={200}
              step={5}
              value={dailyWords}
              onChange={(e) => setDailyWords(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Update Daily Goals
        </button>
      </form>

      {/* Subscription Plan Management */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Subscription & Plan Overview
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Current tier: <span className="font-semibold uppercase text-blue-600 dark:text-blue-400">{profile.plan}</span>
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Free Scholar · $0/mo
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li>· Full access to 20 Listening & 20 Reading tests</li>
              <li>· Writing & Speaking Practice Studios</li>
              <li>· Vocabulary Builder & Grammar Academy</li>
              <li>· Cloud progress sync via Firebase</li>
            </ul>
          </div>

          <div className="rounded-xl border border-blue-300 bg-blue-50/40 p-4 dark:border-blue-800 dark:bg-blue-950/20">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              IELTS MASTER Pro · $19/mo
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <li>· Unlimited AI Writing & Speaking evaluations</li>
              <li>· Priority AI Tutor sessions (EN & UZ)</li>
              <li>· Full Mock Exam analytics & longitudinal trends</li>
              <li>· Printable Band 9 Model Answer booklets</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setBillingNoteVisible(true);
                showToast('Live billing requires a configured payment gateway.');
              }}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

        {billingNoteVisible && (
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Payment checkout is intentionally disabled in this environment until a live payment gateway (such as Stripe) is connected on the server. All core study tools and AI evaluators remain accessible for evaluation without charging your card.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
