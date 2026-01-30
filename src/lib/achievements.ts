// Achievement system for English Buddy

import { syncColumnToCloud, loadColumnFromCloud } from "./cloud-sync";

export interface Achievement {
  id: string;
  name: string;
  nameCn: string;
  icon: string;
  description: string;
  descriptionCn: string;
  category: "vocab" | "pronunciation" | "conversation" | "streak" | "xp" | "social" | "milestone";
  requirement: number; // threshold value
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // ── First Steps ──
  { id: "first-words", name: "First Words", nameCn: "第一步", icon: "🎯", description: "Complete first vocab session", descriptionCn: "完成第一次词汇学习", category: "vocab", requirement: 1 },
  { id: "voice-activated", name: "Voice Activated", nameCn: "开口说", icon: "🗣️", description: "Complete first pronunciation practice", descriptionCn: "完成第一次发音练习", category: "pronunciation", requirement: 1 },
  { id: "role-player", name: "Role Player", nameCn: "角色扮演", icon: "🎭", description: "Complete first conversation", descriptionCn: "完成第一次场景对话", category: "conversation", requirement: 1 },

  // ── Vocab Milestones ──
  { id: "word-collector-10", name: "Word Collector", nameCn: "词汇收集者", icon: "📖", description: "Learn 10 vocabulary words", descriptionCn: "学习10个词汇", category: "vocab", requirement: 10 },
  { id: "word-collector-50", name: "Vocabulary Builder", nameCn: "词汇建设者", icon: "📚", description: "Learn 50 vocabulary words", descriptionCn: "学习50个词汇", category: "vocab", requirement: 50 },
  { id: "word-collector-100", name: "Word Enthusiast", nameCn: "词汇爱好者", icon: "📚", description: "Learn 100 vocabulary words", descriptionCn: "学习100个词汇", category: "vocab", requirement: 100 },
  { id: "vocab-master", name: "Vocab Master", nameCn: "词汇大师", icon: "🏆", description: "Learn 500 vocabulary words", descriptionCn: "学习500个词汇", category: "vocab", requirement: 500 },

  // ── Pronunciation ──
  { id: "ten-tries", name: "Practice Makes Perfect", nameCn: "熟能生巧", icon: "🎙️", description: "Complete 10 pronunciation practices", descriptionCn: "完成10次发音练习", category: "pronunciation", requirement: 10 },
  { id: "fifty-tries", name: "Pronunciation Pro", nameCn: "发音专家", icon: "🎤", description: "Complete 50 pronunciation practices", descriptionCn: "完成50次发音练习", category: "pronunciation", requirement: 50 },
  { id: "hundred-tries", name: "Voice of Gold", nameCn: "金嗓子", icon: "🥇", description: "Complete 100 pronunciation practices", descriptionCn: "完成100次发音练习", category: "pronunciation", requirement: 100 },

  // ── Conversation ──
  { id: "five-convos", name: "Chatterbox", nameCn: "话匣子", icon: "💬", description: "Complete 5 conversations", descriptionCn: "完成5次对话", category: "conversation", requirement: 5 },
  { id: "twenty-convos", name: "Conversation Expert", nameCn: "对话专家", icon: "🗨️", description: "Complete 20 conversations", descriptionCn: "完成20次对话", category: "conversation", requirement: 20 },
  { id: "silver-tongue", name: "Silver Tongue", nameCn: "能说会道", icon: "🎤", description: "Score 90+ on a conversation", descriptionCn: "对话评分90+", category: "conversation", requirement: 90 },
  { id: "nurse-ready", name: "Nurse Ready", nameCn: "护士准备好了", icon: "👩‍⚕️", description: "Complete all beginner scenarios", descriptionCn: "完成所有初级场景", category: "conversation", requirement: 5 },

  // ── Streaks ──
  { id: "streak-3", name: "On Fire", nameCn: "连续3天", icon: "🔥", description: "3-day streak", descriptionCn: "连续学习3天", category: "streak", requirement: 3 },
  { id: "streak-7", name: "Unstoppable", nameCn: "势不可挡", icon: "⚡", description: "7-day streak", descriptionCn: "连续学习7天", category: "streak", requirement: 7 },
  { id: "streak-14", name: "Two Weeks Strong", nameCn: "两周坚持", icon: "💪", description: "14-day streak", descriptionCn: "连续学习14天", category: "streak", requirement: 14 },
  { id: "streak-30", name: "Dedicated", nameCn: "坚持不懈", icon: "💎", description: "30-day streak", descriptionCn: "连续学习30天", category: "streak", requirement: 30 },

