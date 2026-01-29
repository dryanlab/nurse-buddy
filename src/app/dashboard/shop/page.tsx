"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCoinState,
  spendCoins,
  equipTitle,
  isOwned,
  REWARD_CATALOG,
  COIN_RATES,
  getRarityColor,
  getRarityLabel,
  type CoinState,
  type RewardItem,
} from "@/lib/coin-store";

type Category = "all" | "avatar" | "title" | "theme";

function CoinDisplay({ coins }: { coins: number }) {
  return (
    <div className="flex items-center gap-2 bg-[#FFF5EB] border border-[#F4A261]/30 rounded-full px-4 py-2">
      <span className="text-2xl">🪙</span>
      <span className="text-xl font-bold text-[#F4A261]">{coins}</span>
      <span className="text-xs text-[#F4A261]/60">coins · 金币</span>
    </div>
  );
}

function RewardCard({
  item,
  owned,
  canAfford,
  onAction,
  coinState,
}: {
  item: RewardItem;
  owned: boolean;
  canAfford: boolean;
  onAction: (id: string) => void;
  coinState: CoinState;
}) {
  const rarity = getRarityColor(item.rarity);
  const rarityLabel = getRarityLabel(item.rarity);
  const isEquipped = item.category === "title" && coinState.equippedTitle === item.id;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`relative border rounded-xl p-4 transition-all ${rarity} ${owned ? "ring-2 ring-[#6BCB9E]/30" : ""}`}
    >
      <div className="absolute top-2 right-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider`}>
          {rarityLabel.cn}
        </span>
      </div>

      <div className="text-5xl text-center mb-3 mt-1">{item.icon}</div>

      <div className="text-center mb-1">
        <div className="text-sm font-bold text-[#2D2D2D]">{item.name}</div>
        <div className="text-[10px] text-[#9CA3AF]">{item.nameCn}</div>
      </div>

      <div className="text-center mt-3">
        {owned ? (
          <div className="space-y-1">
            <div className="text-xs text-[#6BCB9E] font-medium">✅ Owned · 已拥有</div>
            {item.category === "title" && (
              <button
                onClick={() => onAction(item.id)}
                className={`text-[10px] px-3 py-1 rounded-full transition-colors ${
                  isEquipped
                    ? "bg-[#6BCB9E]/20 text-[#6BCB9E]"
                    : "bg-[#F3E8E2] text-[#9CA3AF] hover:bg-[#F3E8E2]/80"
                }`}
              >
                {isEquipped ? "🏷️ Equipped · 已装备" : "Equip · 装备"}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onAction(item.id)}
            disabled={!canAfford}
            className={`flex items-center justify-center gap-1 mx-auto px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              canAfford
                ? "bg-[#F4A261]/20 text-[#F4A261] hover:bg-[#F4A261]/30 cursor-pointer"
                : "bg-[#F3E8E2] text-[#C4C4C4] cursor-not-allowed"
            }`}
          >
            <span>🪙</span>
            <span>{item.cost}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function ShopPage() {
  const [coinState, setCoinState] = useState<CoinState | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [showPurchase, setShowPurchase] = useState<string | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState("");

  useEffect(() => {
    setCoinState(getCoinState());
  }, []);

  if (!coinState) return null;

  const filteredItems = category === "all"
    ? REWARD_CATALOG
    : REWARD_CATALOG.filter((r) => r.category === category);

  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sorted = [...filteredItems].sort(
    (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity] || b.cost - a.cost
  );

  const handleAction = (itemId: string) => {
    const item = REWARD_CATALOG.find((r) => r.id === itemId)!;

    if (item.category === "title" && isOwned(itemId)) {
      const s = equipTitle(coinState.equippedTitle === itemId ? "" : itemId);
      setCoinState({ ...s });
      return;
    }

    if (isOwned(itemId)) return;

    const result = spendCoins(itemId);
    if (result.success) {
      setCoinState({ ...result.state });
      setShowPurchase(itemId);
      setPurchaseMsg(`🎉 Unlocked ${item.name}! · 已解锁 ${item.nameCn}！`);
      setTimeout(() => setShowPurchase(null), 2000);
    } else {
      setPurchaseMsg(result.error || "");
      setShowPurchase("error");
      setTimeout(() => setShowPurchase(null), 2000);
    }
  };

  const categories: { key: Category; label: string; labelCn: string; icon: string }[] = [
    { key: "all", label: "All", labelCn: "全部", icon: "🛍️" },
    { key: "avatar", label: "Avatars", labelCn: "头像", icon: "😎" },
    { key: "title", label: "Titles", labelCn: "称号", icon: "🏷️" },
    { key: "theme", label: "Themes", labelCn: "主题", icon: "🎨" },
  ];

  const rates = [
    { action: "Vocab session", actionCn: "词汇学习", coins: COIN_RATES.vocabSession, icon: "📖" },
    { action: "Pronunciation", actionCn: "发音练习", coins: COIN_RATES.pronunciationPractice, icon: "🎤" },
    { action: "Conversation", actionCn: "场景对话", coins: COIN_RATES.conversationComplete, icon: "💬" },
    { action: "Perfect score", actionCn: "满分", coins: COIN_RATES.quizPerfect, icon: "💯" },
    { action: "Daily login", actionCn: "每日登录", coins: COIN_RATES.dailyLogin, icon: "📅" },
    { action: "3-day streak", actionCn: "连续3天", coins: COIN_RATES.streakBonus3, icon: "🔥" },
    { action: "7-day streak", actionCn: "连续7天", coins: COIN_RATES.streakBonus7, icon: "🔥" },
    { action: "30-day streak", actionCn: "连续30天", coins: COIN_RATES.streakBonus30, icon: "💎" },
  ];

  return (
    <div className="px-5 pt-6 pb-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">🏪 Reward Shop</h1>
            <p className="text-sm text-[#9CA3AF]">奖励商店 — 用金币兑换酷炫奖品！</p>
          </div>
          <CoinDisplay coins={coinState.coins} />
        </div>
      </motion.div>

      {/* Purchase notification */}
      <AnimatePresence>
        {showPurchase && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`text-center py-3 rounded-xl font-bold ${
              showPurchase === "error"
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-[#EEFBF4] text-[#6BCB9E] border border-[#6BCB9E]/30"
            }`}
          >
            {purchaseMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === c.key
                ? "bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-[#FF6B6B]"
                : "bg-white border border-[#F3E8E2] text-[#9CA3AF] hover:border-[#FF6B6B]/20"
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
            <span className="text-[10px] text-[#C4C4C4]">{c.labelCn}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center border border-[#F3E8E2]">
          <div className="text-2xl font-bold text-[#F4A261]">{coinState.totalEarned}</div>
          <div className="text-[10px] text-[#9CA3AF]">Total Earned · 累计获得</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-[#F3E8E2]">
          <div className="text-2xl font-bold text-[#6BCB9E]">
            {coinState.unlockedAvatars.length + coinState.unlockedTitles.length + coinState.unlockedThemes.length}
          </div>
          <div className="text-[10px] text-[#9CA3AF]">Unlocked · 已解锁</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-[#F3E8E2]">
          <div className="text-2xl font-bold text-[#7C83FD]">{REWARD_CATALOG.length}</div>
          <div className="text-[10px] text-[#9CA3AF]">Total Items · 总商品</div>
        </div>
      </div>

      {/* Reward grid */}
      <div className="grid grid-cols-2 gap-3">
        {sorted.map((item) => (
          <RewardCard
            key={item.id}
            item={item}
            owned={isOwned(item.id)}
            canAfford={coinState.coins >= item.cost}
            onAction={handleAction}
            coinState={coinState}
          />
        ))}
      </div>

      {/* How to earn */}
      <div className="bg-white rounded-xl p-5 border border-[#F3E8E2]">
        <h3 className="text-lg font-bold text-[#2D2D2D] mb-1">💰 How to Earn Coins</h3>
        <p className="text-xs text-[#9CA3AF] mb-4">如何赚取金币</p>
        <div className="grid grid-cols-1 gap-2">
          {rates.map((r) => (
            <div key={r.action} className="flex items-center justify-between bg-[#FFF8F5] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span>{r.icon}</span>
                <div>
                  <div className="text-xs font-medium text-[#2D2D2D]">{r.action}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{r.actionCn}</div>
                </div>
              </div>
              <span className="text-[#F4A261] text-sm font-bold">+{r.coins} 🪙</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
