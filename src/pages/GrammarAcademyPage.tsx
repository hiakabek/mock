import React, { useState } from 'react';
import { CheckCircle2, XCircle, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';
import { GRAMMAR_LESSONS } from '../data/learningData';
import { useApp } from '../context/AppContext';

export const GrammarAcademyPage: React.FC = () => {
  const { profile, markGrammarCompleted } = useApp();
  const [selectedId, setSelectedId] = useState<string>(GRAMMAR_LESSONS[0].id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const lesson = GRAMMAR_LESSONS.find((l) => l.id === selectedId) || GRAMMAR_LESSONS[0];
  const isCompleted = profile.completedGrammarIds.includes(lesson.id);

  const handleSelectLesson = (id: string) => {
    setSelectedId(id);
    setAnswers({});
    setChecked(false);
  };

  const correctCount = lesson.quiz.filter((q) => answers[q.id] === q.correctAnswer).length;

  const handleCheckQuiz = async () => {
    setChecked(true);
    if (correctCount === lesson.quiz.length) {
      await markGrammarCompleted(lesson.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Grammatical Range & Accuracy
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            IELTS Grammar Academy
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            11 structured grammar modules with English & Uzbek explanations, IELTS error diagnostics, and auto-checked quizzes.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums">
          Completed: <span className="font-bold text-blue-600 dark:text-blue-400">{profile.completedGrammarIds.length}</span> / {GRAMMAR_LESSONS.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Lesson Sidebar */}
        <aside className="space-y-1.5 lg:col-span-4">
          {GRAMMAR_LESSONS.map((item, idx) => {
            const done = profile.completedGrammarIds.includes(item.id);
            const active = item.id === lesson.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectLesson(item.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-blue-600 bg-blue-50/80 text-blue-950 dark:border-blue-500 dark:bg-blue-950/40 dark:text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-mono text-slate-400 tabular-nums">
                    Module {String(idx + 1).padStart(2, '0')}
                  </p>
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                </div>
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Lesson Content */}
        <section className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {lesson.bandImpact}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                  {lesson.title}
                </h2>
              </div>
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Mastered
                </span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  English Explanation
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {lesson.explanationEn}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50/70 p-4 dark:bg-blue-950/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  O'zbekcha Tushuntirish (UZ)
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {lesson.explanationUz}
                </p>
              </div>
            </div>

            {/* Band 8-9 Examples */}
            <div className="mt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <BookOpen className="h-4 w-4 text-blue-600" />
                High-Scoring IELTS Examples
              </h3>
              <ul className="mt-3 space-y-2.5">
                {lesson.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {ex.sentence}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ex.note}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="mt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Common IELTS Mistakes to Avoid
              </h3>
              <div className="mt-3 space-y-3">
                {lesson.commonMistakes.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <p className="text-sm text-rose-700 dark:text-rose-400">
                        <span className="font-semibold">Incorrect:</span> {m.wrong}
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        <span className="font-semibold">Correct:</span> {m.right}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{m.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Practice Quiz */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Module Diagnostic Quiz
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Score 100% to mark this module mastered and earn +60 XP.
                </p>
              </div>
              {checked && (
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {correctCount} / {lesson.quiz.length}
                </span>
              )}
            </div>

            <div className="mt-5 space-y-5">
              {lesson.quiz.map((q, qIndex) => {
                const picked = answers[q.id];
                const isRight = picked === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options.map((opt) => {
                        const selected = picked === opt;
                        let style =
                          'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200';
                        if (checked) {
                          if (opt === q.correctAnswer) {
                            style =
                              'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200';
                          } else if (selected) {
                            style =
                              'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-950/50 dark:text-rose-200';
                          }
                        } else if (selected) {
                          style =
                            'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200';
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setAnswers((prev) => ({ ...prev, [q.id]: opt }));
                              setChecked(false);
                            }}
                            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {checked && (
                      <div className="mt-3 flex items-start gap-2 text-xs">
                        {isRight ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        )}
                        <p className="text-slate-600 dark:text-slate-300">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => void handleCheckQuiz()}
                className="whitespace-nowrap shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Check Answers
              </button>
              {checked && correctCount === lesson.quiz.length && (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Excellent accuracy! Module saved as completed.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
