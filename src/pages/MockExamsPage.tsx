import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Play,
  Volume2,
} from 'lucide-react';
import { LISTENING_TESTS } from '../data/listeningTests';
import { READING_TESTS } from '../data/readingTests';
import { WRITING_PROMPTS, SPEAKING_PART2_CARDS } from '../data/writingSpeakingData';
import {
  calculateOverallBand,
  countWords,
  formatTimer,
  gradeObjectiveTest,
  type GradingResult,
} from '../utils/ieltsScoring';
import { useApp } from '../context/AppContext';

type MockMode = 'full' | 'listening' | 'reading' | 'writing' | 'speaking';
type ExamSection = 'listening' | 'reading' | 'writing' | 'speaking';

interface MockPackage {
  id: string;
  title: string;
  subtitle: string;
  listeningTestIndex: number;
  readingTestIndex: number;
  writingPromptIndex: number;
  speakingCardIndex: number;
}

const MOCK_PACKAGES: MockPackage[] = [
  {
    id: 'mock-1',
    title: 'Full IELTS Academic Mock Exam #1',
    subtitle: 'Coastal Ecology · Sponge Cities · Renewable Electricity · Practical Skills',
    listeningTestIndex: 0,
    readingTestIndex: 0,
    writingPromptIndex: 9,
    speakingCardIndex: 0,
  },
  {
    id: 'mock-2',
    title: 'Full IELTS Academic Mock Exam #2',
    subtitle: 'Heritage Mill · Kelp Carbon Capture · University Skills · Quiet Focus Spaces',
    listeningTestIndex: 1,
    readingTestIndex: 1,
    writingPromptIndex: 10,
    speakingCardIndex: 1,
  },
  {
    id: 'mock-3',
    title: 'Full IELTS Academic Mock Exam #3',
    subtitle: 'Microgrids · Self-Healing Concrete · Remote Work · Team Projects',
    listeningTestIndex: 2,
    readingTestIndex: 2,
    writingPromptIndex: 11,
    speakingCardIndex: 2,
  },
  {
    id: 'mock-4',
    title: 'Full IELTS General Training Mock Exam #4',
    subtitle: 'Wildlife Rescue · MetroRail & Repair Cafes · Library Letter · Key Decisions',
    listeningTestIndex: 3,
    readingTestIndex: 3,
    writingPromptIndex: 6,
    speakingCardIndex: 3,
  },
];

const SECTION_SECONDS: Record<ExamSection, number> = {
  listening: 30 * 60,
  reading: 60 * 60,
  writing: 60 * 60,
  speaking: 14 * 60,
};

interface MockReport {
  mode: MockMode;
  pkgTitle: string;
  listeningResult?: GradingResult;
  readingResult?: GradingResult;
  writingBand?: number;
  writingWords?: number;
  speakingBand?: number;
  overallBand: number;
}

