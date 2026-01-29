// Coin system — earn coins through progress, spend on avatars, titles, themes

const COIN_KEY = "english-buddy-coins";

export interface CoinState {
  coins: number;
  totalEarned: number;
  unlockedAvatars: string[];
  unlockedTitles: string[];
  unlockedThemes: string[];
  equippedTitle: string;
}

const defaultState: CoinState = {
  coins: 0,
  totalEarned: 0,
  unlockedAvatars: [],
  unlockedTitles: [],
  unlockedThemes: [],
  equippedTitle: "",
};

// ─── Reward catalog ──────────────────────────────────────────

export interface RewardItem {
  id: string;
  name: string;
  nameCn: string;
  icon: string;
  cost: number;
  category: "avatar" | "title" | "theme";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const REWARD_CATALOG: RewardItem[] = [
  // ── Avatars ──
  // Common (50-100)
  { id: "av-cat", name: "Curious Cat", nameCn: "好奇猫", icon: "🐱", cost: 50, category: "avatar", rarity: "common" },
  { id: "av-dog", name: "Friendly Pup", nameCn: "友善狗", icon: "🐶", cost: 50, category: "avatar", rarity: "common" },
  { id: "av-rabbit", name: "Quick Bunny", nameCn: "飞兔", icon: "🐰", cost: 50, category: "avatar", rarity: "common" },
  { id: "av-bear", name: "Study Bear", nameCn: "学习熊", icon: "🐻", cost: 75, category: "avatar", rarity: "common" },
  { id: "av-chick", name: "Happy Chick", nameCn: "快乐小鸡", icon: "🐥", cost: 75, category: "avatar", rarity: "common" },
  { id: "av-panda", name: "Panda Pal", nameCn: "熊猫伙伴", icon: "🐼", cost: 100, category: "avatar", rarity: "common" },
  { id: "av-penguin", name: "Cool Penguin", nameCn: "酷企鹅", icon: "🐧", cost: 100, category: "avatar", rarity: "common" },
  { id: "av-koala", name: "Chill Koala", nameCn: "悠闲考拉", icon: "🐨", cost: 100, category: "avatar", rarity: "common" },
  // Rare (200-500)
  { id: "av-fox", name: "Clever Fox", nameCn: "聪明狐", icon: "🦊", cost: 200, category: "avatar", rarity: "rare" },
  { id: "av-owl", name: "Wise Owl", nameCn: "智慧猫头鹰", icon: "🦉", cost: 200, category: "avatar", rarity: "rare" },
  { id: "av-dolphin", name: "Smart Dolphin", nameCn: "聪明海豚", icon: "🐬", cost: 250, category: "avatar", rarity: "rare" },
  { id: "av-eagle", name: "Sky Eagle", nameCn: "天鹰", icon: "🦅", cost: 300, category: "avatar", rarity: "rare" },
  { id: "av-butterfly", name: "Dream Butterfly", nameCn: "梦蝶", icon: "🦋", cost: 350, category: "avatar", rarity: "rare" },
  { id: "av-unicorn", name: "Magic Unicorn", nameCn: "魔法独角兽", icon: "🦄", cost: 400, category: "avatar", rarity: "rare" },
  { id: "av-tiger", name: "Fierce Tiger", nameCn: "猛虎", icon: "🐯", cost: 450, category: "avatar", rarity: "rare" },
  { id: "av-dragon", name: "Fire Dragon", nameCn: "火龙", icon: "🐲", cost: 500, category: "avatar", rarity: "rare" },
  // Epic (600-800)
  { id: "av-phoenix", name: "Phoenix", nameCn: "凤凰", icon: "🔥", cost: 600, category: "avatar", rarity: "epic" },
  { id: "av-alien", name: "Alien Linguist", nameCn: "外星语言学家", icon: "👽", cost: 700, category: "avatar", rarity: "epic" },
  { id: "av-ninja", name: "Word Ninja", nameCn: "文字忍者", icon: "🥷", cost: 700, category: "avatar", rarity: "epic" },
  { id: "av-robot", name: "AI Tutor", nameCn: "AI导师", icon: "🤖", cost: 800, category: "avatar", rarity: "epic" },
  // Legendary (1000+)
  { id: "av-crown", name: "English King", nameCn: "英语之王", icon: "👑", cost: 1000, category: "avatar", rarity: "legendary" },
  { id: "av-galaxy", name: "Galaxy Brain", nameCn: "银河大脑", icon: "🌌", cost: 1200, category: "avatar", rarity: "legendary" },

  // ── Titles ──
  { id: "ti-newbie", name: "Word Explorer", nameCn: "词汇探索者", icon: "🔍", cost: 30, category: "title", rarity: "common" },
  { id: "ti-curious", name: "Curious Learner", nameCn: "好奇学习者", icon: "💡", cost: 30, category: "title", rarity: "common" },
  { id: "ti-speaker", name: "Confident Speaker", nameCn: "自信演说家", icon: "🎤", cost: 100, category: "title", rarity: "rare" },
  { id: "ti-medical", name: "Medical English Pro", nameCn: "医疗英语达人", icon: "🩺", cost: 150, category: "title", rarity: "rare" },
  { id: "ti-pronunciation", name: "Pronunciation Master", nameCn: "发音大师", icon: "👄", cost: 200, category: "title", rarity: "epic" },
  { id: "ti-conversation", name: "Conversation Star", nameCn: "对话之星", icon: "⭐", cost: 200, category: "title", rarity: "epic" },
  { id: "ti-polyglot", name: "Polyglot", nameCn: "语言天才", icon: "🌍", cost: 300, category: "title", rarity: "epic" },
  { id: "ti-legend", name: "Living Legend", nameCn: "传奇人物", icon: "🌟", cost: 500, category: "title", rarity: "legendary" },

  // ── Themes ──
  { id: "th-ocean", name: "Ocean Blue", nameCn: "海洋蓝", icon: "🌊", cost: 120, category: "theme", rarity: "rare" },
  { id: "th-forest", name: "Forest Green", nameCn: "森林绿", icon: "🌲", cost: 120, category: "theme", rarity: "rare" },
  { id: "th-sunset", name: "Sunset Orange", nameCn: "日落橙", icon: "🌅", cost: 120, category: "theme", rarity: "rare" },
  { id: "th-sakura", name: "Sakura Pink", nameCn: "樱花粉", icon: "🌸", cost: 200, category: "theme", rarity: "epic" },
  { id: "th-galaxy", name: "Galaxy Purple", nameCn: "星河紫", icon: "🔮", cost: 300, category: "theme", rarity: "epic" },
  { id: "th-golden", name: "Golden Hour", nameCn: "黄金时刻", icon: "✨", cost: 300, category: "theme", rarity: "epic" },
  { id: "th-aurora", name: "Aurora Borealis", nameCn: "极光", icon: "💫", cost: 600, category: "theme", rarity: "legendary" },
];

// ─── Coin earning rates ──────────────────────────────────────

export const COIN_RATES = {
  vocabSession: 10,
  pronunciationPractice: 15,
  conversationComplete: 30,
  quizPerfect: 20,
  quizGood: 8,
  dailyLogin: 5,
  streakBonus3: 20,
  streakBonus7: 50,
  streakBonus30: 200,
  chatMessage10: 10,
};

// ─── State management ────────────────────────────────────────

export function getCoinState(): CoinState {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = localStorage.getItem(COIN_KEY);
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
}

function saveCoinState(s: CoinState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COIN_KEY, JSON.stringify(s));
}