  // ── XP Milestones ──
  { id: "xp-100", name: "Rising Star", nameCn: "新星", icon: "⭐", description: "Earn 100 XP", descriptionCn: "获得100经验值", category: "xp", requirement: 100 },
  { id: "xp-500", name: "Shining Star", nameCn: "闪亮之星", icon: "🌟", description: "Earn 500 XP", descriptionCn: "获得500经验值", category: "xp", requirement: 500 },
  { id: "xp-1000", name: "Superstar", nameCn: "超级明星", icon: "💫", description: "Earn 1000 XP", descriptionCn: "获得1000经验值", category: "xp", requirement: 1000 },
  { id: "xp-5000", name: "Legend", nameCn: "传奇", icon: "🏅", description: "Earn 5000 XP", descriptionCn: "获得5000经验值", category: "xp", requirement: 5000 },

  // ── Social / Chat ──
  { id: "chat-10", name: "AI Friend", nameCn: "AI朋友", icon: "🤖", description: "Send 10 chat messages", descriptionCn: "发送10条聊天消息", category: "social", requirement: 10 },
  { id: "chat-50", name: "Deep Thinker", nameCn: "深度思考者", icon: "🧠", description: "Send 50 chat messages", descriptionCn: "发送50条聊天消息", category: "social", requirement: 50 },
];

// ─── Achievement state ───────────────────────────────────────

const ACH_KEY = "english-buddy-achievements";

export interface AchievementState {
  unlocked: string[];
  unlockedAt: Record<string, string>;
  updated_at: string;
}

const defaultAchState: AchievementState = {
  unlocked: [],
  unlockedAt: {},
  updated_at: "",
};

export function getAchievementState(): AchievementState {
  if (typeof window === "undefined") return { ...defaultAchState };
  try {
    const raw = localStorage.getItem(ACH_KEY);
    if (!raw) return { ...defaultAchState };
    return { ...defaultAchState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultAchState };
  }
}

function saveAchievementState(s: AchievementState): void {
  if (typeof window === "undefined") return;
  s.updated_at = new Date().toISOString();
  localStorage.setItem(ACH_KEY, JSON.stringify(s));
  syncColumnToCloud("achievements_data", s);
}

export function unlockAchievement(id: string): { isNew: boolean } {
  const s = getAchievementState();
  if (s.unlocked.includes(id)) return { isNew: false };
  s.unlocked.push(id);
  s.unlockedAt[id] = new Date().toISOString();
  saveAchievementState(s);
  return { isNew: true };
}

export function checkAchievements(stats: {
  vocabLearned: number;
  pronunciationAttempts: number;
  conversationsDone: number;
  streakDays: number;
  xp: number;
  chatCount: number;
  bestConversationScore: number;
  scenariosCompleted: number;
}): string[] {
  const newlyUnlocked: string[] = [];
  const state = getAchievementState();

  const checks: [string, boolean][] = [
    // First steps
    ["first-words", stats.vocabLearned >= 1],
    ["voice-activated", stats.pronunciationAttempts >= 1],
    ["role-player", stats.conversationsDone >= 1],
    // Vocab
    ["word-collector-10", stats.vocabLearned >= 10],
    ["word-collector-50", stats.vocabLearned >= 50],
    ["word-collector-100", stats.vocabLearned >= 100],
    ["vocab-master", stats.vocabLearned >= 500],
    // Pronunciation
    ["ten-tries", stats.pronunciationAttempts >= 10],
    ["fifty-tries", stats.pronunciationAttempts >= 50],
    ["hundred-tries", stats.pronunciationAttempts >= 100],
    // Conversation
    ["five-convos", stats.conversationsDone >= 5],
    ["twenty-convos", stats.conversationsDone >= 20],
    ["silver-tongue", stats.bestConversationScore >= 90],
    ["nurse-ready", stats.scenariosCompleted >= 5],
    // Streaks
    ["streak-3", stats.streakDays >= 3],
    ["streak-7", stats.streakDays >= 7],
    ["streak-14", stats.streakDays >= 14],
    ["streak-30", stats.streakDays >= 30],
    // XP
    ["xp-100", stats.xp >= 100],
    ["xp-500", stats.xp >= 500],
    ["xp-1000", stats.xp >= 1000],
    ["xp-5000", stats.xp >= 5000],
    // Social
    ["chat-10", stats.chatCount >= 10],
    ["chat-50", stats.chatCount >= 50],
  ];

  for (const [id, met] of checks) {
    if (met && !state.unlocked.includes(id)) {
      const { isNew } = unlockAchievement(id);
      if (isNew) newlyUnlocked.push(id);
    }
  }

  return newlyUnlocked;
}

// ─── Cloud sync ──────────────────────────────────────────────

export async function loadAchievementsFromCloud(): Promise<boolean> {
  try {
    const cloud = await loadColumnFromCloud<AchievementState>("achievements_data");
    if (!cloud) return false;
    const local = getAchievementState();
    if (cloud.updated_at && (!local.updated_at || cloud.updated_at > local.updated_at)) {
      const merged = { ...defaultAchState, ...cloud };
      localStorage.setItem(ACH_KEY, JSON.stringify(merged));
      return true;
    }
    if (local.updated_at && (!cloud.updated_at || local.updated_at > cloud.updated_at)) {
      syncColumnToCloud("achievements_data", local);
    }
    return false;
  } catch {
    return false;
  }
}
