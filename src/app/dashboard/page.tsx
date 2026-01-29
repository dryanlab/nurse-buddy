"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mic, MessageCircle, BookOpen, Flame, Target, Trophy, Star, Zap, Brain } from "lucide-react";
import { getProgress, getLevelInfo, recordActivity, shouldShowDailyReward, type ProgressData } from "@/lib/progress-store";
import { loadCards, getStats, hasCompletedReviewToday, getReviewStreak } from "@/lib/srs-engine";
import { getCoinState } from "@/lib/coin-store";
import { getAchievementState, ALL_ACHIEVEMENTS } from "@/lib/achievements";
import { getUser } from "@/lib/auth-store";
import SkillAssessment from "@/components/skill-assessment";

const quickActions = [
  { href: "/dashboard/pronunciation", icon: Mic, label: "练发音", desc: "跟读练习", color: "bg-[#FF6B6B]", lightColor: "bg-[#FFF0EE]" },
  { href: "/dashboard/conversation", icon: MessageCircle, label: "场景对话", desc: "角色扮演", color: "bg-[#6BCB9E]", lightColor: "bg-[#EEFBF4]" },
  { href: "/dashboard/vocabulary", icon: BookOpen, label: "词汇卡片", desc: "200+ 词汇", color: "bg-[#F4A261]", lightColor: "bg-[#FFF5EB]" },
];

