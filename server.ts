import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ADMIN_EMAIL = 'ur.usmonov@gmail.com';

interface FirebaseAppletConfig {
  apiKey?: string;
  projectId?: string;
}

function loadFirebaseConfig(): FirebaseAppletConfig {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, 'firebase-applet-config.json'), 'utf8');
    return JSON.parse(raw) as FirebaseAppletConfig;
  } catch {
    return {};
  }
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
    return {
      status: 503,
      message: 'Gemini API key is missing or invalid. Configure GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return {
      status: 429,
      message: 'Gemini API quota reached. Please wait a moment and try again.',
    };
  }
  return { status: 500, message: `AI service error: ${msg}` };
}

async function verifyFirebaseIdToken(
  idToken: string
): Promise<{ valid: boolean; uid?: string; email?: string; emailVerified?: boolean }> {
  const config = loadFirebaseConfig();
  if (!config.apiKey || !idToken || idToken.length > 4096) {
    return { valid: false };
  }
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(config.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!response.ok) return { valid: false };
    const data = (await response.json()) as {
      users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user?.localId) return { valid: false };
    return {
      valid: true,
      uid: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
    };
  } catch {
    return { valid: false };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // Server-side Admin role verification using Firebase ID token
  app.get('/api/admin/verify', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ authorized: false, error: 'Missing Authorization Bearer token.' });
      return;
    }
    const token = authHeader.slice(7).trim();
    const verified = await verifyFirebaseIdToken(token);
    if (!verified.valid || !verified.emailVerified) {
      res.status(403).json({ authorized: false, error: 'Invalid or unverified user token.' });
      return;
    }
    const isAdmin = verified.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    res.status(isAdmin ? 200 : 403).json({
      authorized: isAdmin,
      uid: verified.uid,
      email: verified.email,
      role: isAdmin ? 'admin' : 'student',
    });
  });

  // AI Writing Evaluator (Official 4 IELTS Criteria)
  app.post('/api/ai/evaluate-writing', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { taskType, prompt, essay } = req.body ?? {};
    if (
      typeof essay !== 'string' ||
      essay.trim().length < 20 ||
      essay.length > 12000 ||
      typeof prompt !== 'string' ||
      prompt.length > 3000
    ) {
      res.status(400).json({ error: 'Please provide a valid essay (20–12,000 characters) and task prompt.' });
      return;
    }

    const safeTaskType =
      taskType === 'academic_task1' || taskType === 'gt_task1' || taskType === 'task2'
        ? taskType
        : 'task2';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Evaluate this IELTS ${safeTaskType} response strictly using the four official IELTS Writing assessment criteria.\n\nTASK PROMPT:\n${prompt}\n\nCANDIDATE RESPONSE:\n${essay}`,
        config: {
          systemInstruction:
            'You are a certified senior IELTS Writing examiner. Give rigorous, fair, constructive feedback with unofficial estimated bands in 0.5 increments (from 4.0 to 9.0). Never claim the score is an official IELTS result.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallBand: { type: Type.NUMBER },
              taskAchievement: {
                type: Type.OBJECT,
                properties: {
                  band: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                },
                required: ['band', 'feedback'],
              },
              coherenceCohesion: {
                type: Type.OBJECT,
                properties: {
                  band: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                },
                required: ['band', 'feedback'],
              },
              lexicalResource: {
                type: Type.OBJECT,
                properties: {
                  band: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                },
                required: ['band', 'feedback'],
              },
              grammaticalRange: {
                type: Type.OBJECT,
                properties: {
                  band: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                },
                required: ['band', 'feedback'],
              },
              grammarMistakes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    correction: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['original', 'correction', 'explanation'],
                },
              },
              vocabularyImprovements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    basic: { type: Type.STRING },
                    upgraded: { type: Type.STRING },
                    context: { type: Type.STRING },
                  },
                  required: ['basic', 'upgraded', 'context'],
                },
              },
              sentenceRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvedExamples: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              personalizedSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              detailedSummary: { type: Type.STRING },
            },
            required: [
              'overallBand',
              'taskAchievement',
              'coherenceCohesion',
              'lexicalResource',
              'grammaticalRange',
              'grammarMistakes',
              'vocabularyImprovements',
              'sentenceRecommendations',
              'improvedExamples',
              'personalizedSuggestions',
              'detailedSummary',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        ...parsed,
        disclaimer: 'Unofficial AI practice estimate generated for study purposes only.',
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Audio Transcription for Speaking Simulator (gemini-3.5-transcribe)
  app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini AI is not configured on the server.' });
      return;
    }

    const { audioBase64, mimeType } = req.body ?? {};
    const allowedMimes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/mp4'];
    const cleanMime = typeof mimeType === 'string' ? mimeType.split(';')[0].trim() : 'audio/webm';

    if (typeof audioBase64 !== 'string' || audioBase64.length < 16 || !allowedMimes.includes(cleanMime)) {
      res.status(400).json({ error: 'Invalid audio payload or unsupported audio MIME type.' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            { inlineData: { mimeType: cleanMime, data: audioBase64 } },
            { text: 'Transcribe this IELTS Speaking response accurately in English. Output only the clean transcript.' },
          ],
        },
      });
      res.json({ transcript: (response.text ?? '').trim() });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // AI Speaking Evaluator
  app.post('/api/ai/evaluate-speaking', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { part, topic, transcript, durationSeconds } = req.body ?? {};
    if (typeof transcript !== 'string' || transcript.trim().length < 10 || transcript.length > 8000) {
      res.status(400).json({ error: 'Please record or enter a speaking transcript (at least 10 characters).' });
      return;
    }

    const safePart = part === 'part1' || part === 'part2' || part === 'part3' ? part : 'part2';
    const safeTopic = typeof topic === 'string' ? topic.slice(0, 400) : 'IELTS Speaking Practice';
    const safeDuration = typeof durationSeconds === 'number' && durationSeconds > 0 ? durationSeconds : 60;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Evaluate this IELTS Speaking ${safePart} response.\nTopic: ${safeTopic}\nDuration: ${safeDuration} seconds\nTranscript:\n${transcript}`,
        config: {
          systemInstruction:
            'You are a senior IELTS Speaking examiner. Assess Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation guidance (note that pronunciation assessment from transcript focuses on stress, connected speech, and likely phrasing pitfalls). Return unofficial estimated bands in 0.5 increments.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallBand: { type: Type.NUMBER },
              fluencyCoherence: {
                type: Type.OBJECT,
                properties: { band: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ['band', 'feedback'],
              },
              lexicalResource: {
                type: Type.OBJECT,
                properties: { band: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ['band', 'feedback'],
              },
              grammaticalRange: {
                type: Type.OBJECT,
                properties: { band: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ['band', 'feedback'],
              },
              pronunciation: {
                type: Type.OBJECT,
                properties: { band: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
                required: ['band', 'feedback'],
              },
              vocabularyUpgrades: { type: Type.ARRAY, items: { type: Type.STRING } },
              grammarFixes: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvedAnswer: { type: Type.STRING },
              actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'overallBand',
              'fluencyCoherence',
              'lexicalResource',
              'grammaticalRange',
              'pronunciation',
              'vocabularyUpgrades',
              'grammarFixes',
              'improvedAnswer',
              'actionableTips',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        ...parsed,
        disclaimer: 'Unofficial AI practice estimate generated for study purposes only.',
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // AI IELTS Tutor (English / Uzbek, adaptive CEFR A1-C2)
  app.post('/api/ai/tutor', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { message, history, level, language } = req.body ?? {};
    if (typeof message !== 'string' || message.trim().length < 1 || message.length > 4000) {
      res.status(400).json({ error: 'Please enter a message for the IELTS Tutor.' });
      return;
    }

    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const safeLevel = validLevels.includes(level) ? level : 'B2';
    const safeLang = language === 'uz' ? 'Uzbek (with clear English IELTS examples)' : 'English';

    const safeHistory = Array.isArray(history)
      ? history
          .slice(-8)
          .filter(
            (m): m is { role: 'user' | 'assistant'; content: string } =>
              m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
          )
          .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content.slice(0, 1000)}`)
          .join('\n')
      : '';

    const fullPrompt = safeHistory
      ? `Previous conversation:\n${safeHistory}\n\nStudent's new message:\n${message}`
      : message;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: fullPrompt,
        config: {
          systemInstruction: `You are IELTS MASTER's personal English & IELTS Tutor.
- Student CEFR Level: ${safeLevel}. Adapt vocabulary complexity, sentence structure, and scaffolding directly to ${safeLevel}.
- Explanation Language: ${safeLang}.
- Help with IELTS Listening, Reading, Writing, Speaking, Grammar, Vocabulary, and custom mini-exercises.
- Keep responses clear, well-structured, encouraging, and concise (under 300 words unless asked for a full essay critique).
- Always note that any band score estimates are unofficial practice guidance.`,
        },
      });
      res.json({ reply: (response.text ?? '').trim() });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Optional Gemini Text-to-Speech for IELTS Listening / Vocabulary Pronunciation
  app.post('/api/ai/tts', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini TTS is not configured.' });
      return;
    }
    const { text, voice } = req.body ?? {};
    if (typeof text !== 'string' || text.trim().length < 1 || text.length > 2500) {
      res.status(400).json({ error: 'Invalid TTS text.' });
      return;
    }
    const allowedVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
    const voiceName = allowedVoices.includes(voice) ? voice : 'Kore';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      });
      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioBase64) {
        res.status(502).json({ error: 'No audio returned from TTS model.' });
        return;
      }
      res.json({ audioBase64, mimeType: 'audio/wav' });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IELTS MASTER server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start IELTS MASTER server:', err);
  process.exit(1);
});
