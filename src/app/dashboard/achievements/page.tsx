"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ALL_ACHIEVEMENTS, getAchievementState, type AchievementState } from "@/lib/achievements";
import { getProgress, type ProgressData } from "@/lib/progress-store";

type FilterCategory = "all" | "vocab" | "pronunciation" | "conversation" | "streak" | "xp" | "social";

export default function AchievementsPage() {
  const [achState, setAchState] = useState<AchievementState | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [filter, setFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    setAchState(getAchievementState());
    setProgress(getProgress());
  }, []);

  if (!achState || !progress) return null;

  const unlocked = new Set(achState.unlocked);
  const unlockedCount = achState.unlocked.length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  const filtered = filter === "all"
    ? ALL_ACHIEVEMENTS
    : ALL_ACHIEVEMENTS.filter((a) => a.category === filter);

  // Progress for each achievement
  function getProgressValue(a: typeof ALL_ACHIEVEMENTS[0]): { current: number; target: number } {
    const t = a.requirement;
    switch (a.category) {
      case "vocab": return { current: Math.min(progress!.vocabMastered.length, t), target: t };
      case "pronunciation": return { current: Math.min(progress!.pronunciationAttempts, t), target: t };
      case "conversation":
        if (a.id === "silver-tongue") return { current: Math.min(progress!.bestConversationScore, t), target: t };
        if (a.id === "nurse-ready") return { current: Math.min(progress!.scenariosCompleted.length, t), target: t };
        return { current: Math.min(progress!.scenarioAttempts, t), target: t };
      case "streak": return { current: Math.min(progress!.streakDays, t), target: t };
      case "xp": return { current: Math.min(progress!.xp, t), target: t };
      case "social": return { current: Math.min(progress!.chatCount, t), target: t };
      default: return { current: 0, target: t };
    }
  }

  const categories: { key: FilterCategory; label: string; icon: string }[] = [
    { key: "all", label: "全部", icon: "🏆" },
    { key: "vocab", label: "词汇", icon: "📖" },
    { key: "pronunciation", label: "发音", icon: "🎤" },
    { key: "conversation", label: "对话", icon: "💬" },
    { key: "streak", label: "连续", icon: "🔥" },
    { key: "xp", label: "经验", icon: "⭐" },
    { key: "social", label: "社交", icon: "🤖" },
  ];

  return (
    <div className="px-5 pt-6 pb-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">🏆 Achievements · 成就</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          {unlockedCount} / {totalCount} unlocked · 已解锁 {unlockedCount} / {totalCount}
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-3 bg-[#F3E8E2] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-full"
          />
        </div>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === c.key
                ? "bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-[#FF6B6B]"
                : "bg-white border border-[#F3E8E2] text-[#9CA3AF]"
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((ach, i) => {
          const isUnlocked = unlocked.has(ach.id);
          const { current, target } = getProgressValue(ach);
          const pct = Math.min((current / target) * 100, 100);

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? "bg-[#EEFBF4] border-[#6BCB9E]/30"
                  : "bg-white border-[#F3E8E2] opacity-75"
              }`}
            >
              <div className={`text-3xl ${isUnlocked ? "" : "grayscale opacity-40"}`}>
                {ach.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#2D2D2D]">{ach.name}</span>
                  {isUnlocked && <span className="text-[10px] text-[#6BCB9E] font-medium">✅</span>}
                </div>
                <div className="text-[10px] text-[#9CA3AF]">{ach.nameCn}</div>
                <div className="text-xs text-[#6B7280] mt-0.5">{ach.description}</div>
                {!isUnlocked && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1">
                      <span>{current} / {target}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F3E8E2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF6B6B]/50 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
