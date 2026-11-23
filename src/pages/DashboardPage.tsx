import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  ArrowRight,
  Flame,
  Clock,
  Target,
  ClipboardCheck,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateOverallBand } from '../utils/ieltsScoring';
import type { PageId } from '../types/ielts';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    attempts,
    writingSubmissions,
    speakingSubmissions,
    customContent,
    setPage,
    firebaseUser,
    setAuthModalOpen,
  } = useApp();

  const stats = useMemo(() => {
    const listeningList = attempts.filter((a) => a.type === 'listening' || a.listeningBand != null);
    const readingList = attempts.filter((a) => a.type === 'reading' || a.readingBand != null);
    const avgListening = listeningList.length
      ? listeningList.reduce((acc, a) => acc + (a.listeningBand ?? a.estimatedBand), 0) / listeningList.length
      : 0;
    const avgReading = readingList.length
      ? readingList.reduce((acc, a) => acc + (a.readingBand ?? a.estimatedBand), 0) / readingList.length
      : 0;
    const avgWriting = writingSubmissions.length
      ? writingSubmissions.reduce((acc, w) => acc + w.estimatedBand, 0) / writingSubmissions.length
      : attempts.find((a) => a.writingBand)?.writingBand ?? 0;
    const avgSpeaking = speakingSubmissions.length
      ? speakingSubmissions.reduce((acc, s) => acc + s.estimatedBand, 0) / speakingSubmissions.length
      : attempts.find((a) => a.speakingBand)?.speakingBand ?? 0;

    const currentBand = calculateOverallBand([avgListening, avgReading, avgWriting, avgSpeaking]);
    const mocksCompleted = attempts.filter((a) => a.type === 'full_mock').length;

    return {
      currentBand,
      avgListening: Number(avgListening.toFixed(1)),
      avgReading: Number(avgReading.toFixed(1)),
      avgWriting: Number(avgWriting.toFixed(1)),
      avgSpeaking: Number(avgSpeaking.toFixed(1)),
      mocksCompleted,
    };
  }, [attempts, writingSubmissions, speakingSubmissions]);

  const weeklyActivityData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseMinutes = [45, 70, 55, 90, 60, 110, 80];
    const bonus = Math.min(45, attempts.length * 8);
    return days.map((day, idx) => ({
      day,
      minutes: baseMinutes[idx] + (idx === 6 ? bonus : 0),
    }));
  }, [attempts.length]);

  const bandTrendData = useMemo(() => {
    const reversed = [...attempts].slice(0, 8).reverse();
    if (reversed.length === 0) {
      return [{ label: 'Start', band: 5.5 }];
    }
    return reversed.map((a, idx) => ({
      label: `T${idx + 1}`,
      band: a.estimatedBand,
    }));
  }, [attempts]);

  const announcements = customContent.filter((c) => c.contentType === 'announcement' && c.published);

  const recommended: { title: string; detail: string; page: PageId }[] = [
    {
      title: 'Listening Practice Test 2',
      detail: '40 questions · Section 2 Map Labeling & Section 4 Lecture',
      page: 'listening',
    },
    {
      title: 'Academic Reading Timed Drill',
      detail: 'True / False / Not Given & Matching Headings · 60 min',
      page: 'reading',
    },
    {
      title: 'AI Writing Task 2 Critique',
      detail: 'Submit a 250-word essay for 4-criteria band diagnostics',
      page: 'ai-writing',
    },
    {
      title: 'Part 2 Speaking Cue Card Studio',
      detail: '1-min prep + 2-min microphone recording with AI review',
      page: 'speaking',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Cloud Sync Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6">
        <div>
          <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
            CEFR {profile.currentLevel} · Target Band {profile.targetBand.toFixed(1)} · Exam {profile.examDate}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#0B172A] dark:text-white">
            Welcome back, {profile.displayName}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            All scores below are unofficial practice estimates based on your completed tests and AI evaluations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!firebaseUser && (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              Sign In to Sync Cloud
            </button>
          )}
          <button
            type="button"
            onClick={() => setPage('mock-exams')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <span>Start Full Mock</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Admin Announcements */}
      {announcements.length > 0 && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 flex items-start gap-3">
          <Megaphone className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-[#0B172A] dark:text-white">{announcements[0].title}</p>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{announcements[0].summary || announcements[0].body}</p>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Estimated Overall Band',
            value: stats.currentBand > 0 ? stats.currentBand.toFixed(1) : '—',
            sub: `Target ${profile.targetBand.toFixed(1)} (Unofficial)`,
            icon: Target,
          },
          {
            label: 'Learning Streak',
            value: `${profile.streak} days`,
            sub: `${profile.xp.toLocaleString()} total XP`,
            icon: Flame,
          },
          {
            label: 'Total Study Hours',
            value: `${profile.studyHours.toFixed(1)} h`,
            sub: `Daily goal: ${profile.dailyStudyMinutes} min`,
            icon: Clock,
          },
          {
            label: 'Completed Mocks',
            value: String(stats.mocksCompleted),
            sub: `${attempts.length} total attempts logged`,
            icon: ClipboardCheck,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium">{kpi.label}</span>
                <Icon className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              </div>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-[#0B172A] dark:text-white tabular-nums">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Four Skill Averages Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { skill: 'Listening Average', band: stats.avgListening, target: 'listening' as PageId },
          { skill: 'Reading Average', band: stats.avgReading, target: 'reading' as PageId },
          { skill: 'Writing Progress', band: stats.avgWriting, target: 'writing' as PageId },
          { skill: 'Speaking Progress', band: stats.avgSpeaking, target: 'speaking' as PageId },
        ].map((item) => (
          <button
            key={item.skill}
            type="button"
            onClick={() => setPage(item.target)}
            className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-4 hover:border-[#2563EB] transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-400">{item.skill}</span>
              <span className="shrink-0 font-mono text-base font-bold text-[#0B172A] dark:text-white tabular-nums">
                {item.band > 0 ? item.band.toFixed(1) : '—'}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2563EB]"
                style={{ width: `${Math.min(100, (item.band / 9) * 100)}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Recharts Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#0B172A] dark:text-white">Weekly Study Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active study minutes across the last 7 days</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="minutes" name="Minutes" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#0B172A] dark:text-white">Estimated Band Progression</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Chronological trajectory across recent practice & mock exams</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bandTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[4, 9]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="band"
                  name="Est. Band"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.16}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Split: Recent Activities + Recommended Next Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0B172A] dark:text-white">Recent Practice & Mock Results</h3>
            <button
              type="button"
              onClick={() => setPage('mock-exams')}
              className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
            >
              View all mocks
            </button>
          </div>

          {attempts.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No attempts recorded yet. Complete a Listening, Reading, or Mock test to populate your analytics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs text-slate-500 dark:text-slate-400">
                    <th className="pb-2.5 font-medium">Assessment</th>
                    <th className="pb-2.5 font-medium">Type</th>
                    <th className="pb-2.5 font-medium text-right">Score</th>
                    <th className="pb-2.5 font-medium text-right">Est. Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {attempts.slice(0, 6).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pr-3 font-medium text-slate-900 dark:text-slate-100">
                        {a.testTitle}
                      </td>
                      <td className="py-3 pr-3 text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {a.type.replace('_', ' ')}
                      </td>
                      <td className="py-3 pr-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {a.score}/{a.maxScore}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold tabular-nums text-[#2563EB] dark:text-[#60A5FA]">
                        {a.estimatedBand.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6">
          <h3 className="text-base font-bold text-[#0B172A] dark:text-white mb-4">Recommended Next Lessons</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recommended.map((rec) => (
              <button
                key={rec.title}
                type="button"
                onClick={() => setPage(rec.page)}
                className="w-full py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-left group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                    {rec.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rec.detail}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
