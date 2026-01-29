"use client";

// Progress & gamification — Supabase with localStorage fallback

import { getSupabase } from "./supabase";
import { earnCoins, COIN_RATES } from "./coin-store";
import { checkAchievements } from "./achievements";

export interface ProgressData {
  // XP & Level
  xp: number;
  level: number;

  // Streaks
  streakDays: number;
  lastActiveDate: string;
  totalDays: number;
  activeDates: string[];

  // Pronunciation
  pronunciationAttempts: number;
  pronunciationCorrect: number;
  pronunciationHistory: { date: string; score: number }[];

  // Scenarios / Conversations
  scenariosCompleted: string[];
  scenarioAttempts: number;
  bestConversationScore: number;

  // Vocab
  vocabMastered: string[];
  vocabReview: string[];
  vocabAttempts: number;

  // Chat
  chatCount: number;

  // Daily login reward claimed today?
  lastLoginRewardDate: string;
}

const STORAGE_KEY = "english-buddy-progress";

const defaultProgress: ProgressData = {
  xp: 0,
  level: 1,
  streakDays: 0,
  lastActiveDate: "",
  totalDays: 0,
  activeDates: [],
  pronunciationAttempts: 0,
  pronunciationCorrect: 0,
  pronunciationHistory: [],
  scenariosCompleted: [],
  scenarioAttempts: 0,
  bestConversationScore: 0,
  vocabMastered: [],
  vocabReview: [],
  vocabAttempts: 0,
  chatCount: 0,
  lastLoginRewardDate: "",
};

// ─── Level system ────────────────────────────────────────────

export const LEVELS = [
  { level: 1, name: "🌱 Beginner", nameCn: "初学者", xp: 0 },
  { level: 2, name: "📖 Learner", nameCn: "学习者", xp: 50 },
  { level: 3, name: "🔤 Speller", nameCn: "拼写者", xp: 120 },
  { level: 4, name: "🗣️ Speaker", nameCn: "开口者", xp: 250 },
  { level: 5, name: "💬 Conversant", nameCn: "会话者", xp: 400 },
  { level: 6, name: "📚 Bookworm", nameCn: "书虫", xp: 600 },
  { level: 7, name: "🎯 Focused", nameCn: "专注者", xp: 850 },
  { level: 8, name: "🌟 Rising Star", nameCn: "新星", xp: 1200 },
  { level: 9, name: "🎤 Presenter", nameCn: "演讲者", xp: 1600 },
  { level: 10, name: "🩺 Medical Pro", nameCn: "医疗英语达人", xp: 2100 },
  { level: 11, name: "⚡ Expert", nameCn: "专家", xp: 2700 },
  { level: 12, name: "🏆 Champion", nameCn: "冠军", xp: 3500 },
  { level: 13, name: "💎 Diamond", nameCn: "钻石", xp: 4500 },
  { level: 14, name: "👑 Master", nameCn: "大师", xp: 6000 },
  { level: 15, name: "🌌 Legend", nameCn: "传奇", xp: 8000 },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xp) current = l;
    else break;
  }
  const next = LEVELS.find((l) => l.level === current.level + 1) || null;
  const progressToNext = next ? (xp - current.xp) / (next.xp - current.xp) : 1;
  return { ...current, nextXp: next?.xp || current.xp, progressToNext };
}

// ─── XP rates ────────────────────────────────────────────────

export const XP_RATES = {
  vocabSession: 10,
  pronunciationPractice: 15,
  conversationComplete: 30,
  dailyLogin: 5,
  streakBonusPerDay: 2,
  perfectQuiz: 20,
};

// ─── localStorage helpers ────────────────────────────────────