export function earnCoins(amount: number, _reason?: string): CoinState {
  const s = getCoinState();
  s.coins += amount;
  s.totalEarned += amount;
  saveCoinState(s);
  return s;
}

export function spendCoins(itemId: string): { success: boolean; error?: string; state: CoinState } {
  const s = getCoinState();
  const item = REWARD_CATALOG.find((r) => r.id === itemId);
  if (!item) return { success: false, error: "Item not found", state: s };

  const owned =
    item.category === "avatar" ? s.unlockedAvatars :
    item.category === "title" ? s.unlockedTitles :
    s.unlockedThemes;
  if (owned.includes(itemId)) return { success: false, error: "Already owned!", state: s };

  if (s.coins < item.cost) return { success: false, error: `Need ${item.cost - s.coins} more coins!`, state: s };

  s.coins -= item.cost;
  if (item.category === "avatar") s.unlockedAvatars.push(itemId);
  else if (item.category === "title") s.unlockedTitles.push(itemId);
  else s.unlockedThemes.push(itemId);

  saveCoinState(s);
  return { success: true, state: s };
}

export function equipTitle(titleId: string): CoinState {
  const s = getCoinState();
  if (s.unlockedTitles.includes(titleId) || titleId === "") {
    s.equippedTitle = titleId;
    saveCoinState(s);
  }
  return s;
}

export function isOwned(itemId: string): boolean {
  const s = getCoinState();
  const item = REWARD_CATALOG.find((r) => r.id === itemId);
  if (!item) return false;
  if (item.category === "avatar") return s.unlockedAvatars.includes(itemId);
  if (item.category === "title") return s.unlockedTitles.includes(itemId);
  return s.unlockedThemes.includes(itemId);
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common": return "text-slate-500 border-slate-300 bg-slate-50";
    case "rare": return "text-blue-500 border-blue-300 bg-blue-50";
    case "epic": return "text-purple-500 border-purple-300 bg-purple-50";
    case "legendary": return "text-yellow-600 border-yellow-400 bg-yellow-50";
    default: return "text-slate-500";
  }
}

export function getRarityLabel(rarity: string): { en: string; cn: string } {
  switch (rarity) {
    case "common": return { en: "Common", cn: "普通" };
    case "rare": return { en: "Rare", cn: "稀有" };
    case "epic": return { en: "Epic", cn: "史诗" };
    case "legendary": return { en: "Legendary", cn: "传说" };
    default: return { en: "", cn: "" };
  }
}
