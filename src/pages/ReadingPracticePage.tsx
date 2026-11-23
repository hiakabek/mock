import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Clock,
  Highlighter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { READING_TESTS, type ReadingTest } from '../data/readingTests';
import { formatTimer, gradeObjectiveTest, type GradingResult } from '../utils/ieltsScoring';
import { useApp } from '../context/AppContext';

export const ReadingPracticePage: React.FC = () => {
  const { recordAttempt } = useApp();
  const [selectedTest, setSelectedTest] = useState<ReadingTest | null>(null);
  const [modeFilter, setModeFilter] = useState<'all' | 'academic' | 'general'>('all');
  const [search, setSearch] = useState('');

  // Active exam state
  const [passageIdx, setPassageIdx] = useState<0 | 1 | 2>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});
  const [highlightMode, setHighlightMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [mobilePane, setMobilePane] = useState<'passage' | 'questions'>('passage');

  const filteredTests = useMemo(() => {
    return READING_TESTS.filter((t) => {
      const matchMode = modeFilter === 'all' || t.mode === modeFilter;
      const q = search.trim().toLowerCase();
      const matchQuery = !q || t.title.toLowerCase().includes(q) || t.topicSummary.toLowerCase().includes(q);
      return matchMode && matchQuery;
    });
  }, [modeFilter, search]);

  useEffect(() => {
    if (!selectedTest || result) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [selectedTest, result]);

  // Autosave answers locally while taking test
  useEffect(() => {
    if (!selectedTest || result) return;
    window.localStorage.setItem(`ielts-reading-draft-${selectedTest.id}`, JSON.stringify(answers));
  }, [selectedTest, answers, result]);

  const startTest = (test: ReadingTest) => {
    setSelectedTest(test);
    setPassageIdx(0);
    setHighlights({});
    setSecondsLeft(test.durationMinutes * 60);
    setResult(null);
    const saved = window.localStorage.getItem(`ielts-reading-draft-${test.id}`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved) as Record<string, string>);
      } catch {
        setAnswers({});
      }
    } else {
      setAnswers({});
    }
  };

  const handleSubmit = async () => {
    if (!selectedTest) return;
    const graded = gradeObjectiveTest(selectedTest.questions, answers, 'reading', selectedTest.mode);
    setResult(graded);
    window.localStorage.removeItem(`ielts-reading-draft-${selectedTest.id}`);
    const elapsed = selectedTest.durationMinutes * 60 - secondsLeft;
    await recordAttempt({
      type: 'reading',
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      score: graded.score,
      maxScore: graded.maxScore,
      estimatedBand: graded.estimatedBand,
      readingBand: graded.estimatedBand,
      durationSeconds: Math.max(45, elapsed),
    });
  };

  if (!selectedTest) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0B172A] dark:text-white">
              IELTS Reading Simulator
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              20 original Academic & General Training reading tests · 3 passages and 40 questions each with split-screen text highlighting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 20 reading tests..."
                aria-label="Search reading tests"
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white w-56"
              />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              {[
                { id: 'all', label: 'All (20)' },
                { id: 'academic', label: 'Academic (15)' },
                { id: 'general', label: 'General Training (5)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeFilter(m.id as 'all' | 'academic' | 'general')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    modeFilter === m.id
                      ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="capitalize">
                    {test.mode} · {test.difficulty}
                  </span>
                  <span className="font-mono tabular-nums">3 Passages · 40 Qs</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-[#0B172A] dark:text-white">
                  {test.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {test.topicSummary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startTest(test)}
                className="mt-4 w-full py-2 px-4 rounded-lg bg-[#0B172A] dark:bg-[#2563EB] hover:opacity-95 text-white text-xs font-semibold transition-opacity"
              >
                Open Reading Test
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const passage = selectedTest.passages[passageIdx];
  const passageQuestions = selectedTest.questions.filter((q) => q.passageIndex === passageIdx);
  const answeredCount = selectedTest.questions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedTest(null)}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#2563EB]"
          >
            <ChevronLeft className="w-4 h-4" />
            All Tests
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#0B172A] dark:text-white">
              {selectedTest.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Autosaved · Answered {answeredCount}/40
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHighlightMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
              highlightMode
                ? 'border-amber-400 bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            {highlightMode ? 'Highlighter On' : 'Highlight Text'}
          </button>

          <div className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0B172A] dark:text-white">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          {!result ? (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold whitespace-nowrap"
            >
              Submit & Score
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startTest(selectedTest)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {result && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                Unofficial {selectedTest.mode === 'academic' ? 'Academic' : 'General Training'} Reading Band
              </p>
              <h3 className="text-2xl font-bold text-[#0B172A] dark:text-white">
                Band {result.estimatedBand.toFixed(1)}
              </h3>
            </div>
            <div className="flex items-center gap-6 font-mono text-sm tabular-nums">
              <span>Score: <strong>{result.score}/40</strong></span>
              <span className="text-emerald-600">Correct: <strong>{result.correctCount}</strong></span>
              <span className="text-red-600">Missed: <strong>{result.incorrectCount + result.unansweredCount}</strong></span>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {result.details.map((d) => (
              <div key={d.questionId} className="py-2.5 flex items-start gap-2.5 text-xs">
                {d.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-mono font-bold mr-2">Q{d.number}</span>
                  <span>Your answer: <strong>{d.userAnswer || '(blank)'}</strong></span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="text-emerald-700 dark:text-emerald-400">Correct: <strong>{d.correctAnswer}</strong></span>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">{d.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passage Tabs + Mobile Split Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {selectedTest.passages.map((p) => (
            <button
              key={p.index}
              type="button"
              onClick={() => setPassageIdx(p.index)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                passageIdx === p.index
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex lg:hidden items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMobilePane('passage')}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              mobilePane === 'passage' ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            Passage
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('questions')}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              mobilePane === 'questions' ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            Questions ({passageQuestions.length})
          </button>
        </div>
      </div>

      {/* Desktop Side-by-Side Split Reading Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left: Passage */}
        <article
          className={`${
            mobilePane === 'questions' ? 'hidden lg:block' : 'block'
          } rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 lg:max-h-[70vh] lg:overflow-y-auto space-y-5`}
        >
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">{passage.label}</p>
            <h3 className="mt-1 text-xl font-bold text-[#0B172A] dark:text-white">{passage.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{passage.subtitle}</p>
            {highlightMode && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                Click any sentence below to toggle yellow exam highlights.
              </p>
            )}
          </div>

          <div className="space-y-4 text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">
            {passage.paragraphs.map((para) => {
              const sentences = para.text.split(/(?<=\.)\s+/);
              return (
                <div key={para.id} className="flex gap-3">
                  <span className="font-mono text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] mt-1 shrink-0">
                    {para.id}
                  </span>
                  <p>
                    {sentences.map((sent, sIdx) => {
                      const key = `${passageIdx}-${para.id}-${sIdx}`;
                      const isLit = Boolean(highlights[key]);
                      return (
                        <span
                          key={key}
                          onClick={() => {
                            if (highlightMode) {
                              setHighlights((prev) => ({ ...prev, [key]: !prev[key] }));
                            }
                          }}
                          className={`${highlightMode ? 'cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40' : ''} ${
                            isLit ? 'bg-amber-200/80 dark:bg-amber-500/30 rounded-xs px-0.5' : ''
                          }`}
                        >
                          {sent}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Workflow Diagram Reference Box */}
          {passage.diagramSteps && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
                Process Diagram Reference (3 Sequential Stages)
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="p-2.5 rounded-lg bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-bold text-[#2563EB]">Stage {step}</span>
                    <p className="text-slate-500 mt-0.5">Refer to Paragraph C</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Right: Questions */}
        <div
          className={`${
            mobilePane === 'passage' ? 'hidden lg:block' : 'block'
          } rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 lg:max-h-[70vh] lg:overflow-y-auto space-y-4`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-[#0B172A] dark:text-white">
              {passage.label} Questions ({passageQuestions[0]?.number}–{passageQuestions[passageQuestions.length - 1]?.number})
            </h4>
            <span className="text-xs text-slate-500">All 40 questions scored</span>
          </div>

          {passageQuestions.map((q) => (
            <div key={q.id} id={q.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <label htmlFor={`rq-${q.id}`} className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  <span className="font-mono font-bold text-[#2563EB] dark:text-[#60A5FA] mr-2">
                    {q.number}.
                  </span>
                  {q.prompt}
                </label>
                <span className="text-[11px] text-slate-400 uppercase whitespace-nowrap">
                  {q.type === 'tfng' ? 'T/F/NG' : q.type === 'ynng' ? 'Y/N/NG' : q.type.replace('_', ' ')}
                </span>
              </div>

              {q.options ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const active = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={Boolean(result)}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors text-left ${
                          active
                            ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-200 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  id={`rq-${q.id}`}
                  type="text"
                  disabled={Boolean(result)}
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Write exact word(s) from passage..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 40-Question Number Navigation Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-3 flex flex-wrap items-center gap-1.5">
        {selectedTest.questions.map((q) => {
          const done = Boolean((answers[q.id] ?? '').trim());
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setPassageIdx(q.passageIndex);
                setMobilePane('questions');
                setTimeout(() => document.getElementById(q.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40);
              }}
              className={`w-7 h-7 rounded font-mono text-xs font-semibold tabular-nums transition-colors ${
                done
                  ? 'bg-[#2563EB] text-white'
                  : q.passageIndex === passageIdx
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
              }`}
            >
              {q.number}
            </button>
          );
        })}
      </div>
    </div>
  );
};