export function getProgress(): ProgressData {
  if (typeof window === "undefined") return { ...defaultProgress };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(data: Partial<ProgressData>) {
  if (typeof window === "undefined") return;
  const current = getProgress();
  const updated = { ...current, ...data };
  // Recompute level
  const levelInfo = getLevelInfo(updated.xp);
  updated.level = levelInfo.level;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// ─── Supabase sync (fire-and-forget) ────────────────────────

async function getUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

async function syncToCloud(p: ProgressData): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("user_stats").upsert({
    user_id: userId,
    total_xp: p.xp,
    level: p.level,
    streak_days: p.streakDays,
    last_active_date: p.lastActiveDate || null,
    vocab_mastered: p.vocabMastered.length,
    pronunciation_attempts: p.pronunciationAttempts,
    scenarios_completed: p.scenariosCompleted.length,
  });
}

// ─── Activity recording with XP + coins + achievements ──────

function runAchievementCheck(p: ProgressData) {
  checkAchievements({
    vocabLearned: p.vocabMastered.length,
    pronunciationAttempts: p.pronunciationAttempts,
    conversationsDone: p.scenarioAttempts,
    streakDays: p.streakDays,
    xp: p.xp,
    chatCount: p.chatCount,
    bestConversationScore: p.bestConversationScore,
    scenariosCompleted: p.scenariosCompleted.length,
  });
}

export function recordActivity() {
  const today = new Date().toISOString().slice(0, 10);
  const progress = getProgress();

  if (progress.lastActiveDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const isConsecutive = progress.lastActiveDate === yesterday;
  const newStreak = isConsecutive ? progress.streakDays + 1 : 1;

  // Daily login XP + coins
  let bonusXp = XP_RATES.dailyLogin + XP_RATES.streakBonusPerDay * newStreak;
  earnCoins(COIN_RATES.dailyLogin, "daily-login");

  // Streak coin bonuses
  if (newStreak === 3) earnCoins(COIN_RATES.streakBonus3, "streak-3");
  if (newStreak === 7) earnCoins(COIN_RATES.streakBonus7, "streak-7");
  if (newStreak === 30) earnCoins(COIN_RATES.streakBonus30, "streak-30");

  const updated: Partial<ProgressData> = {
    lastActiveDate: today,
    streakDays: newStreak,
    totalDays: progress.totalDays + 1,
    activeDates: [...new Set([...progress.activeDates, today])],
    xp: progress.xp + bonusXp,
    lastLoginRewardDate: today,
  };

  saveProgress(updated);
  const p = getProgress();
  runAchievementCheck(p);
  syncToCloud(p);
}

export function recordPronunciation(score: number) {
  const progress = getProgress();
  const today = new Date().toISOString().slice(0, 10);
  recordActivity();

  const xpGain = XP_RATES.pronunciationPractice;
  earnCoins(COIN_RATES.pronunciationPractice, "pronunciation");

  saveProgress({
    pronunciationAttempts: progress.pronunciationAttempts + 1,
    pronunciationCorrect: score >= 70 ? progress.pronunciationCorrect + 1 : progress.pronunciationCorrect,
    pronunciationHistory: [
      ...progress.pronunciationHistory.slice(-99),
      { date: today, score },
    ],
    xp: progress.xp + xpGain,
  });

  const p = getProgress();
  runAchievementCheck(p);
  syncToCloud(p);
}

export function recordScenario(scenarioId: string, score?: number) {
  const progress = getProgress();
  recordActivity();

  const xpGain = XP_RATES.conversationComplete + (score && score >= 100 ? XP_RATES.perfectQuiz : 0);
  earnCoins(COIN_RATES.conversationComplete, "conversation");
  if (score && score >= 100) earnCoins(COIN_RATES.quizPerfect, "perfect-conversation");
  else if (score && score >= 80) earnCoins(COIN_RATES.quizGood, "good-conversation");

  saveProgress({
    scenarioAttempts: progress.scenarioAttempts + 1,
    scenariosCompleted: [...new Set([...progress.scenariosCompleted, scenarioId])],
    bestConversationScore: Math.max(progress.bestConversationScore, score || 0),
    xp: progress.xp + xpGain,
  });

  const p = getProgress();
  runAchievementCheck(p);
  syncToCloud(p);
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
    // XP + coins for new vocab
    earnCoins(COIN_RATES.vocabSession, "vocab");
    saveProgress({
      vocabMastered: [...mastered],
      vocabReview: [...review],
      vocabAttempts: progress.vocabAttempts + 1,
      xp: progress.xp + XP_RATES.vocabSession,
    });
    const p = getProgress();
    runAchievementCheck(p);
    syncToCloud(p);
    return;
  }

  saveProgress({
    vocabMastered: [...mastered],
    vocabReview: [...review],
    vocabAttempts: progress.vocabAttempts + 1,
  });
}

export function incrementChatCount() {
  const progress = getProgress();
  const newCount = progress.chatCount + 1;
  if (newCount % 10 === 0) {
    earnCoins(COIN_RATES.chatMessage10, "chat-milestone");
  }
  saveProgress({ chatCount: newCount });
  const p = getProgress();
  runAchievementCheck(p);
}

export function shouldShowDailyReward(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const progress = getProgress();
  return progress.lastLoginRewardDate !== today;
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
