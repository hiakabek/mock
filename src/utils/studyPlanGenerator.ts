export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type PlanDuration = 7 | 30 | 60 | 90;

export interface StudyPlanConfig {
  durationDays: PlanDuration;
  currentLevel: CEFRLevel;
  targetBand: number;
  dailyMinutes: number;
  examDate?: string;
}

export interface StudyTask {
  id: string;
  day: number;
  skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Vocabulary' | 'Grammar' | 'Mock Exam';
  title: string;
  minutes: number;
  targetPage: string;
}

export interface StudyPlanDay {
  day: number;
  phase: string;
  focus: string;
  tasks: StudyTask[];
}

const PHASE_NAMES = [
  'Foundation & Diagnostics',
  'Core Skill Precision',
  'Timed Exam Execution',
  'Band Peak & Full Simulation',
];

const LISTENING_DRILLS = [
  'Complete Section 1–2 everyday context dialogue & form completion',
  'Practice Section 3 academic discussion & multiple-choice traps',
  'Complete full 40-question Listening test under 30-min audio pacing',
  'Review wrong answers & transcribe signpost words from Section 4 lecture',
];

const READING_DRILLS = [
  'Practice skimming & scanning on Passage 1 (True/False/Not Given)',
  'Master Matching Headings & Summary Completion on Passage 2',
  'Timed 20-minute Passage 3 inference & Yes/No/Not Given set',
  'Full 60-minute Academic Reading test with error-log analysis',
];

const WRITING_DRILLS = [
  'Write Academic Task 1 overview & trend comparison (150+ words)',
  'Draft Task 2 Opinion Essay outline + body paragraphs (250+ words)',
  'Submit full Task 2 essay to AI Writing Evaluator & rewrite 3 weak sentences',
  'Practice General Training / Process & Map Task 1 description (20 min)',
];

const SPEAKING_DRILLS = [
  'Record 5 Part 1 everyday topic answers focusing on natural extension',
  'Complete 2 Part 2 Cue Cards (1-min prep + 2-min continuous talk)',
  'Practice Part 3 abstract discussion & submit transcript for AI Speaking review',
  'Shadow Band 9 Speaking sample answers for intonation & linking phrases',
];

const VOCAB_CATEGORIES = [
  'Academic Vocabulary',
  'Environment',
  'Education',
  'Technology',
  'Health',
  'Business',
  'Society',
  'Science',
  'Culture',
  'Government',
  'IELTS Writing Vocabulary',
  'IELTS Speaking Vocabulary',
];

const GRAMMAR_TOPICS = [
  'All English Tenses',
  'Articles (a/an/the)',
  'Prepositions of Time & Place',
  'Modal Verbs for Hedging',
  'Passive Voice in Processes',
  'Zero to Third Conditionals',
  'Defining & Non-defining Relative Clauses',
  'Reported Speech',
  'Complex & Compound-Complex Sentences',
  'Subject-Verb Agreement',
  'Academic Punctuation',
];

