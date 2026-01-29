"use client";

export interface ProgressData {
  // 发音练习
  pronunciationAttempts: number;
  pronunciationCorrect: number;
  pronunciationHistory: { date: string; score: number }[];

  // 场景对话
  scenariosCompleted: string[];
  scenarioAttempts: number;

  // 词汇
  vocabMastered: string[];
  vocabReview: string[];
  vocabAttempts: number;

  // 打卡
  streakDays: number;
  lastActiveDate: string;
  totalDays: number;
  activeDates: string[];
}

const STORAGE_KEY = "english-buddy-progress";

const defaultProgress: ProgressData = {
  pronunciationAttempts: 0,
  pronunciationCorrect: 0,
  pronunciationHistory: [],
  scenariosCompleted: [],
  scenarioAttempts: 0,
  vocabMastered: [],
  vocabReview: [],
  vocabAttempts: 0,
  streakDays: 0,
  lastActiveDate: "",
  totalDays: 0,
  activeDates: [],
};

export function getProgress(): ProgressData {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(data: Partial<ProgressData>) {
  if (typeof window === "undefined") return;
  const current = getProgress();
  const updated = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function recordActivity() {
  const today = new Date().toISOString().slice(0, 10);
  const progress = getProgress();

  if (progress.lastActiveDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const isConsecutive = progress.lastActiveDate === yesterday;

  saveProgress({
    lastActiveDate: today,
    streakDays: isConsecutive ? progress.streakDays + 1 : 1,
    totalDays: progress.totalDays + 1,
    activeDates: [...new Set([...progress.activeDates, today])],
  });
}

export function recordPronunciation(score: number) {
  const progress = getProgress();
  const today = new Date().toISOString().slice(0, 10);
  recordActivity();
  saveProgress({
    pronunciationAttempts: progress.pronunciationAttempts + 1,
    pronunciationCorrect: score >= 70 ? progress.pronunciationCorrect + 1 : progress.pronunciationCorrect,
    pronunciationHistory: [
      ...progress.pronunciationHistory.slice(-99),
      { date: today, score },
    ],
  });
}

export function recordScenario(scenarioId: string) {
  const progress = getProgress();
  recordActivity();
  saveProgress({
    scenarioAttempts: progress.scenarioAttempts + 1,
    scenariosCompleted: [...new Set([...progress.scenariosCompleted, scenarioId])],
  });
}

export function toggleVocabMastered(wordId: string) {
  const progress = getProgress();
  recordActivity();
  const mastered = new Set(progress.vocabMastered);
  const review = new Set(progress.vocabReview);

  if (mastered.has(wordId)) {
    mastered.delete(wordId);
    review.add(wordId);
  } else {
    mastered.add(wordId);
    review.delete(wordId);
  }

  saveProgress({
    vocabMastered: [...mastered],
    vocabReview: [...review],
    vocabAttempts: progress.vocabAttempts + 1,
  });
}
