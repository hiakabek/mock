export type ReadingMode = 'academic' | 'general';

export function rawScoreToListeningBand(score: number): number {
  const s = Math.max(0, Math.min(40, Math.round(score)));
  if (s >= 39) return 9.0;
  if (s >= 37) return 8.5;
  if (s >= 35) return 8.0;
  if (s >= 32) return 7.5;
  if (s >= 30) return 7.0;
  if (s >= 26) return 6.5;
  if (s >= 23) return 6.0;
  if (s >= 18) return 5.5;
  if (s >= 16) return 5.0;
  if (s >= 13) return 4.5;
  if (s >= 10) return 4.0;
  if (s >= 6) return 3.5;
  if (s >= 4) return 3.0;
  if (s >= 2) return 2.5;
  if (s >= 1) return 2.0;
  return 0;
}

export function rawScoreToReadingBand(score: number, mode: ReadingMode = 'academic'): number {
  const s = Math.max(0, Math.min(40, Math.round(score)));
  if (mode === 'general') {
    if (s >= 40) return 9.0;
    if (s >= 39) return 8.5;
    if (s >= 37) return 8.0;
    if (s >= 36) return 7.5;
    if (s >= 34) return 7.0;
    if (s >= 32) return 6.5;
    if (s >= 30) return 6.0;
    if (s >= 27) return 5.5;
    if (s >= 23) return 5.0;
    if (s >= 19) return 4.5;
    if (s >= 15) return 4.0;
    if (s >= 12) return 3.5;
    if (s >= 9) return 3.0;
    if (s >= 6) return 2.5;
    if (s >= 3) return 2.0;
    return 0;
  }
  if (s >= 39) return 9.0;
  if (s >= 37) return 8.5;
  if (s >= 35) return 8.0;
  if (s >= 33) return 7.5;
  if (s >= 30) return 7.0;
  if (s >= 27) return 6.5;
  if (s >= 23) return 6.0;
  if (s >= 19) return 5.5;
  if (s >= 15) return 5.0;
  if (s >= 13) return 4.5;
  if (s >= 10) return 4.0;
  if (s >= 8) return 3.5;
  if (s >= 6) return 3.0;
  if (s >= 4) return 2.5;
  if (s >= 2) return 2.0;
  return 0;
}

/**
 * Official IELTS overall band rounding rule:
 * Average of valid bands rounded to nearest 0.5 (.25 rounds up to .5, .75 rounds up to next whole band).
 */
export function calculateOverallBand(bands: number[]): number {
  const valid = bands.filter((b) => typeof b === 'number' && !Number.isNaN(b) && b > 0);
  if (valid.length === 0) return 0;
  const avg = valid.reduce((acc, b) => acc + b, 0) / valid.length;
  const rounded = Math.round(avg * 2) / 2;
  return Math.min(9.0, Math.max(0, rounded));
}

export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    .replace(/\s+/g, ' ');
}

export function checkQuestionAnswer(
  userAnswer: string | undefined,
  acceptedAnswers: string[]
): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  return acceptedAnswers.some((ans) => normalizeAnswer(ans) === normalizedUser);
}

export function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface GradableQuestion {
  id: string;
  number: number;
  acceptedAnswers: string[];
  explanation: string;
}

export interface GradingResult {
  score: number;
  maxScore: number;
  estimatedBand: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  details: {
    questionId: string;
    number: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export function gradeObjectiveTest(
  questions: GradableQuestion[],
  answers: Record<string, string>,
  skill: 'listening' | 'reading',
  readingMode: ReadingMode = 'academic'
): GradingResult {
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const details = questions.map((q) => {
    const raw = (answers[q.id] ?? '').trim();
    const isCorrect = checkQuestionAnswer(raw, q.acceptedAnswers);
    if (!raw) {
      unansweredCount += 1;
    } else if (isCorrect) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
    return {
      questionId: q.id,
      number: q.number,
      userAnswer: raw,
      correctAnswer: q.acceptedAnswers[0] ?? '',
      isCorrect,
      explanation: q.explanation,
    };
  });

  const maxScore = questions.length;
  const scaled40 = maxScore > 0 ? Math.round((correctCount / maxScore) * 40) : 0;
  const estimatedBand =
    skill === 'listening'
      ? rawScoreToListeningBand(scaled40)
      : rawScoreToReadingBand(scaled40, readingMode);

  return {
    score: correctCount,
    maxScore,
    estimatedBand,
    correctCount,
    incorrectCount,
    unansweredCount,
    details,
  };
}
