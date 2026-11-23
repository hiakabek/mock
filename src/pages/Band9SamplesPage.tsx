import React, { useMemo, useState } from 'react';
import { Search, Award, BookMarked, Sparkles, CheckCircle2 } from 'lucide-react';
import { BAND9_SAMPLES, type Band9Sample } from '../data/learningData';

const SKILL_FILTERS: ('All' | Band9Sample['skill'])[] = [
  'All',
  'Writing Task 1',
  'Writing Task 2',
  'Speaking Part 1',
  'Speaking Part 2',
  'Speaking Part 3',
];

export const Band9SamplesPage: React.FC = () => {
  const [skillFilter, setSkillFilter] = useState<'All' | Band9Sample['skill']>('All');
  const [search, setSearch] = useState('');

  const samples = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BAND9_SAMPLES.filter((s) => {
      if (skillFilter !== 'All' && s.skill !== skillFilter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.prompt.toLowerCase().includes(q) ||
        s.answer.toLowerCase().includes(q) ||
        s.vocabHighlights.some((v) => v.toLowerCase().includes(q))
      );
    });
  }, [skillFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Model Benchmarks
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Band 9 Sample Answers Library
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Original Writing Task 1, Task 2, and Speaking Part 1–3 model responses annotated with lexical highlights, grammar structures, and examiner rationale.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SKILL_FILTERS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setSkillFilter(skill)}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                skillFilter === skill
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics or expressions..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Samples */}
      <div className="space-y-6">
        {samples.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
            No sample answers matched your search query.
          </div>
        ) : (
          samples.map((sample) => (
            <article
              key={sample.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {sample.skill} · Practice Model Benchmark
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                    {sample.title}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B172A] px-3 py-1.5 text-xs font-bold text-white tabular-nums dark:bg-blue-600">
                  <Award className="h-3.5 w-3.5" />
                  Est. Band {sample.estimatedBand.toFixed(1)}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Prompt: </span>
                {sample.prompt}
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-800 dark:text-slate-200">
                {sample.answer.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 md:grid-cols-3">
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Vocabulary Highlights
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {sample.vocabHighlights.map((v) => (
                      <li key={v}>· {v}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <BookMarked className="h-3.5 w-3.5 text-blue-600" />
                    Useful Expressions
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {sample.usefulExpressions.map((expr) => (
                      <li key={expr}>· {expr}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Grammar Structures
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {sample.grammarStructures.map((g) => (
                      <li key={g}>· {g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-blue-50/70 p-4 text-sm text-slate-800 dark:bg-blue-950/30 dark:text-slate-200">
                <span className="font-semibold text-blue-800 dark:text-blue-300">
                  Why this response scores high:{' '}
                </span>
                {sample.whyStrong}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
