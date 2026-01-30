"use client";

// ── Speech Synthesis (TTS) ──

// Current audio element for stopping
let currentAudio: HTMLAudioElement | null = null;

// Simple in-memory cache for TTS audio blobs
const ttsCache = new Map<string, string>();

export async function speak(text: string, rate = 1): Promise<void> {
  // Stop any currently playing audio
  stopSpeaking();

  // Always try OpenAI TTS first (better quality), fall back to Web Speech API
  const cacheKey = `${text}__${rate}`;
  let audioUrl = ttsCache.get(cacheKey);

  if (!audioUrl) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speed: Math.max(0.25, rate) }),
      });

      if (res.ok) {
        const blob = await res.blob();
        audioUrl = URL.createObjectURL(blob);
        ttsCache.set(cacheKey, audioUrl);
        // Keep cache under 100 entries
        if (ttsCache.size > 100) {
          const first = ttsCache.keys().next().value;
          if (first) { URL.revokeObjectURL(ttsCache.get(first)!); ttsCache.delete(first); }
        }
      }
    } catch {
      // Fall through to Web Speech API
    }
  }

  if (audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.onended = () => { currentAudio = null; resolve(); };
      audio.onerror = (e) => { currentAudio = null; reject(e); };
      audio.play().catch(reject);
    });
  }

  // Fallback: Web Speech API
  return speakWithWebSpeech(text, rate);
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function speakWithWebSpeech(text: string, rate = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang === "en-US" && (v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Female"))
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    window.speechSynthesis.speak(utterance);
  });
}

// ── Speech Recognition (STT) ──

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export function startListening(): Promise<SpeechRecognitionResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Not in browser"));
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      reject(new Error("Speech recognition not supported. Please use Chrome."));
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const result = event.results[0][0];
      resolve({
        transcript: result.transcript,
        confidence: result.confidence,
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        reject(new Error("没有检测到语音，请再试一次"));
      } else if (event.error === "audio-capture") {
        reject(new Error("无法访问麦克风，请检查权限"));
      } else {
        reject(new Error(`语音识别错误: ${event.error}`));
      }
    };

    recognition.onend = () => {
      // Will auto-resolve or reject from above handlers
    };

    recognition.start();
  });
}

// ── Simple text comparison ──

export function compareTexts(target: string, spoken: string): {
  score: number;
  targetWords: { word: string; matched: boolean }[];
} {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\s]/g, "").trim().split(/\s+/);

  const targetWords = normalize(target);
  const spokenWords = normalize(spoken);

  let matched = 0;
  const result = targetWords.map((word) => {
    const isMatched = spokenWords.some(
      (sw) => sw === word || levenshtein(sw, word) <= 1
    );
    if (isMatched) matched++;
    return { word, matched: isMatched };
  });

  const score = targetWords.length > 0 ? Math.round((matched / targetWords.length) * 100) : 0;
  return { score, targetWords: result };
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