export default function DashboardPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [assessed, setAssessed] = useState(true);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<typeof ALL_ACHIEVEMENTS>([]);

  useEffect(() => {
    setProgress(getProgress());
    setAssessed(localStorage.getItem("english-buddy-assessed") === "true");

    // Check daily reward — mark immediately to prevent re-trigger on refresh
    if (shouldShowDailyReward()) {
      setShowDailyReward(true);
      // Mark reward date immediately so refresh won't re-trigger
      const today = new Date().toISOString().slice(0, 10);
      const key = "english-buddy-progress";
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          data.lastLoginRewardDate = today;
          localStorage.setItem(key, JSON.stringify(data));
        }
      } catch { /* ignore */ }
    }

    // Recent achievements
    const achState = getAchievementState();
    const recent = achState.unlocked.slice(-3).reverse()
      .map((id) => ALL_ACHIEVEMENTS.find((a) => a.id === id))
      .filter(Boolean) as typeof ALL_ACHIEVEMENTS;
    setRecentAchievements(recent);
  }, []);

  function claimDailyReward() {
    recordActivity();
    setShowDailyReward(false);
    setProgress(getProgress());
  }

  if (!assessed) {
    return <SkillAssessment onComplete={() => { setAssessed(true); setProgress(getProgress()); }} />;
  }

  const user = getUser();
  const streak = progress?.streakDays ?? 0;
  const totalPractice = progress?.pronunciationAttempts ?? 0;
  const vocabMastered = progress?.vocabMastered?.length ?? 0;
  const accuracy = totalPractice > 0
    ? Math.round(((progress?.pronunciationCorrect ?? 0) / totalPractice) * 100)
    : 0;
  const levelInfo = getLevelInfo(progress?.xp ?? 0);
  const coins = getCoinState().coins;

  return (
    <div className="px-5 pt-6">
      {/* Daily Reward Popup */}
      <AnimatePresence>
        {showDailyReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6"
            onClick={claimDailyReward}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">Daily Login Reward!</h2>
              <p className="text-sm text-[#9CA3AF] mb-1">每日登录奖励</p>
              <div className="flex items-center justify-center gap-4 my-4">
                <div className="bg-[#FF6B6B]/10 rounded-xl px-4 py-2">
                  <span className="text-sm font-bold text-[#FF6B6B]">+5 学习积分</span>
                </div>
                <div className="bg-[#FFF5EB] rounded-xl px-4 py-2">
                  <span className="text-sm font-bold text-[#F4A261]">+5 🪙</span>
                </div>
                {streak > 1 && (
                  <div className="bg-[#EEFBF4] rounded-xl px-4 py-2">
                    <span className="text-sm font-bold text-[#6BCB9E]">🔥 {streak} day streak!</span>
                  </div>
                )}
              </div>
              <button
                onClick={claimDailyReward}
                className="w-full py-3 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#E55555] transition-all"
              >
                Claim! · 领取！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">
          {user ? `${user.avatar} 你好，${user.name}！` : "你好！👋"}
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-1">今天也要加油练习英语哦</p>
      </motion.div>

      {/* Level + 学习积分 Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-4 bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-2xl p-4 text-white"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">{levelInfo.name}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <span className="text-xs">🪙 {coins}</span>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${levelInfo.progressToNext * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] opacity-80">
          <span>{progress?.xp ?? 0}  学习积分</span>
          <span>{levelInfo.nextXp}  学习积分</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mt-4"
      >
        <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
          <Flame className="w-5 h-5 text-[#FF6B6B] mx-auto mb-1" />
          <div className="text-xl font-bold text-[#2D2D2D]">{streak}</div>
          <div className="text-[10px] text-[#9CA3AF]">🔥 连续打卡</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
          <Target className="w-5 h-5 text-[#6BCB9E] mx-auto mb-1" />
          <div className="text-xl font-bold text-[#2D2D2D]">{accuracy}%</div>
          <div className="text-[10px] text-[#9CA3AF]">发音准确率</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
          <Trophy className="w-5 h-5 text-[#F4A261] mx-auto mb-1" />
          <div className="text-xl font-bold text-[#2D2D2D]">{vocabMastered}</div>
          <div className="text-[10px] text-[#9CA3AF]">已掌握词汇</div>
        </div>
      </motion.div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[#6B7280]">最近成就</h2>
            <Link href="/dashboard/achievements" className="text-xs text-[#FF6B6B]">查看全部 →</Link>
          </div>
          <div className="flex gap-2">
            {recentAchievements.map((ach) => (
              <div key={ach.id} className="flex items-center gap-2 bg-[#EEFBF4] border border-[#6BCB9E]/20 rounded-xl px-3 py-2 flex-1">
                <span className="text-lg">{ach.icon}</span>
                <div>
                  <div className="text-[10px] font-semibold text-[#2D2D2D]">{ach.name}</div>
                  <div className="text-[8px] text-[#9CA3AF]">{ach.nameCn}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SRS Review Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-4"
      >
        {(() => {
          const srsCards = loadCards();
          const srsStats = getStats(srsCards);
          const reviewDone = hasCompletedReviewToday();
          const reviewStreak = getReviewStreak();
          return (
            <Link
              href="/dashboard/review"
              className={`block rounded-2xl p-4 active:scale-[0.98] transition-transform border ${
                reviewDone
                  ? "bg-[#EEFBF4] border-[#6BCB9E]/20"
                  : "bg-gradient-to-r from-[#FFF0EE] to-[#FFE8E4] border-[#FF6B6B]/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  reviewDone ? "bg-[#6BCB9E]" : "bg-[#FF6B6B]"
                }`}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#2D2D2D]">
                    {reviewDone ? "✅ 今日复习完成" : "📚 今日复习"}
                  </div>
                  <div className="text-xs text-[#9CA3AF]">
                    {reviewDone
                      ? `已掌握 ${srsStats.mastered} 词${reviewStreak > 1 ? ` · 🔥 ${reviewStreak}天` : ""}`
                      : `${srsStats.dueToday} 词待复习 · ${srsStats.total} 词总计`}
                  </div>
                </div>
                {!reviewDone && (
                  <span className="text-xs bg-[#FF6B6B] text-white px-3 py-1 rounded-full font-medium">
                    开始
                  </span>
                )}
              </div>
            </Link>
          );
        })()}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4"
      >
        <h2 className="text-sm font-semibold text-[#6B7280] mb-3">今日学习</h2>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-4 ${action.lightColor} rounded-2xl p-4 active:scale-[0.98] transition-transform`}
            >
              <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#2D2D2D]">{action.label}</div>
                <div className="text-xs text-[#9CA3AF]">{action.desc}</div>
              </div>
              <div className="text-xs text-[#9CA3AF]">
                <Star className="w-4 h-4 text-[#F4A261]" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Tip of the day */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 mb-4 bg-gradient-to-r from-[#6BCB9E] to-[#4FB584] rounded-2xl p-5 text-white"
      >
        <p className="text-xs font-medium opacity-80 mb-1">💡 今日小贴士</p>
        <p className="text-sm leading-relaxed">
          发 /θ/ 音时（如 think, three），舌尖要轻轻放在上下牙齿之间，然后送气。
          试试说 &quot;The patient&apos;s temperature is thirty-eight.&quot;
        </p>
      </motion.div>
    </div>
  );
}
