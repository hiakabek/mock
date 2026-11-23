import React, { useMemo, useState } from 'react';
import {
  Search,
  Volume2,
  Star,
  CheckCircle2,
  RotateCw,
  BookOpen,
  Layers,
  HelpCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  VOCAB_CATEGORIES,
  VOCABULARY_BANK,
  type VocabCategory,
  type VocabWord,
} from '../data/learningData';
import { useApp } from '../context/AppContext';

type VocabMode = 'list' | 'flashcards' | 'quiz';

export const VocabularyBuilderPage: React.FC = () => {
  const { profile, toggleMasteredWord, toggleFavoriteWord, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<VocabCategory | 'All' | 'Favorites'>('All');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<VocabMode>('list');
  const [showUzbek, setShowUzbek] = useState(true);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const filteredWords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return VOCABULARY_BANK.filter((w) => {
      if (selectedCategory === 'Favorites' && !profile.favoriteWordIds.includes(w.id)) return false;
      if (
        selectedCategory !== 'All' &&
        selectedCategory !== 'Favorites' &&
        w.category !== selectedCategory
      ) {
        return false;
      }
      if (!q) return true;
      return (
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.uzbek.toLowerCase().includes(q) ||
        w.synonyms.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, search, profile.favoriteWordIds]);

  const activeDeck: VocabWord[] = useMemo(() => {
    if (filteredWords.length === 0) return VOCABULARY_BANK;
    if (reviewQueue.length === 0) return filteredWords;
    const priority = reviewQueue
      .map((id) => VOCABULARY_BANK.find((w) => w.id === id))
      .filter((w): w is VocabWord => Boolean(w));
    const rest = filteredWords.filter((w) => !reviewQueue.includes(w.id));
    return [...priority, ...rest];
  }, [filteredWords, reviewQueue]);

  const currentCard = activeDeck[cardIndex % Math.max(1, activeDeck.length)] || VOCABULARY_BANK[0];

  const quizQuestions = useMemo(() => {
    const base = filteredWords.length >= 4 ? filteredWords.slice(0, 8) : VOCABULARY_BANK.slice(0, 8);
    return base.map((target, idx) => {
      const distractors = VOCABULARY_BANK.filter((w) => w.id !== target.id)
        .slice((idx * 3) % (VOCABULARY_BANK.length - 4), (idx * 3) % (VOCABULARY_BANK.length - 4) + 3)
        .map((w) => w.definition);
      const options = [...distractors, target.definition].sort((a, b) => a.localeCompare(b));
      return { word: target, options };
    });
  }, [filteredWords]);

  const dailyGoalPct = Math.min(
    100,
    Math.round((profile.masteredWordIds.length / Math.max(1, profile.dailyWordGoal)) * 100)
  );

  const speakWord = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Audio pronunciation is unavailable in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-GB';
    utter.rate = 0.94;
    window.speechSynthesis.speak(utter);
  };

  const handleFlashcardAction = async (known: boolean) => {
    if (!currentCard) return;
    if (known) {
      if (!profile.masteredWordIds.includes(currentCard.id)) {
        await toggleMasteredWord(currentCard.id);
      }
      setReviewQueue((prev) => prev.filter((id) => id !== currentCard.id));
      showToast(`"${currentCard.word}" marked as mastered (+15 XP).`);
    } else {
      setReviewQueue((prev) => (prev.includes(currentCard.id) ? prev : [...prev, currentCard.id]));
      showToast(`"${currentCard.word}" scheduled for spaced repetition review.`);
    }
    setFlipped(false);
    setCardIndex((prev) => (prev + 1) % activeDeck.length);
  };

  const handleQuizAnswer = (option: string) => {
    if (selectedOption !== null) return;
    const q = quizQuestions[quizIdx];
    setSelectedOption(option);
    if (option === q.word.definition) {
      setQuizScore((s) => s + 1);
      if (!profile.masteredWordIds.includes(q.word.id)) {
        void toggleMasteredWord(q.word.id);
      }
    }
  };

  const handleNextQuiz = () => {
    if (quizIdx + 1 >= quizQuestions.length) {
      setQuizDone(true);
    } else {
      setQuizIdx((i) => i + 1);
      setSelectedOption(null);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setQuizScore(0);
    setSelectedOption(null);
    setQuizDone(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Lexical Resource Studio
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            IELTS Vocabulary Builder
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            12 high-frequency IELTS topic banks with English definitions, Uzbek translations, flashcards, and spaced-repetition quizzes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'list', label: 'Word Bank', icon: BookOpen },
              { id: 'flashcards', label: 'Flashcards', icon: Layers },
              { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                setFlipped(false);
                if (id === 'quiz') resetQuiz();
              }}
              className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                mode === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Search Header */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Daily Vocabulary Goal</span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
              {profile.masteredWordIds.length} / {profile.dailyWordGoal} mastered
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${dailyGoalPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {profile.favoriteWordIds.length} saved favorites · {reviewQueue.length} queued for spaced review
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center lg:col-span-7">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCardIndex(0);
              }}
              placeholder="Search English word, Uzbek meaning, or synonym..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showUzbek}
              onChange={(e) => setShowUzbek(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Show Uzbek (UZ)
          </label>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['All', 'Favorites', ...VOCAB_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              setCardIndex(0);
              resetQuiz();
            }}
            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedCategory === cat
                ? 'bg-[#0B172A] text-white dark:bg-blue-600'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mode 1: Word List */}
      {mode === 'list' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWords.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No vocabulary items match your current filter. Try clearing the search or choosing another category.
              </p>
            </div>
          ) : (
            filteredWords.map((item) => {
              const mastered = profile.masteredWordIds.includes(item.id);
              const fav = profile.favoriteWordIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                            {item.word}
                          </h2>
                          <button
                            type="button"
                            onClick={() => speakWord(item.word)}
                            aria-label={`Pronounce ${item.word}`}
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.phonetic} · {item.cefr} · {item.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void toggleFavoriteWord(item.id)}
                          aria-label={fav ? 'Remove favorite' : 'Save favorite'}
                          className={`rounded-md p-1.5 transition ${
                            fav
                              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Star className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleMasteredWord(item.id)}
                          aria-label={mastered ? 'Unmark mastered' : 'Mark mastered'}
                          className={`rounded-md p-1.5 transition ${
                            mastered
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {showUzbek && (
                      <p className="mt-2.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                        UZ: {item.uzbek}
                      </p>
                    )}

                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {item.definition}
                    </p>
                    <p className="mt-2.5 rounded-lg bg-slate-50 p-2.5 text-xs italic leading-relaxed text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                      "{item.example}"
                    </p>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <p>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Synonyms:</span>{' '}
                      {item.synonyms.join(', ')}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Antonyms:</span>{' '}
                      {item.antonyms.join(', ')}
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Mode 2: Spaced Repetition Flashcards */}
      {mode === 'flashcards' && currentCard && (
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span>
              Card {(cardIndex % activeDeck.length) + 1} of {activeDeck.length}
            </span>
            <span>
              {currentCard.category} · CEFR {currentCard.cefr}
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            className="flex min-h-[290px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900"
          >
            {!flipped ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Tap card to reveal definition & Uzbek meaning
                </p>
                <h2 className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                  {currentCard.word}
                </h2>
                <p className="mt-2 font-mono text-sm text-slate-500 dark:text-slate-400">
                  {currentCard.phonetic}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentCard.word);
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Listen Pronunciation
                </button>
              </>
            ) : (
              <div className="w-full space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    {currentCard.word}
                  </h3>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {currentCard.phonetic}
                  </span>
                </div>
                {showUzbek && (
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Uzbek: {currentCard.uzbek}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {currentCard.definition}
                </p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm italic text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  "{currentCard.example}"
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Synonyms: {currentCard.synonyms.join(', ')} · Antonyms: {currentCard.antonyms.join(', ')}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCw className="h-4 w-4" />
              Flip Card
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleFlashcardAction(false)}
                className="whitespace-nowrap shrink-0 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              >
                Review Again
              </button>
              <button
                type="button"
                onClick={() => void handleFlashcardAction(true)}
                className="whitespace-nowrap shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                I Know This Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Interactive Quiz */}
      {mode === 'quiz' && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {quizDone ? (
            <div className="space-y-4 py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Quiz Completed
              </p>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {quizScore} / {quizQuestions.length} Correct
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Correctly answered words have been automatically added to your mastered vocabulary list.
              </p>
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Retake Quiz
              </button>
            </div>
          ) : (
            (() => {
              const q = quizQuestions[quizIdx];
              if (!q) return null;
              return (
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>
                      Question {quizIdx + 1} of {quizQuestions.length}
                    </span>
                    <span>Score: {quizScore}</span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Select the accurate academic definition
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                        {q.word.word}
                      </h2>
                      <span className="font-mono text-xs text-slate-500">{q.word.phonetic}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {q.options.map((opt) => {
                      const isPicked = selectedOption === opt;
                      const isCorrect = opt === q.word.definition;
                      let stateClass =
                        'border-slate-200 bg-white text-slate-800 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200';
                      if (selectedOption !== null) {
                        if (isCorrect) {
                          stateClass =
                            'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200';
                        } else if (isPicked) {
                          stateClass =
                            'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-950/50 dark:text-rose-200';
                        }
                      }
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={selectedOption !== null}
                          onClick={() => handleQuizAnswer(opt)}
                          className={`w-full rounded-xl border p-3.5 text-left text-sm leading-relaxed transition ${stateClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Uzbek:</span> {q.word.uzbek} ·{' '}
                        <span className="italic">"{q.word.example}"</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleNextQuiz}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        {quizIdx + 1 >= quizQuestions.length ? 'See Results' : 'Next Word'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