export function generateStudyPlan(config: StudyPlanConfig): StudyPlanDay[] {
  const { durationDays, currentLevel, targetBand, dailyMinutes } = config;
  const days: StudyPlanDay[] = [];
  const wordsPerDay = dailyMinutes >= 120 ? 20 : dailyMinutes >= 60 ? 15 : 10;
  const isFoundationLevel = currentLevel === 'A1' || currentLevel === 'A2' || currentLevel === 'B1';

  for (let d = 1; d <= durationDays; d++) {
    const progressRatio = (d - 1) / Math.max(1, durationDays - 1);
    const phaseIndex = Math.min(3, Math.floor(progressRatio * 4));
    const phase = PHASE_NAMES[phaseIndex];

    const isMockDay = d === durationDays || (durationDays >= 30 && d % 7 === 0) || (durationDays === 7 && d === 6);
    const tasks: StudyTask[] = [];

    if (isMockDay) {
      const mockTime = Math.max(45, Math.min(dailyMinutes, 165));
      tasks.push({
        id: `d${d}-mock`,
        day: d,
        skill: 'Mock Exam',
        title:
          durationDays === 7 && d === 6
            ? 'Full Computer-Delivered IELTS Mock Exam (Timed)'
            : `Checkpoint Full Mock Exam #${Math.ceil(d / 7)} (Target Band ${targetBand.toFixed(1)})`,
        minutes: mockTime,
        targetPage: 'mock-exams',
      });
      tasks.push({
        id: `d${d}-review`,
        day: d,
        skill: 'Writing',
        title: 'Analyze Mock Results & review AI Writing/Speaking band feedback',
        minutes: Math.max(15, Math.round(dailyMinutes * 0.25)),
        targetPage: 'ai-writing',
      });
    } else {
      const primaryMinute = Math.round(dailyMinutes * 0.4);
      const secondaryMinute = Math.round(dailyMinutes * 0.35);
      const microMinute = Math.max(10, dailyMinutes - primaryMinute - secondaryMinute);

      const cycle = (d - 1) % 4;
      if (cycle === 0) {
        tasks.push({
          id: `d${d}-listening`,
          day: d,
          skill: 'Listening',
          title: LISTENING_DRILLS[(d - 1) % LISTENING_DRILLS.length],
          minutes: primaryMinute,
          targetPage: 'listening',
        });
        tasks.push({
          id: `d${d}-grammar`,
          day: d,
          skill: 'Grammar',
          title: `Grammar Academy: ${GRAMMAR_TOPICS[(d - 1) % GRAMMAR_TOPICS.length]} + interactive quiz`,
          minutes: secondaryMinute,
          targetPage: 'grammar',
        });
      } else if (cycle === 1) {
        tasks.push({
          id: `d${d}-reading`,
          day: d,
          skill: 'Reading',
          title: READING_DRILLS[(d - 1) % READING_DRILLS.length],
          minutes: primaryMinute,
          targetPage: 'reading',
        });
        tasks.push({
          id: `d${d}-speaking`,
          day: d,
          skill: 'Speaking',
          title: SPEAKING_DRILLS[(d - 1) % SPEAKING_DRILLS.length],
          minutes: secondaryMinute,
          targetPage: 'speaking',
        });
      } else if (cycle === 2) {
        tasks.push({
          id: `d${d}-writing`,
          day: d,
          skill: 'Writing',
          title: WRITING_DRILLS[(d - 1) % WRITING_DRILLS.length],
          minutes: primaryMinute,
          targetPage: 'writing',
        });
        tasks.push({
          id: `d${d}-listening`,
          day: d,
          skill: 'Listening',
          title: LISTENING_DRILLS[d % LISTENING_DRILLS.length],
          minutes: secondaryMinute,
          targetPage: 'listening',
        });
      } else {
        tasks.push({
          id: `d${d}-reading`,
          day: d,
          skill: 'Reading',
          title: READING_DRILLS[d % READING_DRILLS.length],
          minutes: primaryMinute,
          targetPage: 'reading',
        });
        tasks.push({
          id: `d${d}-writing`,
          day: d,
          skill: 'Writing',
          title: isFoundationLevel
            ? 'Study Band 9 Sample Answer structure & paraphrase 5 topic sentences'
            : WRITING_DRILLS[d % WRITING_DRILLS.length],
          minutes: secondaryMinute,
          targetPage: isFoundationLevel ? 'band9-samples' : 'writing',
        });
      }

      tasks.push({
        id: `d${d}-vocab`,
        day: d,
        skill: 'Vocabulary',
        title: `Master ${wordsPerDay} words in ${VOCAB_CATEGORIES[(d - 1) % VOCAB_CATEGORIES.length]} (Spaced Repetition)`,
        minutes: microMinute,
        targetPage: 'vocabulary',
      });
    }

    const focus = isMockDay
      ? 'Full Timed Simulation & Error Diagnostics'
      : tasks.map((t) => t.skill).join(' + ');

    days.push({ day: d, phase, focus, tasks });
  }

  return days;
}
