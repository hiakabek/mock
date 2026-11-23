import React, { useState } from 'react';
import {
  LayoutDashboard,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  ClipboardCheck,
  BookMarked,
  GraduationCap,
  CalendarDays,
  Sparkles,
  MessageSquare,
  Award,
  Trophy,
  Newspaper,
  User,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  LogIn,
  Home,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PageId } from '../types/ielts';

interface NavGroup {
  label: string;
  items: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'mock-exams', label: 'Full Mock Tests', icon: ClipboardCheck },
      { id: 'study-plans', label: 'Study Plans', icon: CalendarDays },
    ],
  },
  {
    label: 'Four Skills',
    items: [
      { id: 'listening', label: 'Listening Practice', icon: Headphones },
      { id: 'reading', label: 'Reading Practice', icon: BookOpen },
      { id: 'writing', label: 'Writing Practice', icon: PenTool },
      { id: 'speaking', label: 'Speaking Practice', icon: Mic },
    ],
  },
  {
    label: 'AI Coaching',
    items: [
      { id: 'ai-writing', label: 'AI Writing Evaluator', icon: Sparkles },
      { id: 'ai-speaking', label: 'AI Speaking Evaluator', icon: Mic },
      { id: 'ai-tutor', label: 'AI IELTS Tutor', icon: MessageSquare },
    ],
  },
  {
    label: 'Academy & Library',
    items: [
      { id: 'vocabulary', label: 'Vocabulary Builder', icon: BookMarked },
      { id: 'grammar', label: 'Grammar Academy', icon: GraduationCap },
      { id: 'band9-samples', label: 'Band 9 Samples', icon: Award },
      { id: 'articles', label: 'Articles & Tips', icon: Newspaper },
    ],
  },
  {
    label: 'Community & Account',
    items: [
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
      { id: 'achievements', label: 'Achievements', icon: Award },
      { id: 'profile', label: 'User Profile', icon: User },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck },
    ],
  },
];

const PAGE_TITLES: Record<PageId, string> = {
  home: 'Home',
  dashboard: 'Student Dashboard',
  listening: 'Listening Practice',
  reading: 'Reading Practice',
  writing: 'Writing Practice',
  speaking: 'Speaking Practice',
  'mock-exams': 'Full IELTS Mock Tests',
  vocabulary: 'Vocabulary Builder',
  grammar: 'Grammar Academy',
  'study-plans': 'IELTS Study Plans',
  'ai-writing': 'AI Writing Evaluator',
  'ai-speaking': 'AI Speaking Evaluator',
  'ai-tutor': 'AI IELTS Tutor',
  'band9-samples': 'Band 9 Sample Answers',
  leaderboard: 'Leaderboard',
  articles: 'Articles & Tips',
  profile: 'User Profile',
  achievements: 'Achievements',
  settings: 'Settings & Plan',
  admin: 'Admin Dashboard',
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    page,
    setPage,
    theme,
    toggleTheme,
    firebaseUser,
    profile,
    setAuthModalOpen,
    logout,
    toast,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean 3-Zone Top Bar Contract for Home Landing Page
  if (page === 'home') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070E1A] text-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#070E1A]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
            <button
              type="button"
              onClick={() => setPage('home')}
              className="font-display text-lg font-extrabold tracking-tight text-[#0B172A] dark:text-white whitespace-nowrap shrink-0"
            >
              IELTS MASTER
            </button>

            <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setPage('listening')}
                className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap shrink-0"
              >
                Practice
              </button>
              <button
                type="button"
                onClick={() => setPage('mock-exams')}
                className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap shrink-0"
              >
                Mock Exams
              </button>
              <button
                type="button"
                onClick={() => setPage('ai-writing')}
                className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap shrink-0"
              >
                AI Evaluators
              </button>
              <button
                type="button"
                onClick={() => setPage('vocabulary')}
                className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap shrink-0"
              >
                Academy
              </button>
              <button
                type="button"
                onClick={() => setPage('settings')}
                className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap shrink-0"
              >
                Plans
              </button>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPage('dashboard')}
                className="px-4 py-2 rounded-lg bg-[#0B172A] dark:bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1E293B] dark:hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
              >
                {firebaseUser ? 'Dashboard' : 'Start Learning'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {toast && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#0B172A] dark:bg-slate-800 text-white px-4 py-3 text-sm font-medium shadow-lg border border-slate-700"
          >
            {toast}
          </div>
        )}
      </div>
    );
  }

  const handleSelectNav = (id: PageId) => {
    setPage(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#070E1A] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1426] sticky top-0 h-screen">
        <div className="h-16 px-5 flex items-center border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setPage('home')}
            className="font-display text-lg font-extrabold tracking-tight text-[#0B172A] dark:text-white whitespace-nowrap"
          >
            IELTS MASTER
          </button>
        </div>

        <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#2563EB] text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/70 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Target Band</span>
            <span className="font-mono font-semibold text-[#2563EB] dark:text-[#60A5FA] tabular-nums">
              {profile.targetBand.toFixed(1)}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0B1426] h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <span className="font-display font-extrabold text-[#0B172A] dark:text-white">IELTS MASTER</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav aria-label="Mobile workspace navigation" className="flex-1 overflow-y-auto p-3 space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-3 mb-1 text-xs font-semibold text-slate-400">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = page === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectNav(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                            active
                              ? 'bg-[#2563EB] text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 sm:h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1426]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <button
                type="button"
                onClick={() => setPage('dashboard')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hidden sm:inline whitespace-nowrap"
              >
                Workspace
              </button>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <h1 className="font-semibold text-slate-900 dark:text-white truncate">
                {PAGE_TITLES[page]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {firebaseUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage('profile')}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{profile.displayName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  aria-label="Sign out"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#0B172A] dark:bg-slate-800 text-white px-4 py-3 text-sm font-medium shadow-lg border border-slate-700"
        >
          {toast}
        </div>
      )}
    </div>
  );
};
