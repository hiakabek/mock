import React, { useState } from 'react';
import { Send, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import type { CEFRLevel } from '../types/ielts';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  'Explain the difference between FALSE and NOT GIVEN in IELTS Reading with 2 examples.',
  'Give me 5 Band 8 collocations for an IELTS Writing Task 2 essay on climate policy.',
  'Create a 3-question mini-quiz on Present Perfect vs Past Simple for my level.',
  'Menga IELTS Speaking Part 2 da qanday qilib 2 daqiqa to‘xtamay gapirishni o‘zbek tilida tushuntiring.',
];

export const AiTutorPage: React.FC = () => {
  const { profile } = useApp();
  const [level, setLevel] = useState<CEFRLevel>(profile.currentLevel);
  const [language, setLanguage] = useState<'en' | 'uz'>('en');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to your personal AI IELTS Tutor! Select your CEFR level (A1–C2) and preferred language (English or Uzbek) above, then ask any grammar, vocabulary, writing, reading, or speaking question.',
    },
  ]);

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || loading) return;
    setError(null);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          level,
          language,
        }),
      });
      const data = (await resp.json()) as { reply?: string; error?: string };
      if (!resp.ok || !data.reply) {
        setError(data.error || 'Unable to reach Gemini AI Tutor.');
        return;
      }
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: data.reply! }]);
    } catch {
      setError('Network error while connecting to the AI IELTS Tutor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5">
        <div>
          <h2 className="text-xl font-bold text-[#0B172A] dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2563EB]" />
            Personal AI IELTS Tutor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Adaptive explanations tailored to your CEFR level in English or Uzbek.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="tutor-level">CEFR Level</label>
          <select
            id="tutor-level"
            value={level}
            onChange={(e) => setLevel(e.target.value as CEFRLevel)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
          >
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((l) => (
              <option key={l} value={l}>
                Level {l}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                language === 'en' ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('uz')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                language === 'uz' ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              O‘zbekcha
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMessages(messages.slice(0, 1))}
            aria-label="Clear chat history"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STARTER_PROMPTS.map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => void sendMessage(sp)}
            className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] hover:border-[#2563EB] text-xs text-slate-700 dark:text-slate-300 transition-colors"
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Chat Stream */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              AI IELTS Tutor is preparing your {level} explanation...
            </div>
          )}
        </div>

        {error && (
          <div className="mx-5 mb-2 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
          }}
          className="border-t border-slate-200 dark:border-slate-800 p-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a grammar rule, practice conversation, or paste a sentence for feedback..."
            aria-label="Message AI IELTS Tutor"
            className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
