import React, { useMemo, useState } from 'react';
import { Calendar, CheckSquare, Square, ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import {
  generateStudyPlan,
  type CEFRLevel,
  type PlanDuration,
} from '../utils/studyPlanGenerator';
import type { PageId } from '../types/ielts';
import { useApp } from '../context/AppContext';

const DURATIONS: PlanDuration[] = [7, 30, 60, 90];
const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TARGET_BANDS = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

export const StudyPlansPage: React.FC = () => {
  const { studyPlan, saveStudyPlanConfig, toggleStudyPlanTask, setPage } = useApp();

  const [durationDays, setDurationDays] = useState<PlanDuration>(studyPlan.durationDays);
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>(studyPlan.currentLevel);
  const [targetBand, setTargetBand] = useState<number>(studyPlan.targetBand);
  const [examDate, setExamDate] = useState<string>(studyPlan.examDate);
  const [dailyMinutes, setDailyMinutes] = useState<number>(studyPlan.dailyMinutes);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const generatedDays = useMemo(
    () =>
      generateStudyPlan({
        durationDays: studyPlan.durationDays,
        currentLevel: studyPlan.currentLevel,
        targetBand: studyPlan.targetBand,
        dailyMinutes: studyPlan.dailyMinutes,
        examDate: studyPlan.examDate,
      }),
    [studyPlan]
  );

  const totalTasks = useMemo(
    () => generatedDays.reduce((acc, d) => acc + d.tasks.length, 0),
    [generatedDays]
  );

  const completedCount = useMemo(() => {
    const validIds = new Set(generatedDays.flatMap((d) => d.tasks.map((t) => t.id)));
    return studyPlan.completedTaskIds.filter((id) => validIds.has(id)).length;
  }, [generatedDays, studyPlan.completedTaskIds]);

  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const totalWeeks = Math.max(1, Math.ceil(generatedDays.length / 7));
  const safeWeek = Math.min(selectedWeek, totalWeeks);
  const visibleDays = generatedDays.slice((safeWeek - 1) * 7, safeWeek * 7);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStudyPlanConfig({
      durationDays,
      currentLevel,
      targetBand,
      examDate,
      dailyMinutes,
      completedTaskIds: studyPlan.completedTaskIds,
    });
    setSelectedWeek(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Structured Roadmaps
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Personalized IELTS Study Plans
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Generate a tailored 7, 30, 60, or 90-day preparation calendar balanced across Listening, Reading, Writing, Speaking, Grammar, Vocabulary, and Mock Exams.
        </p>
      </div>

      {/* Config Form */}
      <form
        onSubmit={(e) => void handleGenerate(e)}
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          Configure Study Schedule
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Plan Duration
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-1">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d)}
                  className={`rounded-lg py-2 text-xs font-semibold tabular-nums transition ${
                    durationDays === d
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
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
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Target Band Score
            </label>
            <select
              value={targetBand}
              onChange={(e) => setTargetBand(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {TARGET_BANDS.map((b) => (
                <option key={b} value={b}>
                  Band {b.toFixed(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Daily Study Time (min)
            </label>
            <input
              type="number"
              min={30}
              max={360}
              step={15}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active plan: {studyPlan.durationDays}-day roadmap · Level {studyPlan.currentLevel} to Band {studyPlan.targetBand.toFixed(1)} · {studyPlan.dailyMinutes} min/day
          </p>
          <button
            type="submit"
            className="whitespace-nowrap shrink-0 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Generate & Save Roadmap
          </button>
        </div>
      </form>

      {/* Completion Bar + Week Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Roadmap Completion
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {completedCount} of {totalTasks} scheduled tasks completed ({progressPct}%)
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((weekNum) => (
              <button
                key={weekNum}
                type="button"
                onClick={() => setSelectedWeek(weekNum)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold tabular-nums transition ${
                  safeWeek === weekNum
                    ? 'bg-[#0B172A] text-white dark:bg-blue-600'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Week {weekNum}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Daily Task Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visibleDays.map((dayObj) => {
          const dayDoneCount = dayObj.tasks.filter((t) =>
            studyPlan.completedTaskIds.includes(t.id)
          ).length;
          return (
            <div
              key={dayObj.day}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Day {dayObj.day}</span>
                    <span>·</span>
                    <span>{dayObj.phase}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {dayObj.focus}
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  {dayDoneCount}/{dayObj.tasks.length}
                </span>
              </div>

              <ul className="mt-3 space-y-2.5">
                {dayObj.tasks.map((task) => {
                  const checked = studyPlan.completedTaskIds.includes(task.id);
                  return (
                    <li
                      key={task.id}
                      className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"
                    >
                      <button
                        type="button"
                        onClick={() => void toggleStudyPlanTask(task.id)}
                        className="flex flex-1 items-start gap-2.5 text-left"
                      >
                        {checked ? (
                          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        )}
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              checked
                                ? 'text-slate-400 line-through dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {task.skill} · {task.minutes} min
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPage(task.targetPage as PageId)}
                        className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400"
                      >
                        Open
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
