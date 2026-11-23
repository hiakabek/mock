export type PageId =
  | 'home'
  | 'dashboard'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'mock-exams'
  | 'vocabulary'
  | 'grammar'
  | 'study-plans'
  | 'ai-writing'
  | 'ai-speaking'
  | 'ai-tutor'
  | 'band9-samples'
  | 'leaderboard'
  | 'articles'
  | 'profile'
  | 'achievements'
  | 'settings'
  | 'admin';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type UserRole = 'student' | 'admin';
export type SubscriptionPlan = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  role: UserRole;
  plan: SubscriptionPlan;
  currentLevel: CEFRLevel;
  targetBand: number;
  examDate: string;
  dailyStudyMinutes: number;
  dailyWordGoal: number;
  xp: number;
  streak: number;
  studyHours: number;
  masteredWordIds: string[];
  favoriteWordIds: string[];
  completedGrammarIds: string[];
  unlockedAchievementIds: string[];
}

export interface TestAttempt {
  id: string;
  userId: string;
  type: 'listening' | 'reading' | 'writing' | 'speaking' | 'full_mock';
  testId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  estimatedBand: number;
  listeningBand?: number;
  readingBand?: number;
  writingBand?: number;
  speakingBand?: number;
  durationSeconds: number;
  status: 'completed';
  createdAtIso: string;
}

export interface WritingEvaluation {
  overallBand: number;
  taskAchievement: { band: number; feedback: string };
  coherenceCohesion: { band: number; feedback: string };
  lexicalResource: { band: number; feedback: string };
  grammaticalRange: { band: number; feedback: string };
  grammarMistakes: { original: string; correction: string; explanation: string }[];
  vocabularyImprovements: { basic: string; upgraded: string; context: string }[];
  sentenceRecommendations: string[];
  improvedExamples: string[];
  personalizedSuggestions: string[];
  detailedSummary: string;
  disclaimer: string;
}

export interface WritingSubmission {
  id: string;
  userId: string;
  taskType: 'academic_task1' | 'gt_task1' | 'task2';
  promptTitle: string;
  essayText: string;
  wordCount: number;
  estimatedBand: number;
  feedbackSummary: string;
  createdAtIso: string;
}

export interface SpeakingEvaluation {
  overallBand: number;
  fluencyCoherence: { band: number; feedback: string };
  lexicalResource: { band: number; feedback: string };
  grammaticalRange: { band: number; feedback: string };
  pronunciation: { band: number; feedback: string };
  vocabularyUpgrades: string[];
  grammarFixes: string[];
  improvedAnswer: string;
  actionableTips: string[];
  disclaimer: string;
}

export interface SpeakingSubmission {
  id: string;
  userId: string;
  part: 'part1' | 'part2' | 'part3';
  topicTitle: string;
  transcript: string;
  durationSeconds: number;
  estimatedBand: number;
  feedbackSummary: string;
  createdAtIso: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xp: number;
  weeklyXp: number;
  monthlyXp: number;
  streak: number;
  bestBand: number;
  mocksCompleted: number;
}

export interface CustomContentItem {
  id: string;
  contentType:
    | 'listening'
    | 'reading'
    | 'writing'
    | 'speaking'
    | 'vocabulary'
    | 'grammar'
    | 'article'
    | 'announcement';
  title: string;
  category: string;
  summary: string;
  body: string;
  published: boolean;
  authorId: string;
  createdAtIso: string;
}
