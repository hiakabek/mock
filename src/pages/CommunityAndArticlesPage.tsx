import React, { useMemo, useState } from 'react';
import { Trophy, Flame, Award, Search, Clock, ArrowLeft, BookOpen } from 'lucide-react';
import { ARTICLES_BANK, type ArticleItem } from '../data/learningData';
import { useApp } from '../context/AppContext';

export const LeaderboardPage: React.FC = () => {
  const { leaderboard, profile } = useApp();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');

  const ranked = useMemo(() => {
    const copy = [...leaderboard];
    copy.sort((a, b) => {
      if (period === 'weekly') return b.weeklyXp - a.weeklyXp;
      if (period === 'monthly') return b.monthlyXp - a.monthlyXp;
      return b.xp - a.xp;
    });
    return copy;
  }, [leaderboard, period]);

  const topThree = ranked.slice(0, 3);

  const getPoints = (entry: (typeof ranked)[number]) =>
    period === 'weekly' ? entry.weeklyXp : period === 'monthly' ? entry.monthlyXp : entry.xp;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Community Motivation
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            IELTS MASTER Leaderboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Earn XP by completing Listening & Reading tests, Writing & Speaking AI evaluations, Grammar modules, and Full Mock Exams.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {(
            [
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                period === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topThree.map((entry, idx) => (
          <div
            key={entry.userId}
            className={`rounded-2xl border p-5 ${
              idx === 0
                ? 'border-blue-500 bg-[#0B172A] text-white dark:border-blue-500'
                : 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-mono text-xs font-bold uppercase tracking-wider ${
                  idx === 0 ? 'text-blue-300' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Rank #{idx + 1}
              </span>
              <Trophy
                className={`h-5 w-5 ${
                  idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-400' : 'text-amber-700'
                }`}
              />
            </div>
            <h2 className="mt-3 font-display text-lg font-bold">{entry.displayName}</h2>
            <p
              className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
                idx === 0 ? 'text-white' : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {getPoints(entry).toLocaleString()} XP
            </p>
            <p
              className={`mt-2 text-xs tabular-nums ${
                idx === 0 ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {entry.streak}-day streak · {entry.mocksCompleted} mocks · Best Est. Band{' '}
              {entry.bestBand > 0 ? entry.bestBand.toFixed(1) : '—'}
            </p>
          </div>
        ))}
      </div>

      {/* Full Rankings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5 text-right">XP</th>
                <th className="px-5 py-3.5 text-right">Streak</th>
                <th className="px-5 py-3.5 text-right">Mocks</th>
                <th className="px-5 py-3.5 text-right">Best Est. Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ranked.map((row, idx) => {
                const isSelf = row.userId === profile.uid;
                return (
                  <tr
                    key={row.userId}
                    className={
                      isSelf
                        ? 'bg-blue-50/70 dark:bg-blue-950/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      #{idx + 1}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {row.displayName}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                      {getPoints(row).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                      <span className="inline-flex items-center justify-end gap-1">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        {row.streak}d
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                      {row.mocksCompleted}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      <span className="inline-flex items-center justify-end gap-1">
                        <Award className="h-3.5 w-3.5 text-blue-600" />
                        {row.bestBand > 0 ? row.bestBand.toFixed(1) : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ArticlesPage: React.FC = () => {
  const { customContent } = useApp();
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  const allArticles: ArticleItem[] = useMemo(() => {
    const adminArticles: ArticleItem[] = customContent
      .filter((c) => c.contentType === 'article' && c.published)
      .map((c) => ({
        id: c.id,
        title: c.title,
        category: (['Reading', 'Listening', 'Writing', 'Speaking', 'Exam Strategy'].includes(c.category)
          ? c.category
          : 'Exam Strategy') as ArticleItem['category'],
        readTime: '4 min read',
        publishedDate: new Date(c.createdAtIso).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        imageUrl: '/src/assets/images/article_reading_strategy_1795414561980.jpg',
        summary: c.summary,
        sections: [{ heading: 'Editorial Guide', content: c.body }],
      }));
    return [...adminArticles, ...ARTICLES_BANK];
  }, [customContent]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allArticles.filter((a) => {
      if (category !== 'All' && a.category !== category) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    });
  }, [allArticles, category, search]);

  if (activeArticle) {
    return (
      <article className="mx-auto max-w-3xl space-y-6">
        <button
          type="button"
          onClick={() => setActiveArticle(null)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles & Tips
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <img
            src={activeArticle.imageUrl}
            alt={activeArticle.title}
            className="h-64 w-full object-cover"
          />
          <div className="p-6 sm:p-8">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {activeArticle.category} · {activeArticle.readTime} · {activeArticle.publishedDate}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {activeArticle.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {activeArticle.summary}
            </p>

            <div className="mt-8 space-y-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              {activeArticle.sections.map((sec, i) => (
                <section key={i}>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {sec.heading}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {sec.content}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Exam Insights & Methodology
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          IELTS Articles & Strategy Guides
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Practical, examiner-aligned strategies for improving accuracy, pacing, and band consistency across all four modules.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', 'Reading', 'Listening', 'Writing', 'Speaking', 'Exam Strategy'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article) => (
          <article
            key={article.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900"
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-44 w-full object-cover"
            />
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <span>{article.category}</span>
                  <span>·</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{article.readTime}</span>
                </p>
                <h2 className="mt-2 font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">
                  {article.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {article.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(article)}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                <BookOpen className="h-4 w-4" />
                Read Strategy Guide
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
