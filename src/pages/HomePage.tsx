import React, { useState } from 'react';
import {
  ArrowRight,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  ClipboardCheck,
  Sparkles,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const HERO_IMAGE = '/src/assets/images/hero_ielts_campus_1795414564576.jpg';

export const HomePage: React.FC = () => {
  const { setPage, setAuthModalOpen, firebaseUser, theme, toggleTheme } = useApp();
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#070E1A]">
      {/* Hero Section: Balanced 2-Column Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-[#2563EB] dark:text-[#60A5FA] mb-3">
              Academic & General Training Preparation
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B172A] dark:text-white leading-[1.1] max-w-xl">
              Master Every IELTS Skill With Precision Mock Exams
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Practice across 20 original Listening tests, 20 Academic and General Training Reading exams,
              computer-delivered full mocks, Gemini AI Writing & Speaking evaluators, and bilingual English–Uzbek vocabulary and grammar courses.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPage('dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage('mock-exams')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F1B2E] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Take Full Mock Exam
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="whitespace-nowrap">Unofficial band estimates</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">Original exam content</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">Cloud progress sync</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0B172A]">
              {!heroImgFailed ? (
                <img
                  src={HERO_IMAGE}
                  alt="Modern architectural university study desk prepared for IELTS academic study"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#0B172A] to-[#1E3A8A] text-white">
                  <ClipboardCheck className="w-12 h-12 mb-3 text-blue-300" />
                  <p className="font-display text-lg font-bold">IELTS MASTER Computer-Delivered Studio</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070E1A]/95 via-[#070E1A]/75 to-transparent pt-12 px-6 pb-6 text-white">
                <p className="text-xs font-semibold text-blue-200">Computer-Delivered Exam Interface</p>
                <p className="text-sm sm:text-base font-semibold mt-1 text-white">
                  Timed 4-skill mock exams with instant scoring and detailed criterion feedback
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Quantitative Strip Below Hero Split */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0E1A2D] divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {[
            { value: '40+', label: 'Original Listening & Reading Tests (1,600 Questions)' },
            { value: '4 Skills', label: 'Full Computer-Delivered Timed Mock Simulator' },
            { value: '4 Criteria', label: 'Gemini AI Writing & Speaking Band Diagnostics' },
            { value: 'EN / UZ', label: 'Bilingual Vocabulary Builder & Grammar Academy' },
          ].map((stat) => (
            <div key={stat.label} className="p-5">
              <p className="font-mono text-2xl font-bold text-[#0B172A] dark:text-white tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Skill Modules */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1426] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B172A] dark:text-white">
              Four Integrated IELTS Preparation Studios
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Every module tracks your scores, highlights mistakes, and updates your estimated band profile automatically.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'listening' as const,
                icon: Headphones,
                title: 'Listening Practice',
                meta: '20 Tests · 4 Sections Each',
                desc: 'Audio playback with progress scrubber, volume control, map labeling, matching, and automatic band conversion.',
              },
              {
                id: 'reading' as const,
                icon: BookOpen,
                title: 'Reading Practice',
                meta: '20 Tests · Academic & GT',
                desc: 'Side-by-side passage and questions, text highlighter, 60-minute timer, and all eight IELTS question types.',
              },
              {
                id: 'writing' as const,
                icon: PenTool,
                title: 'Writing Studio & AI',
                meta: 'Task 1 Charts · Task 2 Essays',
                desc: 'Interactive graphs, tables, maps, and processes with live word counter, timers, and Gemini 4-criteria evaluation.',
              },
              {
                id: 'speaking' as const,
                icon: Mic,
                title: 'Speaking Simulator',
                meta: 'Parts 1, 2 & 3 · Mic Recording',
                desc: 'Cue cards with 1-min prep and 2-min speaking timers, voice recording, transcription, and AI fluency feedback.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0E1A2D] p-6"
                >
                  <div>
                    <Icon className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{item.meta}</p>
                    <h3 className="mt-1 text-lg font-bold text-[#0B172A] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage(item.id)}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                  >
                    <span>Open module</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Complete Ecosystem Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0B172A] text-white p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-blue-300">Flagship Exam Simulator</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
                Full Computer-Delivered IELTS Mock Examinations
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Experience realistic exam conditions across Listening (30 min), Reading (60 min), Writing (60 min),
                and Speaking (11–14 min)—or launch focused single-skill mocks with auto-submit timers, warning prompts,
                and historical attempt comparisons.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPage('mock-exams')}
                className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors"
              >
                Launch Mock Exam Center
              </button>
              <button
                type="button"
                onClick={() => setPage('study-plans')}
                className="px-5 py-2.5 rounded-lg border border-slate-600 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
              >
                Generate Study Plan
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-7 flex flex-col justify-between">
            <div>
              <Sparkles className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
              <h3 className="mt-3 text-xl font-bold text-[#0B172A] dark:text-white">
                Personal AI IELTS Tutor
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ask grammar questions, drill vocabulary, or practice essays in English or Uzbek—adapted directly to your CEFR level (A1–C2).
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPage('ai-tutor')}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0B172A] dark:bg-[#2563EB] text-white text-sm font-semibold hover:opacity-95 transition-opacity"
              >
                Open AI Tutor Chat
              </button>
              <button
                type="button"
                onClick={() => setPage('band9-samples')}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Explore Band 9 Library
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs Premium Pricing Comparison */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1426] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B172A] dark:text-white">
              Transparent Plans for Every Target Band
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Start immediately on the Free plan. Premium billing activates only when a verified payment provider is connected.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0E1A2D] p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">For self-paced learners</p>
                <h3 className="mt-1 text-xl font-bold text-[#0B172A] dark:text-white">Free Starter</h3>
                <p className="mt-3 font-mono text-3xl font-bold text-[#0B172A] dark:text-white tabular-nums">
                  $0 <span className="text-sm font-sans font-normal text-slate-500">/ month</span>
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                  {[
                    '5 full Listening & 5 full Reading practice tests',
                    'Selected computer-delivered mock examinations',
                    'Core EN/UZ Vocabulary Builder & Grammar Academy',
                    'Student Dashboard & progress history tracking',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => (firebaseUser ? setPage('dashboard') : setAuthModalOpen(true))}
                className="mt-8 w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {firebaseUser ? 'Go to Dashboard' : 'Create Free Account'}
              </button>
            </div>

            <div className="rounded-xl border-2 border-[#2563EB] bg-white dark:bg-[#0E1A2D] p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">For intensive Band 7.5–9.0 prep</p>
                <h3 className="mt-1 text-xl font-bold text-[#0B172A] dark:text-white">Premium Scholar</h3>
                <p className="mt-3 font-mono text-3xl font-bold text-[#0B172A] dark:text-white tabular-nums">
                  $19 <span className="text-sm font-sans font-normal text-slate-500">/ month</span>
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                  {[
                    'All 20 Listening & 20 Reading tests (1,600+ questions)',
                    'Unlimited Full 4-Skill Mock Exams & historical analytics',
                    'Detailed Gemini AI Writing & Speaking 4-criteria feedback',
                    'Personalized 7/30/60/90-day study plans & Band 9 library',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setPage('settings')}
                className="mt-8 w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors"
              >
                View Subscription Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#070E1A] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-slate-900 dark:text-white">IELTS MASTER</span>
            <span>All practice scores are unofficial educational estimates.</span>
          </div>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => setPage('articles')} className="hover:text-slate-900 dark:hover:text-white">
              Articles
            </button>
            <button type="button" onClick={() => setPage('leaderboard')} className="hover:text-slate-900 dark:hover:text-white">
              Leaderboard
            </button>
            <button type="button" onClick={() => setPage('admin')} className="hover:text-slate-900 dark:hover:text-white">
              Admin
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
