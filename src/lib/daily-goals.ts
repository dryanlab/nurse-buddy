// Daily Learning Goals System
// Auto-resets when date changes, tracks progress across activities

const STORAGE_KEY = "english-buddy-daily-goals";
const BONUS_CLAIMED_KEY = "english-buddy-daily-bonus-claimed";

export interface DailyGoals {
  date: string;              // YYYY-MM-DD
  loginDone: boolean;        // daily login
  vocabReviewed: number;     // target: 20 words
  pronunciationDone: number; // target: 10 items
  conversationDone: number;  // target: 1 conversation
  srsReviewDone: boolean;    // complete daily SRS review
  dailyChallengeDone: boolean; // complete daily challenge
}

export interface DailyGoalConfig {
  vocabTarget: number;
  pronunciationTarget: number;
  conversationTarget: number;
  srsReview: boolean;
  dailyChallenge: boolean;
}

export const DEFAULT_CONFIG: DailyGoalConfig = {
  vocabTarget: 20,
  pronunciationTarget: 10,
  conversationTarget: 1,
  srsReview: true,
  dailyChallenge: true,
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultGoals(): DailyGoals {
  return {
    date: getToday(),
    loginDone: false,
    vocabReviewed: 0,
    pronunciationDone: 0,
    conversationDone: 0,
    srsReviewDone: false,
    dailyChallengeDone: false,
  };
}

export function getDailyGoals(): DailyGoals {
  if (typeof window === "undefined") return defaultGoals();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGoals();
    const data = JSON.parse(raw) as DailyGoals;
    // Auto-reset if date changed
    if (data.date !== getToday()) {
      const fresh = defaultGoals();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      // Reset bonus claimed flag
      localStorage.removeItem(BONUS_CLAIMED_KEY);
      return fresh;
    }
    return data;
  } catch {
    return defaultGoals();
  }
}

export function updateDailyGoal(field: keyof DailyGoals, value: number | boolean): void {
  if (typeof window === "undefined") return;
  const goals = getDailyGoals();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (goals as any)[field] = value;
  goals.date = getToday();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function incrementDailyGoal(field: "vocabReviewed" | "pronunciationDone" | "conversationDone", amount: number = 1): void {
  if (typeof window === "undefined") return;
  const goals = getDailyGoals();
  goals[field] = (goals[field] || 0) + amount;
  goals.date = getToday();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function markDailyLogin(): void {
  updateDailyGoal("loginDone", true);
}

export function getDailyProgress(): { completed: number; total: number; percentage: number } {
  const goals = getDailyGoals();
  const config = DEFAULT_CONFIG;
  
  let completed = 0;
  const total = 5; // login, vocab, pronunciation, conversation/srs, daily challenge
  
  if (goals.loginDone) completed++;
  if (goals.vocabReviewed >= config.vocabTarget) completed++;
  if (goals.pronunciationDone >= config.pronunciationTarget) completed++;
  if (goals.conversationDone >= config.conversationTarget || goals.srsReviewDone) completed++;
  if (goals.dailyChallengeDone) completed++;
  
  return { completed, total, percentage: Math.round((completed / total) * 100) };
}

export function isAllGoalsComplete(): boolean {
  const { completed, total } = getDailyProgress();
  return completed >= total;
}

export function hasDailyBonusClaimed(): boolean {
  if (typeof window === "undefined") return false;
  const claimed = localStorage.getItem(BONUS_CLAIMED_KEY);
  return claimed === getToday();
}

export function claimDailyBonus(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BONUS_CLAIMED_KEY, getToday());
}