export const MockExamsPage: React.FC = () => {
  const { attempts, recordAttempt, showToast } = useApp();
  const [activePkg, setActivePkg] = useState<MockPackage | null>(null);
  const [mode, setMode] = useState<MockMode>('full');
  const [stage, setStage] = useState<'hub' | 'instructions' | 'exam' | 'results'>('hub');
  const [sectionsOrder, setSectionsOrder] = useState<ExamSection[]>(['listening', 'reading', 'writing', 'speaking']);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Answers (auto-saved so no accidental deletion)
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [writingEssay, setWritingEssay] = useState('');
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [readingPassageIdx, setReadingPassageIdx] = useState<0 | 1 | 2>(0);
  const [listeningSectionIdx, setListeningSectionIdx] = useState(0);
  const [report, setReport] = useState<MockReport | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());

  const currentSection: ExamSection = sectionsOrder[currentSectionIdx] ?? 'listening';

  const listeningTest = activePkg ? LISTENING_TESTS[activePkg.listeningTestIndex] : LISTENING_TESTS[0];
  const readingTest = activePkg ? READING_TESTS[activePkg.readingTestIndex] : READING_TESTS[0];
  const writingPrompt = activePkg ? WRITING_PROMPTS[activePkg.writingPromptIndex] : WRITING_PROMPTS[9];
  const speakingCard = activePkg ? SPEAKING_PART2_CARDS[activePkg.speakingCardIndex] : SPEAKING_PART2_CARDS[0];

  const mockHistory = useMemo(
    () => attempts.filter((a) => a.type === 'full_mock' || a.testId.startsWith('mock-')),
    [attempts]
  );

  // Autosave mock answers
  useEffect(() => {
    if (stage !== 'exam' || !activePkg) return;
    window.localStorage.setItem(
      `ielts-mock-state-${activePkg.id}-${mode}`,
      JSON.stringify({ listeningAnswers, readingAnswers, writingEssay, speakingTranscript })
    );
  }, [stage, activePkg, mode, listeningAnswers, readingAnswers, writingEssay, speakingTranscript]);

  // Countdown timer with automatic section transition / submission on expiry
  useEffect(() => {
    if (stage !== 'exam') return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (currentSectionIdx < sectionsOrder.length - 1) {
            const nextIdx = currentSectionIdx + 1;
            setCurrentSectionIdx(nextIdx);
            showToast(`Time expired for ${sectionsOrder[currentSectionIdx]}. Advancing automatically.`);
            return SECTION_SECONDS[sectionsOrder[nextIdx]];
          }
          void finalizeExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, currentSectionIdx, sectionsOrder]);

  const launchMock = (pkg: MockPackage, chosenMode: MockMode) => {
    const order: ExamSection[] =
      chosenMode === 'full' ? ['listening', 'reading', 'writing', 'speaking'] : [chosenMode];
    setActivePkg(pkg);
    setMode(chosenMode);
    setSectionsOrder(order);
    setCurrentSectionIdx(0);
    setSecondsLeft(SECTION_SECONDS[order[0]]);
    setReadingPassageIdx(0);
    setListeningSectionIdx(0);
    setReport(null);

    const savedRaw = window.localStorage.getItem(`ielts-mock-state-${pkg.id}-${chosenMode}`);
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw) as {
          listeningAnswers?: Record<string, string>;
          readingAnswers?: Record<string, string>;
          writingEssay?: string;
          speakingTranscript?: string;
        };
        setListeningAnswers(parsed.listeningAnswers ?? {});
        setReadingAnswers(parsed.readingAnswers ?? {});
        setWritingEssay(parsed.writingEssay ?? '');
        setSpeakingTranscript(parsed.speakingTranscript ?? '');
      } catch {
        setListeningAnswers({});
        setReadingAnswers({});
        setWritingEssay('');
        setSpeakingTranscript('');
      }
    } else {
      setListeningAnswers({});
      setReadingAnswers({});
      setWritingEssay('');
      setSpeakingTranscript('');
    }
    setStage('instructions');
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      showToast('Full-screen mode is restricted in embedded view; expanded exam layout active.');
    }
  };

  const estimateResponseBand = (text: string, minWords: number): number => {
    const wc = countWords(text);
    if (wc === 0) return 0;
    if (wc < Math.round(minWords * 0.4)) return 5.0;
    if (wc < Math.round(minWords * 0.75)) return 6.0;
    const uniqueRatio = new Set(text.toLowerCase().split(/\s+/)).size / Math.max(1, wc);
    if (wc >= minWords && uniqueRatio > 0.52) return 7.5;
    if (wc >= minWords) return 7.0;
    return 6.5;
  };

  const finalizeExam = async () => {
    if (!activePkg) return;
    setConfirmOpen(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const includesListening = sectionsOrder.includes('listening');
    const includesReading = sectionsOrder.includes('reading');
    const includesWriting = sectionsOrder.includes('writing');
    const includesSpeaking = sectionsOrder.includes('speaking');

    const lRes = includesListening
      ? gradeObjectiveTest(listeningTest.sections.flatMap((s) => s.questions), listeningAnswers, 'listening')
      : undefined;
    const rRes = includesReading
      ? gradeObjectiveTest(readingTest.questions, readingAnswers, 'reading', readingTest.mode)
      : undefined;
    const wBand = includesWriting ? estimateResponseBand(writingEssay, writingPrompt.minWords) : undefined;
    const sBand = includesSpeaking ? estimateResponseBand(speakingTranscript, 90) : undefined;

    const bands = [
      lRes?.estimatedBand ?? 0,
      rRes?.estimatedBand ?? 0,
      wBand ?? 0,
      sBand ?? 0,
    ].filter((b) => b > 0);
    const overallBand = calculateOverallBand(bands);

    const nextReport: MockReport = {
      mode,
      pkgTitle: mode === 'full' ? activePkg.title : `${activePkg.title} (${mode.toUpperCase()} Mock)`,
      listeningResult: lRes,
      readingResult: rRes,
      writingBand: wBand,
      writingWords: countWords(writingEssay),
      speakingBand: sBand,
      overallBand,
    };
    setReport(nextReport);
    setStage('results');
    window.localStorage.removeItem(`ielts-mock-state-${activePkg.id}-${mode}`);

    const totalScore = (lRes?.score ?? 0) + (rRes?.score ?? 0);
    const maxScore = (lRes?.maxScore ?? 0) + (rRes?.maxScore ?? 0) || 40;
    const elapsedSeconds = Math.max(30, Math.round((Date.now() - startTimeMs) / 1000));

    await recordAttempt({
      type: mode === 'full' ? 'full_mock' : mode,
      testId: `${activePkg.id}-${mode}`,
      testTitle: nextReport.pkgTitle,
      score: totalScore,
      maxScore,
      estimatedBand: overallBand,
      listeningBand: lRes?.estimatedBand,
      readingBand: rRes?.estimatedBand,
      writingBand: wBand,
      speakingBand: sBand,
      durationSeconds: elapsedSeconds,
    });
  };

  // 1. Mock Exam Hub
  if (stage === 'hub') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0B172A] text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-blue-300">Computer-Delivered IELTS Examination Engine</p>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold">
              Full 4-Skill Mock Exams & Individual Section Mocks
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Simulate official exam pacing: Listening (30 min), Reading (60 min), Writing (60 min), and Speaking (11–14 min)
              with automatic answer saving, timed auto-submission, and detailed band comparisons.
            </p>
          </div>
          <button
            type="button"
            onClick={() => launchMock(MOCK_PACKAGES[0], 'full')}
            className="px-5 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Launch Full Mock Exam #1
          </button>
        </div>

        {/* Mode A: Full Mock Exam Packages */}
        <div>
          <h3 className="text-lg font-bold text-[#0B172A] dark:text-white mb-3">
            A. Full Computer-Delivered Mock Exams (All 4 Skills)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Listening 30m · Reading 60m · Writing 60m · Speaking 14m
                  </p>
                  <h4 className="mt-1 text-base font-bold text-[#0B172A] dark:text-white">{pkg.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{pkg.subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => launchMock(pkg, 'full')}
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors"
                  >
                    Start Full Mock
                  </button>
                  <button
                    type="button"
                    onClick={() => launchMock(pkg, 'listening')}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Listening Only
                  </button>
                  <button
                    type="button"
                    onClick={() => launchMock(pkg, 'reading')}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Reading Only
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode B: Individual Section Mocks */}
        <div>
          <h3 className="text-lg font-bold text-[#0B172A] dark:text-white mb-3">
            B. Individual Skill Mock Tests
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                { m: 'listening', title: 'Listening Mock', time: '30 min · 40 Qs' },
                { m: 'reading', title: 'Reading Mock', time: '60 min · 40 Qs' },
                { m: 'writing', title: 'Writing Mock', time: '60 min · Essay' },
                { m: 'speaking', title: 'Speaking Mock', time: '14 min · Cue Card' },
              ] as const
            ).map((item) => (
              <button
                key={item.m}
                type="button"
                onClick={() => launchMock(MOCK_PACKAGES[0], item.m)}
                className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 hover:border-[#2563EB] transition-colors"
              >
                <p className="text-xs font-mono text-[#2563EB] dark:text-[#60A5FA]">{item.time}</p>
                <p className="mt-1 text-base font-bold text-[#0B172A] dark:text-white">{item.title}</p>
                <p className="mt-2 text-xs text-slate-500">Launch timed section →</p>
              </button>
            ))}
          </div>
        </div>

        {/* Completed Mock History */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6">
          <h3 className="text-base font-bold text-[#0B172A] dark:text-white mb-4">
            Completed Mock Exam History ({mockHistory.length})
          </h3>
          {mockHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No mock exams completed yet. Launch your first mock above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs text-slate-500">
                    <th className="pb-2 font-medium">Exam</th>
                    <th className="pb-2 font-medium text-right">L</th>
                    <th className="pb-2 font-medium text-right">R</th>
                    <th className="pb-2 font-medium text-right">W</th>
                    <th className="pb-2 font-medium text-right">S</th>
                    <th className="pb-2 font-medium text-right">Overall</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockHistory.map((h) => (
                    <tr key={h.id}>
                      <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{h.testTitle}</td>
                      <td className="py-3 text-right font-mono tabular-nums">{h.listeningBand?.toFixed(1) ?? '—'}</td>
                      <td className="py-3 text-right font-mono tabular-nums">{h.readingBand?.toFixed(1) ?? '—'}</td>
                      <td className="py-3 text-right font-mono tabular-nums">{h.writingBand?.toFixed(1) ?? '—'}</td>
                      <td className="py-3 text-right font-mono tabular-nums">{h.speakingBand?.toFixed(1) ?? '—'}</td>
                      <td className="py-3 text-right font-mono font-bold text-[#2563EB] dark:text-[#60A5FA] tabular-nums">
                        {h.estimatedBand.toFixed(1)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => launchMock(MOCK_PACKAGES[0], 'full')}
                          className="text-xs font-semibold text-[#2563EB] hover:underline"
                        >
                          Retake
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Section Instructions Screen
  if (stage === 'instructions' && activePkg) {
    return (
      <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
            Computer-Delivered Exam Briefing
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#0B172A] dark:text-white">
            {mode === 'full' ? activePkg.title : `${activePkg.title} — ${mode.toUpperCase()} Mock`}
          </h2>
        </div>

        <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
          <li>• Sections included: <strong className="capitalize">{sectionsOrder.join(' → ')}</strong></li>
          <li>• Every typed or selected answer is automatically saved locally to prevent accidental loss.</li>
          <li>• Each section enforces a strict countdown timer and advances automatically when time expires.</li>
          <li>• Results are unofficial practice band estimates computed using standard IELTS conversion tables.</li>
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setStage('hub')}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium"
          >
            Back to Mock Center
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium"
            >
              <Maximize2 className="w-4 h-4" />
              Full Screen
            </button>
            <button
              type="button"
              onClick={() => {
                setStartTimeMs(Date.now());
                setStage('exam');
              }}
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold"
            >
              Begin Timed Examination
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Final Results Screen
  if (stage === 'results' && report) {
    const previousMock = mockHistory.length > 1 ? mockHistory[1] : null;
    const bandDelta = previousMock ? Number((report.overallBand - previousMock.estimatedBand).toFixed(1)) : null;

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0B172A] text-white p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-blue-300">Unofficial IELTS Practice Mock Report</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold">{report.pkgTitle}</h2>
            {bandDelta != null && (
              <p className="mt-2 text-xs text-slate-300">
                Comparison vs. previous mock ({previousMock?.estimatedBand.toFixed(1)}):{' '}
                <strong className={bandDelta >= 0 ? 'text-emerald-400' : 'text-amber-300'}>
                  {bandDelta >= 0 ? `+${bandDelta.toFixed(1)}` : bandDelta.toFixed(1)} band
                </strong>
              </p>
            )}
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-300">Overall Estimated Band</p>
            <p className="font-mono text-5xl font-extrabold text-[#60A5FA] tabular-nums">
              {report.overallBand.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5">
            <p className="text-xs text-slate-500">Listening</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {report.listeningResult ? `${report.listeningResult.score}/40` : '—'}
            </p>
            <p className="text-xs font-semibold text-[#2563EB] mt-1">
              {report.listeningResult ? `Band ${report.listeningResult.estimatedBand.toFixed(1)}` : 'Not included'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5">
            <p className="text-xs text-slate-500">Reading</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {report.readingResult ? `${report.readingResult.score}/40` : '—'}
            </p>
            <p className="text-xs font-semibold text-[#2563EB] mt-1">
              {report.readingResult ? `Band ${report.readingResult.estimatedBand.toFixed(1)}` : 'Not included'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5">
            <p className="text-xs text-slate-500">Writing Estimate</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {report.writingBand != null ? report.writingBand.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {report.writingWords != null ? `${report.writingWords} words written` : 'Not included'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5">
            <p className="text-xs text-slate-500">Speaking Estimate</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
              {report.speakingBand != null ? report.speakingBand.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Unofficial self/AI estimate</p>
          </div>
        </div>

        {/* Answer Review */}
        {(report.listeningResult || report.readingResult) && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0B172A] dark:text-white">
              Detailed Question Review & Explanations
            </h3>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {[...(report.listeningResult?.details ?? []), ...(report.readingResult?.details ?? [])]
                .slice(0, 40)
                .map((d, i) => (
                  <div key={`${d.questionId}-${i}`} className="py-2.5 flex items-start gap-2.5 text-xs">
                    {d.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-mono font-bold mr-2">Q{d.number}</span>
                      <span>Your answer: <strong>{d.userAnswer || '(blank)'}</strong> · Key: <strong className="text-emerald-600">{d.correctAnswer}</strong></span>
                      <p className="text-slate-500 mt-0.5">{d.explanation}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStage('hub')}
            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold"
          >
            Back to Mock Center
          </button>
          {activePkg && (
            <button
              type="button"
              onClick={() => launchMock(activePkg, mode)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Mock Exam
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Live Computer-Delivered Exam Shell
  return (
    <div className="space-y-4">
      {/* Exam Header Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0B172A] text-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-sm sm:text-base">
            IELTS Computer-Delivered Mock
          </span>
          <div className="hidden sm:flex items-center gap-1">
            {sectionsOrder.map((sec, i) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  setCurrentSectionIdx(i);
                  setSecondsLeft(SECTION_SECONDS[sec]);
                }}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                  i === currentSectionIdx ? 'bg-[#2563EB] text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 font-mono text-sm font-bold tabular-nums">
            <Clock className="w-4 h-4 text-[#60A5FA]" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label="Toggle full-screen exam mode"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            Finish & Submit
          </button>
        </div>
      </div>

      {/* Section Workspace */}
      {currentSection === 'listening' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B172A] dark:text-white">
                Listening — {listeningTest.sections[listeningSectionIdx].title}
              </h3>
              <p className="text-xs text-slate-500">40 questions across 4 sections · Audio plays on demand</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(listeningTest.sections[listeningSectionIdx].transcript);
                    u.lang = 'en-GB';
                    window.speechSynthesis.speak(u);
                    showToast(`Playing Section ${listeningSectionIdx + 1} audio.`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold"
              >
                <Play className="w-3.5 h-3.5" />
                Play Section Audio
              </button>
              {listeningTest.sections.map((s, idx) => (
                <button
                  key={s.sectionNumber}
                  type="button"
                  onClick={() => setListeningSectionIdx(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                    listeningSectionIdx === idx ? 'bg-[#0B172A] text-white dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  S{s.sectionNumber}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {listeningTest.sections[listeningSectionIdx].questions.map((q) => (
              <div key={q.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  <span className="font-mono font-bold text-[#2563EB] mr-1.5">{q.number}.</span>
                  {q.prompt}
                </p>
                {q.options ? (
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setListeningAnswers((p) => ({ ...p, [q.id]: opt }))}
                        className={`px-2.5 py-1 rounded border text-xs ${
                          listeningAnswers[q.id] === opt
                            ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-200 font-semibold'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={listeningAnswers[q.id] ?? ''}
                    onChange={(e) => setListeningAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    placeholder="Your answer..."
                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {currentSection === 'reading' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {readingTest.passages.map((p) => (
              <button
                key={p.index}
                type="button"
                onClick={() => setReadingPassageIdx(p.index)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                  readingPassageIdx === p.index
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-700'
                }`}
              >
                {p.label}: {p.title.slice(0, 24)}...
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 max-h-[60vh] overflow-y-auto space-y-3">
              <h3 className="text-lg font-bold">{readingTest.passages[readingPassageIdx].title}</h3>
              {readingTest.passages[readingPassageIdx].paragraphs.map((para) => (
                <p key={para.id} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="font-mono text-[#2563EB] mr-2">{para.id}</strong>
                  {para.text}
                </p>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {readingTest.questions
                .filter((q) => q.passageIndex === readingPassageIdx)
                .map((q) => (
                  <div key={q.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                    <p className="text-sm font-medium">
                      <span className="font-mono font-bold text-[#2563EB] mr-1.5">{q.number}.</span>
                      {q.prompt}
                    </p>
                    {q.options ? (
                      <div className="flex flex-wrap gap-1.5">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setReadingAnswers((p) => ({ ...p, [q.id]: opt }))}
                            className={`px-2.5 py-1 rounded border text-xs ${
                              readingAnswers[q.id] === opt
                                ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-200 font-semibold'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={readingAnswers[q.id] ?? ''}
                        onChange={(e) => setReadingAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                        placeholder="Type answer..."
                        className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {currentSection === 'writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-3">
            <p className="text-xs font-semibold text-[#2563EB]">{writingPrompt.categoryLabel}</p>
            <h3 className="text-lg font-bold">{writingPrompt.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {writingPrompt.instructions}
            </p>
            <p className="text-xs text-slate-500">Minimum recommended length: {writingPrompt.minWords} words.</p>
          </div>
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span>Word count: {countWords(writingEssay)}</span>
              <span className="text-slate-500">Autosaved</span>
            </div>
            <textarea
              rows={13}
              value={writingEssay}
              onChange={(e) => setWritingEssay(e.target.value)}
              placeholder="Write your full mock essay here..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950/60 p-4 text-sm leading-relaxed"
            />
          </div>
        </div>
      )}

      {currentSection === 'speaking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#2563EB]">Speaking Mock Cue Card</p>
              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(speakingCard.prompt));
                  }
                }}
                aria-label="Play speaking cue card prompt"
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold">{speakingCard.title}</h3>
            <p className="text-sm font-medium">{speakingCard.prompt}</p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {speakingCard.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5 space-y-3">
            <label htmlFor="mock-speaking-box" className="text-xs font-semibold text-slate-500">
              Spoken Response Transcript (Speak aloud & record notes/transcript)
            </label>
            <textarea
              id="mock-speaking-box"
              rows={9}
              value={speakingTranscript}
              onChange={(e) => setSpeakingTranscript(e.target.value)}
              placeholder="Transcribe or type your Part 2 long-turn spoken response..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950/60 p-4 text-sm leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Previous / Next Section Controls */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-4">
        <button
          type="button"
          disabled={currentSectionIdx === 0}
          onClick={() => {
            const prev = currentSectionIdx - 1;
            setCurrentSectionIdx(prev);
            setSecondsLeft(SECTION_SECONDS[sectionsOrder[prev]]);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Section
        </button>

        {currentSectionIdx < sectionsOrder.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              const next = currentSectionIdx + 1;
              setCurrentSectionIdx(next);
              setSecondsLeft(SECTION_SECONDS[sectionsOrder[next]]);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B172A] dark:bg-[#2563EB] text-white text-sm font-semibold"
          >
            Next Section ({sectionsOrder[currentSectionIdx + 1]})
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold"
          >
            Review & Submit Exam
          </button>
        )}
      </div>

      {/* Warning Modal Before Submitting */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-submit-title"
        >
          <div className="max-w-md w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 id="mock-submit-title" className="text-lg font-bold text-[#0B172A] dark:text-white">
                Submit Mock Examination?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Once submitted, your answers will be scored immediately and saved to your Exam History. Unanswered items will be counted as blank.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium"
              >
                Continue Testing
              </button>
              <button
                type="button"
                onClick={() => void finalizeExam()}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold"
              >
                Confirm & Grade Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
