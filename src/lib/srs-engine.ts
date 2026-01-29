// Spaced Repetition System (SRS) — SM-2 / Leitner-style algorithm

const SRS_KEY = "english-buddy-srs";

export interface SRSCard {
  itemId: string;
  itemType: "vocab" | "phrase" | "pronunciation";
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview: string | null;
  status: "new" | "learning" | "review" | "mastered";
}

export type ReviewQuality = 0 | 1 | 2 | 3;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createCard(itemId: string, itemType: SRSCard["itemType"]): SRSCard {
  return {
    itemId,
    itemType,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: todayStr(),
    lastReview: null,
    status: "new",
  };
}

export function processReview(card: SRSCard, quality: ReviewQuality): SRSCard {
  const now = todayStr();
  const c = { ...card, lastReview: now };

  if (quality <= 1) {
    // Forgot or hard → reset
    c.interval = 1;
    c.repetitions = 0;
    c.easeFactor = Math.max(1.3, c.easeFactor - 0.3);
    c.status = "learning";
  } else {
    c.repetitions += 1;
    // Adjust ease factor
    if (quality === 2) {
      c.easeFactor = Math.max(1.3, c.easeFactor - 0.1);
    } else {
      c.easeFactor = Math.min(3.0, c.easeFactor + 0.15);
    }

    // Calculate next interval
    if (c.interval === 0) {
      c.interval = 1;
    } else if (c.interval === 1) {
      c.interval = 3;
    } else {
      const mult = quality === 3 ? c.easeFactor : c.easeFactor * 0.8;
      c.interval = Math.round(c.interval * mult);
    }

    // Cap interval
    c.interval = Math.min(c.interval, 365);

    // Status transitions
    if (c.repetitions >= 5 && c.interval > 30) {
      c.status = "mastered";
    } else if (c.interval >= 7) {
      c.status = "review";
    } else {
      c.status = "learning";
    }
  }

  // Set next review date
  const next = new Date();
  next.setDate(next.getDate() + c.interval);
  c.nextReview = next.toISOString().slice(0, 10);

  return c;
}

export function getDueCards(cards: SRSCard[], limit?: number): SRSCard[] {
  const today = todayStr();
  const due = cards
    .filter((c) => c.nextReview <= today)
    .sort((a, b) => {
      // Overdue first (smallest nextReview), then new cards last
      if (a.status === "new" && b.status !== "new") return 1;
      if (a.status !== "new" && b.status === "new") return -1;
      return a.nextReview.localeCompare(b.nextReview);
    });
  return limit ? due.slice(0, limit) : due;
}

export function getNewCards(
  allItemIds: string[],
  existingCards: SRSCard[],
  limit?: number
): string[] {
  const existing = new Set(existingCards.map((c) => c.itemId));
  const newIds = allItemIds.filter((id) => !existing.has(id));
  return limit ? newIds.slice(0, limit) : newIds;
}

export function getStats(cards: SRSCard[]) {
  const today = todayStr();
  return {
    total: cards.length,
    new: cards.filter((c) => c.status === "new").length,
    learning: cards.filter((c) => c.status === "learning").length,
    review: cards.filter((c) => c.status === "review").length,
    mastered: cards.filter((c) => c.status === "mastered").length,
    dueToday: cards.filter((c) => c.nextReview <= today).length,
  };
}

// ─── localStorage persistence ────────────────────────────────

export function loadCards(): SRSCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SRS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCards(cards: SRSCard[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SRS_KEY, JSON.stringify(cards));
}

export function addCard(itemId: string, itemType: SRSCard["itemType"]): SRSCard[] {
  const cards = loadCards();
  if (cards.some((c) => c.itemId === itemId)) return cards;
  const card = createCard(itemId, itemType);
  const updated = [...cards, card];
  saveCards(updated);
  return updated;
}

export function removeCard(itemId: string): SRSCard[] {
  const cards = loadCards().filter((c) => c.itemId !== itemId);
  saveCards(cards);
  return cards;
}

export function hasCard(itemId: string): boolean {
  return loadCards().some((c) => c.itemId === itemId);
}

export function reviewCard(itemId: string, quality: ReviewQuality): SRSCard[] {
  const cards = loadCards();
  const idx = cards.findIndex((c) => c.itemId === itemId);
  if (idx === -1) return cards;
  cards[idx] = processReview(cards[idx], quality);
  saveCards(cards);
  return cards;
}

// ─── Review session tracking ─────────────────────────────────

const SESSION_KEY = "english-buddy-srs-session";

export interface ReviewSession {
  date: string;
  reviewed: number;
  correct: number; // quality >= 2
  streak: number;
}

export function getReviewSession(): ReviewSession {
  if (typeof window === "undefined") return { date: "", reviewed: 0, correct: 0, streak: 0 };
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { date: "", reviewed: 0, correct: 0, streak: 0 };
    const s = JSON.parse(raw);
    if (s.date !== todayStr()) return { date: todayStr(), reviewed: 0, correct: 0, streak: s.streak || 0 };
    return s;
  } catch {
    return { date: "", reviewed: 0, correct: 0, streak: 0 };
  }
}

export function updateReviewSession(quality: ReviewQuality): ReviewSession {
  const today = todayStr();
  const session = getReviewSession();
  
  if (session.date !== today) {
    // New day — check if yesterday had a session for streak
    session.date = today;
    session.reviewed = 0;
    session.correct = 0;
  }
  
  session.reviewed += 1;
  if (quality >= 2) session.correct += 1;
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function completeReviewSession(): ReviewSession {
  const session = getReviewSession();
  const today = todayStr();
  
  // Update streak
  const streakKey = "english-buddy-srs-streak";
  try {
    const raw = localStorage.getItem(streakKey);
    const streakData = raw ? JSON.parse(raw) : { lastDate: "", streak: 0 };
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    
    if (streakData.lastDate === today) {
      // Already counted today
      session.streak = streakData.streak;
    } else if (streakData.lastDate === yesterday) {
      streakData.streak += 1;
      streakData.lastDate = today;
      session.streak = streakData.streak;
    } else {
      streakData.streak = 1;
      streakData.lastDate = today;
      session.streak = 1;
    }
    localStorage.setItem(streakKey, JSON.stringify(streakData));
  } catch {
    session.streak = 1;
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function hasCompletedReviewToday(): boolean {
  const session = getReviewSession();
  return session.date === todayStr() && session.reviewed > 0;
}

export function getReviewStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("english-buddy-srs-streak");
    return raw ? JSON.parse(raw).streak || 0 : 0;
  } catch {
    return 0;
  }
}
