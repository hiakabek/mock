import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  Compass,
  Search,
  Sparkles,
} from 'lucide-react';
import { LISTENING_TESTS, type ListeningTest } from '../data/listeningTests';
import { formatTimer, gradeObjectiveTest, type GradingResult } from '../utils/ieltsScoring';
import { useApp } from '../context/AppContext';

export const ListeningPracticePage: React.FC = () => {
  const { recordAttempt, showToast } = useApp();
  const [selectedTest, setSelectedTest] = useState<ListeningTest | null>(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

  // Active test state
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect'>('all');
  const [showTranscript, setShowTranscript] = useState(false);

  // Audio playback state (Web Speech API synthesis + optional Gemini TTS WAV)
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [rate, setRate] = useState(1.0);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const filteredTests = useMemo(() => {
    return LISTENING_TESTS.filter((t) => {
      const matchDiff = difficultyFilter === 'All' || t.difficulty === difficultyFilter;
      const q = search.trim().toLowerCase();
      const matchQuery = !q || t.title.toLowerCase().includes(q) || t.theme.toLowerCase().includes(q);
      return matchDiff && matchQuery;
    });
  }, [search, difficultyFilter]);

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
    }
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Countdown timer when taking test
  useEffect(() => {
    if (!selectedTest || result) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [selectedTest, result]);

  const startTest = (test: ListeningTest) => {
    stopAudio();
    setSelectedTest(test);
    setActiveSectionIdx(0);
    setAnswers({});
    setSecondsLeft(test.durationMinutes * 60);
    setResult(null);
    setShowTranscript(false);
    setProgressPct(0);
    setCustomAudioUrl(null);
  };

  const handlePlayPause = () => {
    if (!selectedTest) return;
    const section = selectedTest.sections[activeSectionIdx];

    if (customAudioUrl && audioElRef.current) {
      if (isPlaying) {
        audioElRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElRef.current.volume = volume;
        audioElRef.current.playbackRate = rate;
        void audioElRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      stopAudio();
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(section.transcript);
      utter.lang = 'en-GB';
      utter.volume = volume;
      utter.rate = rate;
      const estimatedSeconds = Math.max(25, Math.round(section.transcript.split(/\s+/).length / (2.5 * rate)));
      let elapsed = Math.round((progressPct / 100) * estimatedSeconds);
      if (progressPct >= 98) {
        elapsed = 0;
        setProgressPct(0);
      }

      utter.onend = () => {
        setIsPlaying(false);
        setProgressPct(100);
        if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      };
      utter.onerror = () => {
        setIsPlaying(false);
        if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      };

      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
      progressTimerRef.current = window.setInterval(() => {
        elapsed += 0.5;
        setProgressPct(Math.min(100, Math.round((elapsed / estimatedSeconds) * 100)));
      }, 500);
    } else {
      showToast('Speech synthesis is unavailable in this browser. Enable Gemini Audio or view transcript.');
    }
  };

  const handleGenerateStudioAudio = async () => {
    if (!selectedTest) return;
    const section = selectedTest.sections[activeSectionIdx];
    stopAudio();
    setTtsLoading(true);
    try {
      const resp = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: section.transcript, voice: activeSectionIdx % 2 === 0 ? 'Kore' : 'Puck' }),
      });
      const data = (await resp.json()) as { audioBase64?: string; error?: string };
      if (!resp.ok || !data.audioBase64) {
        showToast(data.error || 'Studio TTS unavailable; using built-in browser voice player.');
        return;
      }
      setCustomAudioUrl(`data:audio/wav;base64,${data.audioBase64}`);
      showToast('Studio IELTS WAV audio ready. Press Play to listen.');
    } catch {
      showToast('Could not reach TTS endpoint. Built-in voice player remains active.');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTest) return;
    stopAudio();
    const allQuestions = selectedTest.sections.flatMap((s) => s.questions);
    const graded = gradeObjectiveTest(allQuestions, answers, 'listening');
    setResult(graded);
    setShowTranscript(true);
    const elapsed = selectedTest.durationMinutes * 60 - secondsLeft;
    await recordAttempt({
      type: 'listening',
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      score: graded.score,
      maxScore: graded.maxScore,
      estimatedBand: graded.estimatedBand,
      listeningBand: graded.estimatedBand,
      durationSeconds: Math.max(30, elapsed),
    });
  };

  // Library View (20 Original Tests)
  if (!selectedTest) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0B172A] dark:text-white">
              IELTS Listening Practice Library
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              20 original full-length tests · 4 sections and 40 questions per test · Form, MCQ, Map Labeling, Matching, Sentence & Note Completion.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 20 listening tests..."
                aria-label="Search listening tests"
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white w-56"
              />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              {['All', 'Standard', 'Upper-Intermediate', 'Advanced'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    difficultyFilter === d
                      ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {d}
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
                  <span>Test {test.number} · {test.difficulty}</span>
                  <span className="font-mono tabular-nums">40 Qs · 30m</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-[#0B172A] dark:text-white">
                  {test.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {test.theme}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startTest(test)}
                className="mt-4 w-full py-2 px-4 rounded-lg bg-[#0B172A] dark:bg-[#2563EB] hover:opacity-95 text-white text-xs font-semibold transition-opacity"
              >
                Start Listening Test
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentSection = selectedTest.sections[activeSectionIdx];
  const allQuestions = selectedTest.sections.flatMap((s) => s.questions);
  const answeredCount = allQuestions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              stopAudio();
              setSelectedTest(null);
            }}
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
              Answered {answeredCount}/40 questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#0B172A] dark:text-white tabular-nums px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>
          {!result ? (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Submit & Grade
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startTest(selectedTest)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Test
            </button>
          )}
        </div>
      </div>

      {/* Results Banner if Graded */}
      {result && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                Unofficial Practice Band Estimate
              </p>
              <h3 className="text-2xl font-bold text-[#0B172A] dark:text-white mt-0.5">
                Listening Band {result.estimatedBand.toFixed(1)}
              </h3>
            </div>
            <div className="flex items-center gap-6 font-mono text-sm tabular-nums">
              <div>
                <p className="text-xs font-sans text-slate-500">Score</p>
                <p className="font-bold text-lg text-[#0B172A] dark:text-white">
                  {result.score} / {result.maxScore}
                </p>
              </div>
              <div>
                <p className="text-xs font-sans text-slate-500">Correct</p>
                <p className="font-bold text-lg text-emerald-600">{result.correctCount}</p>
              </div>
              <div>
                <p className="text-xs font-sans text-slate-500">Incorrect / Blank</p>
                <p className="font-bold text-lg text-red-600">
                  {result.incorrectCount + result.unansweredCount}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-[#0B172A] dark:text-white">
              Answer Key & Detailed Explanations
            </h4>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  reviewFilter === 'all' ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white' : 'text-slate-500'
                }`}
              >
                All (40)
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  reviewFilter === 'incorrect' ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white' : 'text-slate-500'
                }`}
              >
                Incorrect Only ({result.incorrectCount + result.unansweredCount})
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
            {result.details
              .filter((d) => reviewFilter === 'all' || !d.isCorrect)
              .map((d) => (
                <div key={d.questionId} className="py-3 flex items-start gap-3 text-sm">
                  {d.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">Q{d.number}</span>
                      <span className="text-slate-500">
                        Your answer: <strong className="text-slate-900 dark:text-slate-100">{d.userAnswer || '(blank)'}</strong>
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Key: <strong>{d.correctAnswer}</strong>
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{d.explanation}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Audio Player & Section Tabs */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedTest.sections.map((sec, idx) => (
              <button
                key={sec.sectionNumber}
                type="button"
                onClick={() => {
                  stopAudio();
                  setActiveSectionIdx(idx);
                  setProgressPct(0);
                  setCustomAudioUrl(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeSectionIdx === idx
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Section {sec.sectionNumber} (Q{(idx * 10) + 1}–{(idx + 1) * 10})
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={ttsLoading}
              onClick={() => void handleGenerateStudioAudio()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              {ttsLoading ? 'Generating WAV...' : 'Gemini Studio Voice'}
            </button>
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              {showTranscript ? 'Hide Transcript' : 'Transcript'}
            </button>
          </div>
        </div>

        {/* Audio Bar */}
        <div className="rounded-lg bg-[#0B172A] text-white p-4 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause section audio' : 'Play section audio'}
            className="w-10 h-10 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center shrink-0 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div className="flex-1 w-full">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span className="font-medium truncate">{currentSection.title}</span>
              <span className="font-mono tabular-nums">{progressPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progressPct}
              aria-label="Audio progress"
              onChange={(e) => {
                const v = Number(e.target.value);
                setProgressPct(v);
                if (audioElRef.current && audioElRef.current.duration) {
                  audioElRef.current.currentTime = (v / 100) * audioElRef.current.duration;
                }
              }}
              className="w-full accent-[#3B82F6] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-slate-300" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                aria-label="Audio volume"
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  setVolume(vol);
                  if (audioElRef.current) audioElRef.current.volume = vol;
                }}
                className="w-16 accent-[#3B82F6]"
              />
            </div>
            <select
              aria-label="Playback speed"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="bg-slate-800 text-xs text-white rounded-md px-2 py-1 border border-slate-700 font-mono"
            >
              <option value={0.85}>0.85x</option>
              <option value={1}>1.0x</option>
              <option value={1.15}>1.15x</option>
            </select>
          </div>
          {customAudioUrl && (
            <audio
              ref={audioElRef}
              src={customAudioUrl}
              onTimeUpdate={(e) => {
                const el = e.currentTarget;
                if (el.duration) setProgressPct(Math.round((el.currentTime / el.duration) * 100));
              }}
              onEnded={() => {
                setIsPlaying(false);
                setProgressPct(100);
              }}
              className="hidden"
            />
          )}
        </div>

        {showTranscript && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            <p className="text-xs font-semibold text-slate-500 mb-2">Audio Script — Section {currentSection.sectionNumber}</p>
            {currentSection.transcript}
          </div>
        )}
      </div>

      {/* Main Content Grid: Questions + Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-[#0B172A] dark:text-white">{currentSection.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentSection.context}</p>
          </div>

          {/* Section 2 Interactive Site Map Diagram */}
          {currentSection.mapLegend && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Site Orientation Map (Label Locations A–D)
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500">
                  <Compass className="w-3.5 h-3.5" /> N ↑
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0E1A2D]">
                  <p className="font-mono font-bold text-[#2563EB]">Location C</p>
                  <p className="text-slate-500 mt-0.5">Western Riverside Path</p>
                </div>
                <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0E1A2D]">
                  <p className="font-mono font-bold text-[#2563EB]">Location A</p>
                  <p className="text-slate-500 mt-0.5">Directly North of Main Gate</p>
                </div>
                <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0E1A2D]">
                  <p className="font-mono font-bold text-[#2563EB]">Location D</p>
                  <p className="text-slate-500 mt-0.5">Far Northeast Corner</p>
                </div>
                <div className="col-span-2 p-2.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Central Lawn & Main Gate (South Entry)
                </div>
                <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0E1A2D]">
                  <p className="font-mono font-bold text-[#2563EB]">Location B</p>
                  <p className="text-slate-500 mt-0.5">East of Central Lawn</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {currentSection.questions.map((q) => (
              <div
                key={q.id}
                id={q.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <label htmlFor={`input-${q.id}`} className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-mono font-bold text-[#2563EB] dark:text-[#60A5FA] mr-2">
                      {q.number}.
                    </span>
                    {q.prompt}
                  </label>
                  <span className="text-xs text-slate-400 capitalize whitespace-nowrap">
                    {q.type.replace('_', ' ')}
                  </span>
                </div>

                {q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => {
                      const checked = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={Boolean(result)}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className={`text-left px-3 py-2 rounded-lg border text-xs sm:text-sm transition-colors ${
                            checked
                              ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-200 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    id={`input-${q.id}`}
                    type="text"
                    disabled={Boolean(result)}
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type your answer..."
                    className="w-full sm:max-w-md px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-4 sticky top-20 space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Question Navigator (1–40)
            </h4>
            <div className="grid grid-cols-5 gap-1.5">
              {allQuestions.map((q) => {
                const isAnswered = Boolean((answers[q.id] ?? '').trim());
                const inSection = q.section === activeSectionIdx + 1;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setActiveSectionIdx(q.section - 1);
                      setTimeout(() => {
                        document.getElementById(q.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className={`h-8 rounded-md font-mono text-xs font-semibold tabular-nums transition-colors ${
                      isAnswered
                        ? 'bg-[#2563EB] text-white'
                        : inSection
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {q.number}
                  </button>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Answered</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                {answeredCount}/40
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
