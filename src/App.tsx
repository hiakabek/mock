import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ListeningPracticePage } from './pages/ListeningPracticePage';
import { ReadingPracticePage } from './pages/ReadingPracticePage';
import { WritingPracticePage } from './pages/WritingPracticePage';
import { SpeakingPracticePage } from './pages/SpeakingPracticePage';
import { MockExamsPage } from './pages/MockExamsPage';
import { VocabularyBuilderPage } from './pages/VocabularyBuilderPage';
import { GrammarAcademyPage } from './pages/GrammarAcademyPage';
import { StudyPlansPage } from './pages/StudyPlansPage';
import { AiTutorPage } from './pages/AiTutorPage';
import { Band9SamplesPage } from './pages/Band9SamplesPage';
import { LeaderboardPage, ArticlesPage } from './pages/CommunityAndArticlesPage';
import { ProfilePage, AchievementsPage, SettingsPage } from './pages/AccountPages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ActivePageRouter: React.FC = () => {
  const { page } = useApp();

  switch (page) {
    case 'home':
      return <HomePage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'listening':
      return <ListeningPracticePage />;
    case 'reading':
      return <ReadingPracticePage />;
    case 'writing':
      return <WritingPracticePage />;
    case 'speaking':
      return <SpeakingPracticePage />;
    case 'mock-exams':
      return <MockExamsPage />;
    case 'vocabulary':
      return <VocabularyBuilderPage />;
    case 'grammar':
      return <GrammarAcademyPage />;
    case 'study-plans':
      return <StudyPlansPage />;
    case 'ai-writing':
      return <WritingPracticePage evaluatorFocus />;
    case 'ai-speaking':
      return <SpeakingPracticePage evaluatorFocus />;
    case 'ai-tutor':
      return <AiTutorPage />;
    case 'band9-samples':
      return <Band9SamplesPage />;
    case 'leaderboard':
      return <LeaderboardPage />;
    case 'articles':
      return <ArticlesPage />;
    case 'profile':
      return <ProfilePage />;
    case 'achievements':
      return <AchievementsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'admin':
      return <AdminDashboardPage />;
    default:
      return <HomePage />;
  }
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppShell>
          <ActivePageRouter />
        </AppShell>
        <AuthModal />
      </AppProvider>
    </ErrorBoundary>
  );
}
