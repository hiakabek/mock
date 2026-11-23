import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  Clock,
  Shuffle,
  AlertCircle,
  Volume2,
  FileAudio,
} from 'lucide-react';
import {
  SPEAKING_PART1_TOPICS,
  SPEAKING_PART2_CARDS,
  SPEAKING_PART3_TOPICS,
} from '../data/writingSpeakingData';
import { formatTimer } from '../utils/ieltsScoring';
import type { SpeakingEvaluation } from '../types/ielts';
import { useApp } from '../context/AppContext';

export const SpeakingPracticePage: React.FC<{ evaluatorFocus?: boolean }> = ({ evaluatorFocus = false }) => {
  const { speakingSubmissions, saveSpeakingSubmission, showToast } = useApp();
  const [part, setPart] = useState<'part1' | 'part2' | 'part3'>(evaluatorFocus ? 'part2' : 'part1');
  const [part1Idx, setPart1Idx] = useState(0);
  const [part2Idx, setPart2Idx] = useState(0);
  const [part3Idx, setPart3Idx] = useState(0);

  // Part 2 Timers (1 min prep + 2 min speaking)
  const [phase, setPhase] = useState<'idle' | 'prep' | 'speak'>('idle');
  const [timerSec, setTimerSec] = useState(60);

  // Microphone recording + transcription
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechRecRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (phase === 'idle') return;
    const id = window.setInterval(() => {
      setTimerSec((prev) => {
        if (prev <= 1) {
          if (phase === 'prep') {
            setPhase('speak');
            return 120;
          }
          setPhase('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const currentTopicTitle =
    part === 'part1'
      ? SPEAKING_PART1_TOPICS[part1Idx].topic
      : part === 'part2'
      ? SPEAKING_PART2_CARDS[part2Idx].title
      : SPEAKING_PART3_TOPICS[part3Idx].topic;

  const startRecording = async () => {
    setErrorMsg(null);
    setEvaluation(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Microphone recording is not supported in this browser. You can still type or paste your spoken transcript below for AI evaluation.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setRecordSeconds(0);

      // Optional browser SpeechRecognition for real-time live captioning
      const SR =
        (window as unknown as { SpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; lang: string; onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; start: () => void; stop: () => void }; webkitSpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; lang: string; onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; start: () => void; stop: () => void } }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; lang: string; onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; start: () => void; stop: () => void } }).webkitSpeechRecognition;
      if (SR) {
        try {
          const rec = new SR();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.onresult = (event) => {
            let full = '';
            for (let i = 0; i < event.results.length; i++) {
              full += event.results[i][0].transcript + ' ';
            }
            setTranscript(full.trim());
          };
          rec.start();
          speechRecRef.current = rec;
        } catch {
          // Live browser captioning is optional; Gemini transcription handles recorded audio
        }
      }
    } catch {
      setErrorMsg('Microphone permission was denied. Allow microphone access or type your spoken answer below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // ignore
      }
      speechRecRef.current = null;
    }
    setRecording(false);
  };

  const transcribeWithGemini = async () => {
    if (!audioBlob) {
      showToast('Record an audio clip first before running Gemini transcription.');
      return;
    }
    setErrorMsg(null);
    setTranscribing(true);
    try {
      const reader = new FileReader();
      const base64: string = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const res = String(reader.result || '');
          resolve(res.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const resp = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: audioBlob.type || 'audio/webm',
        }),
      });
      const data = (await resp.json()) as { transcript?: string; error?: string };
      if (!resp.ok || !data.transcript) {
        setErrorMsg(data.error || 'Audio transcription failed.');
        return;
      }
      setTranscript(data.transcript);
      showToast('Audio transcribed accurately with Gemini.');
    } catch {
      setErrorMsg('Could not transcribe audio via server endpoint.');
    } finally {
      setTranscribing(false);
    }
  };

  const evaluateSpeaking = async () => {
    setErrorMsg(null);
    if (transcript.trim().length < 15) {
      setErrorMsg('Please record and transcribe (or enter at least 15 characters of) your spoken response.');
      return;
    }
    setEvaluating(true);
    try {
      const resp = await fetch('/api/ai/evaluate-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part,
          topic: currentTopicTitle,
          transcript,
          durationSeconds: Math.max(15, recordSeconds || 60),
        }),
      });
      const data = (await resp.json()) as SpeakingEvaluation & { error?: string };
      if (!resp.ok) {
        setErrorMsg(data.error || 'AI Speaking evaluation failed.');
        return;
      }
      setEvaluation(data);
      await saveSpeakingSubmission({
        part,
        topicTitle: currentTopicTitle,
        transcript,
        durationSeconds: Math.max(15, recordSeconds || 60),
        estimatedBand: data.overallBand,
        feedbackSummary: `${data.fluencyCoherence.feedback} ${data.lexicalResource.feedback}`.slice(0, 800),
      });
    } catch {
      setErrorMsg('Network error reaching AI Speaking Evaluator.');
    } finally {
      setEvaluating(false);
    }
  };

  const speakExaminerQuestion = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB';
      window.speechSynthesis.speak(u);
    }
  };

  const randomizeTopic = () => {
    if (part === 'part1') setPart1Idx((i) => (i + 1) % SPEAKING_PART1_TOPICS.length);
    if (part === 'part2') setPart2Idx((i) => (i + 1) % SPEAKING_PART2_CARDS.length);
    if (part === 'part3') setPart3Idx((i) => (i + 1) % SPEAKING_PART3_TOPICS.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B172A] dark:text-white">
            {evaluatorFocus ? 'AI IELTS Speaking Evaluator' : 'IELTS Speaking Practice Simulator'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Practice Part 1 short answers, Part 2 timed cue cards (1-min prep + 2-min talk), and Part 3 abstract discussions with AI feedback.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          {[
            { id: 'part1', label: 'Part 1: Intro' },
            { id: 'part2', label: 'Part 2: Cue Card' },
            { id: 'part3', label: 'Part 3: Discussion' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPart(p.id as typeof part);
                setPhase('idle');
                setEvaluation(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                part === p.id
                  ? 'bg-white dark:bg-[#0E1A2D] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Examiner Prompt & Part 2 Timers */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] uppercase">
              {part === 'part1' ? 'Part 1 · Familiar Topics' : part === 'part2' ? 'Part 2 · Long Turn Cue Card' : 'Part 3 · Analytical Discussion'}
            </span>
            <button
              type="button"
              onClick={randomizeTopic}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Next Topic
            </button>
          </div>

          {part === 'part1' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0B172A] dark:text-white">
                {SPEAKING_PART1_TOPICS[part1Idx].topic}
              </h3>
              <ul className="space-y-2.5">
                {SPEAKING_PART1_TOPICS[part1Idx].questions.map((q) => (
                  <li
                    key={q}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 flex items-start justify-between gap-2 text-sm text-slate-800 dark:text-slate-200"
                  >
                    <span>{q}</span>
                    <button
                      type="button"
                      onClick={() => speakExaminerQuestion(q)}
                      aria-label={`Listen to question: ${q}`}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[#2563EB] shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Natural Discourse Phrases</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {SPEAKING_PART1_TOPICS[part1Idx].usefulPhrases.join(' · ')}
                </p>
              </div>
            </div>
          )}

          {part === 'part2' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0B172A] dark:text-white">
                {SPEAKING_PART2_CARDS[part2Idx].title}
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {SPEAKING_PART2_CARDS[part2Idx].prompt}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                {SPEAKING_PART2_CARDS[part2Idx].bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {phase === 'prep'
                      ? '1-Minute Preparation Countdown'
                      : phase === 'speak'
                      ? '2-Minute Speaking Timer'
                      : 'Cue Card Timed Drill'}
                  </span>
                  <span className="font-mono text-lg font-bold text-[#2563EB] dark:text-[#60A5FA] tabular-nums">
                    {formatTimer(timerSec)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhase('prep');
                      setTimerSec(60);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B172A] dark:bg-slate-800 text-white text-xs font-semibold"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Start 1-Min Prep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhase('speak');
                      setTimerSec(120);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold"
                  >
                    Start 2-Min Talk
                  </button>
                </div>
              </div>
            </div>
          )}

          {part === 'part3' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0B172A] dark:text-white">
                {SPEAKING_PART3_TOPICS[part3Idx].topic}
              </h3>
              <ul className="space-y-2.5">
                {SPEAKING_PART3_TOPICS[part3Idx].questions.map((q) => (
                  <li
                    key={q}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 flex items-start justify-between gap-2 text-sm text-slate-800 dark:text-slate-200"
                  >
                    <span>{q}</span>
                    <button
                      type="button"
                      onClick={() => speakExaminerQuestion(q)}
                      aria-label={`Listen to question: ${q}`}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[#2563EB] shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-xs font-semibold text-slate-500">Band 9 Analytical Angles</p>
                {SPEAKING_PART3_TOPICS[part3Idx].band9Angles.map((a) => (
                  <p key={a} className="text-xs text-slate-600 dark:text-slate-400">
                    • {a}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Recorder, Transcript, AI Evaluation & History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {!recording ? (
                  <button
                    type="button"
                    onClick={() => void startRecording()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                    Start Microphone Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording ({formatTimer(recordSeconds)})
                  </button>
                )}

                {audioBlob && !recording && (
                  <button
                    type="button"
                    disabled={transcribing}
                    onClick={() => void transcribeWithGemini()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
                  >
                    <FileAudio className="w-4 h-4 text-[#2563EB]" />
                    {transcribing ? 'Transcribing...' : 'Gemini Transcribe Audio'}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setTranscript(
                    'Honestly, one practical skill I learned outside school is repairing bicycles. Two years ago my gear cable snapped ten kilometers from home, so I started attending a weekend community repair cafe. A retired mechanic taught me how to align brakes and tune derailleurs. Today it not only saves me money, but also gives me confidence to fix everyday tools instead of throwing them away.'
                  )
                }
                className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline"
              >
                Insert Sample Transcript
              </button>
            </div>

            {audioUrl && (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 mb-2">Recorded Audio Playback</p>
                <audio controls src={audioUrl} className="w-full h-9" />
              </div>
            )}

            <div>
              <label htmlFor="speaking-transcript" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Spoken Transcript (Auto-populated during recording or editable for practice)
              </label>
              <textarea
                id="speaking-transcript"
                rows={7}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your recorded speech transcript will appear here, or type your spoken response directly..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950/60 p-3.5 text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={evaluating}
                onClick={() => void evaluateSpeaking()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B172A] dark:bg-[#2563EB] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                <span>{evaluating ? 'Analyzing Speaking with Gemini...' : 'Evaluate Speaking with Gemini AI'}</span>
              </button>
            </div>
          </div>

          {evaluation && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-6 space-y-5">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">{evaluation.disclaimer}</p>
                <h3 className="mt-1 text-2xl font-bold text-[#0B172A] dark:text-white">
                  Estimated Speaking Band {evaluation.overallBand.toFixed(1)}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Fluency & Coherence', data: evaluation.fluencyCoherence },
                  { label: 'Lexical Resource', data: evaluation.lexicalResource },
                  { label: 'Grammatical Range', data: evaluation.grammaticalRange },
                  { label: 'Pronunciation Guidance', data: evaluation.pronunciation },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{c.label}</span>
                      <span className="font-mono font-bold text-[#2563EB] dark:text-[#60A5FA] tabular-nums">
                        {c.data.band.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {c.data.feedback}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                  Suggested Band 8–9 Improved Answer
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {evaluation.improvedAnswer}
                </p>
              </div>
            </div>
          )}

          {/* Speaking History */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A2D] p-5">
            <h3 className="text-sm font-bold text-[#0B172A] dark:text-white mb-3">
              Speaking Practice History ({speakingSubmissions.length})
            </h3>
            {speakingSubmissions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluate a Part 1, 2, or 3 response to build your speaking log.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {speakingSubmissions.slice(0, 6).map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {s.part.toUpperCase()} · {s.topicTitle}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {s.durationSeconds}s · {new Date(s.createdAtIso).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-[#2563EB] dark:text-[#60A5FA] tabular-nums">
                      Band {s.estimatedBand.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
