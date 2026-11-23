import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  Trash2,
  Users,
  FileText,
  BarChart3,
  LogIn,
} from 'lucide-react';
import { LISTENING_TESTS } from '../data/listeningTests';
import { READING_TESTS } from '../data/readingTests';
import { VOCABULARY_BANK, GRAMMAR_LESSONS, ARTICLES_BANK } from '../data/learningData';
import type { CustomContentItem } from '../types/ielts';
import { useApp } from '../context/AppContext';

const CONTENT_TYPES: { value: CustomContentItem['contentType']; label: string }[] = [
  { value: 'listening', label: 'Listening Test / Audio Notes' },
  { value: 'reading', label: 'Reading Passage' },
  { value: 'writing', label: 'Writing Task Prompt' },
  { value: 'speaking', label: 'Speaking Cue Card / Topic' },
  { value: 'vocabulary', label: 'Vocabulary Set' },
  { value: 'grammar', label: 'Grammar Lesson' },
  { value: 'article', label: 'Strategy Article' },
  { value: 'announcement', label: 'Platform Announcement' },
];

export const AdminDashboardPage: React.FC = () => {
  const {
    firebaseUser,
    isAdmin,
    adminVerifiedServer,
    customContent,
    publishCustomContent,
    deleteCustomContent,
    allUsersAdmin,
    attempts,
    setAuthModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'publish' | 'library' | 'users'>('publish');
  const [contentType, setContentType] = useState<CustomContentItem['contentType']>('article');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Exam Strategy');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [audioFileNote, setAudioFileNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const fullBody = audioFileNote.trim()
        ? `[Audio Reference: ${audioFileNote.trim()}]\n\n${body.trim()}`
        : body.trim();
      await publishCustomContent({
        contentType,
        title: title.trim(),
        category: category.trim() || 'General',
        summary: summary.trim() || title.trim(),
        body: fullBody,
        published: true,
      });
      setTitle('');
      setSummary('');
      setBody('');
      setAudioFileNote('');
      setActiveTab('library');
    } finally {
      setSubmitting(false);
    }
  };

  if (!firebaseUser || !isAdmin) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">
          Administrator Access Required
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The Admin Portal is protected by Firebase Authentication, Firestore Security Rules, and server-side token verification. Sign in with the authorized administrator account to publish IELTS tests, manage articles, or inspect platform user metrics.
        </p>
        {!firebaseUser && (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" />
            Sign In as Administrator
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            {adminVerifiedServer ? 'Server-Verified Admin Session' : 'Authenticated Admin Session'}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            IELTS MASTER Admin Panel
          </h1>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {(
            [
              { id: 'publish', label: 'Add Content', icon: PlusCircle },
              { id: 'library', label: `Published (${customContent.length})`, icon: FileText },
              { id: 'users', label: `Users (${allUsersAdmin.length})`, icon: Users },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Core Test Bank</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {LISTENING_TESTS.length + READING_TESTS.length} Tests
          </p>
          <p className="mt-0.5 text-xs text-slate-500">20 Listening · 20 Reading</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Academy Library</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {VOCABULARY_BANK.length + GRAMMAR_LESSONS.length + ARTICLES_BANK.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Words, Grammar & Guides</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Custom Published Items</p>
          <p className="mt-1 font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {customContent.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Live in Firestore</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Registered Learners</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {allUsersAdmin.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{attempts.length} recorded attempts</p>
        </div>
      </div>

      {/* Tab 1: Content Publisher */}
      {activeTab === 'publish' && (
        <form
          onSubmit={(e) => void handlePublish(e)}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            Publish New Educational Content to Firestore
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as CustomContentItem['contentType'])}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Category / Skill Tag
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Reading, Writing, Academic Vocabulary"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Title
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter original test, prompt, lesson, or article title..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Short Summary
            </label>
            <input
              type="text"
              maxLength={1000}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concise overview shown in cards and listings..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {contentType === 'listening' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Audio Track Reference / Script Metadata (Optional)
              </label>
              <input
                type="text"
                value={audioFileNote}
                onChange={(e) => setAudioFileNote(e.target.value)}
                placeholder="HTTPS audio URL or TTS speaker accent profile (e.g., British Section 1)"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Full Content Body (Passage, Questions, Script, or Article)
            </label>
            <textarea
              required
              rows={7}
              maxLength={20000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write original educational content here..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Publishing...' : 'Publish to Platform'}
          </button>
        </form>
      )}

      {/* Tab 2: Published Custom Content */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          {customContent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
              No custom admin items published yet. Use the "Add Content" tab to publish articles, announcements, or practice items.
            </div>
          ) : (
            customContent.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-xs font-medium uppercase text-blue-600 dark:text-blue-400">
                    {item.contentType} · {item.category}
                  </p>
                  <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteCustomContent(item.id)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Registered Users Directory */}
      {activeTab === 'users' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                  <th className="px-5 py-3.5">Learner</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role / Plan</th>
                  <th className="px-5 py-3.5 text-right">Target</th>
                  <th className="px-5 py-3.5 text-right">XP</th>
                  <th className="px-5 py-3.5 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allUsersAdmin.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                      No registered user records loaded yet.
                    </td>
                  </tr>
                ) : (
                  allUsersAdmin.map((u) => (
                    <tr key={u.uid}>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {u.displayName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-5 py-3.5 text-xs uppercase text-slate-600 dark:text-slate-300">
                        {u.role} · {u.plan}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                        {u.targetBand.toFixed(1)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                        {u.xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">{u.streak}d</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
