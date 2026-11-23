import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Clock,
  Sparkles,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { WRITING_PROMPTS, type WritingPrompt } from '../data/writingSpeakingData';
import { countWords, formatTimer } from '../utils/ieltsScoring';
import type { WritingEvaluation } from '../types/ielts';
import { useApp } from '../context/AppContext';

const CHART_COLORS = ['#2563EB', '#0EA5E9', '#0F172A', '#6366F1', '#14B8A6'];

export const WritingPracticePage: React.FC<{ evaluatorFocus?: boolean }> = ({ evaluatorFocus = false }) => {
  const { writingSubmissions, saveWritingSubmission, showToast } = useApp();
  const [taskFilter, setTaskFilter] = useState<'all' | 'academic_task1' | 'gt_task1' | 'task2'>(
    evaluatorFocus ? 'task2' : 'all'
  );
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt>(
    evaluatorFocus ? WRITING_PROMPTS.find((p) => p.taskType === 'task2') || WRITING_PROMPTS[0] : WRITING_PROMPTS[0]
  );

  const [essay, setEssay] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(`ielts-writing-draft-${WRITING_PROMPTS[0].id}`) || '';
  });

  const [secondsLeft, setSecondsLeft] = useState(selectedPrompt.recommendedMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return WRITING_PROMPTS.filter((p) => taskFilter === 'all' || p.taskType === taskFilter);
  }, [taskFilter]);

  useEffect(() => {
    const saved = window.localStorage.getItem(`ielts-writing-draft-${selectedPrompt.id}`) || '';
    setEssay(saved);
    setSecondsLeft(selectedPrompt.recommendedMinutes * 60);
    setTimerRunning(false);
    setEvaluation(null);
    setAiError(null);
    setShowModel(false);
  }, [selectedPrompt]);

  useEffect(() => {
    window.localStorage.setItem(`ielts-writing-draft-${selectedPrompt.id}`, essay);
  }, [essay, selectedPrompt.id]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const words = countWords(essay);
  const meetsWordMin = words >= selectedPrompt.minWords;

  const handleEvaluateWithAI = async () => {
    setAiError(null);
    if (words < 20) {
      setAiError('Please write at least 20 words before requesting a Gemini AI evaluation.');
      return;
    }
    setEvaluating(true);
    try {
      const resp = await fetch('/api/ai/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: selectedPrompt.taskType,
          prompt: `${selectedPrompt.title}. ${selectedPrompt.instructions}`,
          essay,
        }),
      });
      const data = (await resp.json()) as WritingEvaluation & { error?: string };
      if (!resp.ok) {
        setAiError(data.error || 'AI evaluation failed. Check server Gemini configuration.');
        return;
      }
      setEvaluation(data);
      await saveWritingSubmission({
        taskType: selectedPrompt.taskType,
        promptTitle: selectedPrompt.title,
        essayText: essay,
        wordCount: words,
        estimatedBand: data.overallBand,
        feedbackSummary: data.detailedSummary,
      });
    } catch {
      setAiError('Network error while contacting the AI Writing Evaluator endpoint.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSaveDraftHistory = async () => {
    if (words < 10) {
      showToast('Write at least 10 words to save a submission.');
      return;
    }
    await saveWritingSubmission({
      taskType: selectedPrompt.taskType,
      promptTitle: selectedPrompt.title,
      essayText: essay,
      wordCount: words,
      estimatedBand: evaluation?.overallBand ?? 0,
      feedbackSummary: evaluation?.detailedSummary ?? 'Saved practice draft (not yet AI-evaluated).',
    });
  };

  const renderChartVisual = (prompt: WritingPrompt) => {
    const cd = prompt.chartData;
    if (!cd) return null;

    if (cd.kind === 'line' && cd.rows && cd.seriesKeys) {
      return (
        <div className="h-56 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cd.rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
              <Tooltip />
              <Legend />
              {cd.seriesKeys.map((k, idx) => (
                <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2.5} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (cd.kind === 'bar' && cd.rows && cd.seriesKeys) {
      return (
        <div className="h-56 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cd.rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
              <XAxis dataKey="city" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
              <Tooltip />
              <Legend />
              {cd.seriesKeys.map((k, idx) => (
                <Bar key={k} dataKey={k} fill={CHART_COLORS[idx % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (cd.kind === 'pie' && cd.rows) {
      return (
        <div className="h-56 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={cd.rows} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78} label>
                {cd.rows.map((_r, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (cd.kind === 'table' && cd.rows && cd.rows.length > 0) {
      const headers = Object.keys(cd.rows[0]);
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {cd.rows.map((row, idx) => (
                <tr key={idx} className="bg-white dark:bg-[#0E1A2D]">
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-2 font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {String(row[h])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (cd.kind === 'map' && cd.mapNotes) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
            <p className="font-bold text-slate-900 dark:text-white mb-2">Harborview — 2005 Layout</p>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              {cd.mapNotes.before.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[#2563EB]/40 bg-blue-50/40 dark:bg-blue-950/30 p-4">
            <p className="font-bold text-[#1D4ED8] dark:text-blue-300 mb-2">Harborview — 2025 Redevelopment</p>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-200">
              {cd.mapNotes.after.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (cd.kind === 'process' && cd.steps) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {cd.steps.map((step) => (
            <div
              key={step}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 font-medium text-slate-800 dark:text-slate-200"
            >
              {step}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Task Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B172A] dark:text-white">
            {evaluatorFocus ? 'AI IELTS Writing Evaluator' : 'IELTS Writing Practice Studio'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Academic Task 1 visuals, General Training letters, and Task 2 essays with Gemini 4-criteria band diagnostics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'academic_task1', label: 'Academic T1' },
            { id: 'gt_task1', label: 'GT Letters' },
            { id: 'task2', label: 'Task 2 Essays' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTaskFilter(tab.id as typeof taskFilter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                taskFilter === tab.id
                  ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Picker Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredPrompts.map((p) => {
          const active = selectedPrompt.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPrompt(p)}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                active
                  ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                {p.categoryLabel} · {p.recommendedMinutes}m
              </p>
              <p className="mt-1 text-sm font-bold text-[#0B172A] dark:text-white line-clamp-2">
                {p.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Split: Prompt & Visuals + Writing Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Prompt, Visual Chart, Vocab & Model Answer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                {selectedPrompt.categoryLabel} · Minimum {selectedPrompt.minWords} words
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#0B172A] dark:text-white">
                {selectedPrompt.title}
              </h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedPrompt.instructions}
              </p>
            </div>

            {renderChartVisual(selectedPrompt)}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                High-Band Lexical Suggestions
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
                {selectedPrompt.vocabularySuggestions.map((v, idx) => (
                  <span key={v}>
                    {v}
                    {idx < selectedPrompt.vocabularySuggestions.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModel((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showModel ? 'Hide Model Answer' : 'View Band 9 Model Answer'}
              </button>
              <button
                type="button"
                onClick={() => setEssay(selectedPrompt.modelAnswer)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Load Sample into Editor
              </button>
            </div>

            {showModel && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {selectedPrompt.modelAnswer}
              </div>
            )}
          </div>
        </div>

        {/* Right: Timed Editor & AI Evaluation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0B172A] dark:text-white">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <span>{formatTimer(secondsLeft)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  aria-label={timerRunning ? 'Pause writing timer' : 'Start writing timer'}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setSecondsLeft(selectedPrompt.recommendedMinutes * 60);
                  }}
                  aria-label="Reset writing timer"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                <span className={meetsWordMin ? 'text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                  {words} / {selectedPrompt.minWords} words
                </span>
                <span className="text-slate-400">Autosaved</span>
              </div>
            </div>

            <label htmlFor="writing-editor" className="sr-only">
              Write your IELTS essay response
            </label>
            <textarea
              id="writing-editor"
              rows={14}
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder={`Write at least ${selectedPrompt.minWords} words addressing every part of the prompt...`}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950/60 p-4 text-sm sm:text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />

            {aiError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => void handleSaveDraftHistory()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Save className="w-4 h-4" />
                Save Submission
              </button>

              <button
                type="button"
                disabled={evaluating}
                onClick={() => void handleEvaluateWithAI()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                <span>{evaluating ? 'Evaluating with Gemini AI...' : 'Evaluate with Gemini AI'}</span>
              </button>
            </div>
          </div>

          {/* AI Evaluation Results */}
          {evaluation && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                    {evaluation.disclaimer}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-[#0B172A] dark:text-white">
                    Estimated Overall Band {evaluation.overallBand.toFixed(1)}
                  </h3>
                </div>
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Task Achievement / Response', data: evaluation.taskAchievement },
                  { title: 'Coherence & Cohesion', data: evaluation.coherenceCohesion },
                  { title: 'Lexical Resource', data: evaluation.lexicalResource },
                  { title: 'Grammatical Range & Accuracy', data: evaluation.grammaticalRange },
                ].map((c) => (
                  <div key={c.title} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{c.title}</span>
                      <span className="font-mono font-bold text-base text-[#2563EB] dark:text-[#60A5FA] tabular-nums">
                        {c.data.band.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {c.data.feedback}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {evaluation.detailedSummary}
              </p>

              {evaluation.grammarMistakes.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#0B172A] dark:text-white mb-2">Grammar Corrections</h4>
                  <div className="space-y-2">
                    {evaluation.grammarMistakes.map((g, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1">
                        <p className="text-red-600 dark:text-red-400 line-through">{g.original}</p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-semibold">{g.correction}</p>
                        <p className="text-slate-500 dark:text-slate-400">{g.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.vocabularyImprovements.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#0B172A] dark:text-white mb-2">Vocabulary Upgrades</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {evaluation.vocabularyImprovements.map((v, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs">
                        <span className="text-slate-500">{v.basic}</span> →{' '}
                        <strong className="text-[#2563EB] dark:text-[#60A5FA]">{v.upgraded}</strong>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{v.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.improvedExamples.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#0B172A] dark:text-white mb-2">Improved Band 8–9 Sentences</h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {evaluation.improvedExamples.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Submission History */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5">
            <h3 className="text-sm font-bold text-[#0B172A] dark:text-white mb-3">
              Submission History ({writingSubmissions.length})
            </h3>
            {writingSubmissions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your saved and AI-evaluated essays will appear here.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {writingSubmissions.slice(0, 6).map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {sub.promptTitle}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {sub.wordCount} words · {new Date(sub.createdAtIso).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-[#2563EB] dark:text-[#60A5FA] shrink-0 tabular-nums">
                      {sub.estimatedBand > 0 ? `Band ${sub.estimatedBand.toFixed(1)}` : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
