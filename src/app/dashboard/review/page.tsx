"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ArrowLeft, BookOpen, BarChart3 } from "lucide-react";
import Link from "next/link";
import { speak } from "@/lib/speech";
import { vocabulary, type VocabWord } from "@/data/vocabulary";
import { pronunciationItems, type PronunciationItem } from "@/data/pronunciation-words";
import {
  loadCards,
  getDueCards,
  getNewCards,
  getStats,
  addCard,
  reviewCard,
  updateReviewSession,
  completeReviewSession,
  hasCompletedReviewToday,
  getReviewStreak,
  type SRSCard,
  type ReviewQuality,
} from "@/lib/srs-engine";
import { earnCoins, COIN_RATES } from "@/lib/coin-store";

type ViewState = "summary" | "review" | "done" | "stats";

interface ReviewItem {
  card: SRSCard;
  vocab?: VocabWord;
  pronunciation?: PronunciationItem;
}

// Build lookup maps
const vocabMap = new Map(vocabulary.map((v) => [v.id, v]));
const pronMap = new Map(pronunciationItems.map((p) => [p.id, p]));

function resolveItem(card: SRSCard): ReviewItem | null {
  if (card.itemType === "vocab" || card.itemType === "phrase") {
    const v = vocabMap.get(card.itemId);
    if (!v) return null;
    return { card, vocab: v };
  }
  if (card.itemType === "pronunciation") {
    const p = pronMap.get(card.itemId);
    if (!p) return null;
    return { card, pronunciation: p };
  }
  return null;
}

export default function ReviewPage() {
  const [view, setView] = useState<ViewState>("summary");
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratedQuality, setRatedQuality] = useState<ReviewQuality | null>(null);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [streak, setStreak] = useState(0);

  // Load cards on mount
  useEffect(() => {
    const c = loadCards();
    setCards(c);
    setStreak(getReviewStreak());

    // If no cards exist yet, auto-add some vocab
    if (c.length === 0) {
      const newIds = getNewCards(
        vocabulary.map((v) => v.id),
        c,
        10
      );
      let updated = c;
      for (const id of newIds) {
        updated = addCard(id, "vocab");
      }
      setCards(updated);
    }
  }, []);

  const stats = getStats(cards);

  const startReview = useCallback(() => {
    const allCards = loadCards();
    const due = getDueCards(allCards, 50);

    // Also introduce some new cards
    const newIds = getNewCards(
      vocabulary.map((v) => v.id),
      allCards,
      Math.max(0, 10 - due.filter((c) => c.status === "new").length)
    );

    let updated = allCards;
    for (const id of newIds) {
      updated = addCard(id, "vocab");
    }
    setCards(updated);

    // Build queue
    const freshDue = getDueCards(updated, 50);
    const items = freshDue.map(resolveItem).filter(Boolean) as ReviewItem[];
    setQueue(items);
    setCurrentIdx(0);
    setRevealed(false);
    setRatedQuality(null);
    setSessionReviewed(0);
    setSessionCorrect(0);
    setView("review");
  }, []);

  const handleRate = (quality: ReviewQuality) => {
    if (!queue[currentIdx]) return;
    const card = queue[currentIdx].card;
    const updated = reviewCard(card.itemId, quality);
    setCards(updated);
    setRatedQuality(quality);
    updateReviewSession(quality);
    setSessionReviewed((n) => n + 1);
    if (quality >= 2) setSessionCorrect((n) => n + 1);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= queue.length) {
      // Session complete
      const session = completeReviewSession();
      setStreak(session.streak);
      // Award XP/coins
      earnCoins(15, "daily-review");
      if (session.streak >= 7) earnCoins(10, "review-streak-bonus");
      setView("done");
      return;
    }
    setCurrentIdx((i) => i + 1);
    setRevealed(false);
    setRatedQuality(null);
  };

  const current = queue[currentIdx] || null;

  // ─── Summary View ──────────────────────────────────────────
  if (view === "summary") {
    const completed = hasCompletedReviewToday();
    return (
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-[#9CA3AF]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-[#2D2D2D]">📚 复习</h1>
        </div>

        {completed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#EEFBF4] to-[#E0F7EC] rounded-2xl p-8 text-center border border-[#6BCB9E]/20"
          >
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">今日复习完成！</h2>
            <p className="text-sm text-[#6B7280]">干得好！明天继续保持</p>
            {streak > 1 && (
              <p className="text-sm text-[#6BCB9E] font-semibold mt-2">
                🔥 连续复习 {streak} 天
              </p>
            )}
            <button
              onClick={startReview}
              className="mt-6 bg-white text-[#6BCB9E] px-6 py-2.5 rounded-xl text-sm font-medium border border-[#6BCB9E]/30"
            >
              再练一次
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#FFF0EE] to-[#FFE8E4] rounded-2xl p-8 text-center border border-[#FF6B6B]/10"
          >
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">今日复习</h2>
            <div className="flex justify-center gap-6 mb-6 text-sm">
              <div>
                <div className="text-2xl font-bold text-[#FF6B6B]">{stats.dueToday}</div>
                <div className="text-[#9CA3AF]">待复习</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#F4A261]">
                  {Math.min(10, getNewCards(vocabulary.map((v) => v.id), cards, 10).length)}
                </div>
                <div className="text-[#9CA3AF]">新词汇</div>
              </div>
            </div>
            <button
              onClick={startReview}
              className="bg-[#FF6B6B] text-white px-8 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-sm"
            >
              开始复习
            </button>
            {streak > 0 && (
              <p className="text-xs text-[#9CA3AF] mt-4">🔥 已连续复习 {streak} 天</p>
            )}
          </motion.div>
        )}

        {/* Stats card */}
        <button
          onClick={() => setView("stats")}
          className="w-full mt-4 bg-white rounded-2xl p-4 border border-[#F3E8E2] flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <BarChart3 className="w-5 h-5 text-[#F4A261]" />
          <div className="text-left flex-1">
            <div className="text-sm font-semibold text-[#2D2D2D]">记忆统计</div>
            <div className="text-xs text-[#9CA3AF]">
              {stats.total} 词汇 · {stats.mastered} 已掌握
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ─── Stats View ────────────────────────────────────────────
  if (view === "stats") {
    const stageData = [
      { label: "新词", count: stats.new, color: "#9CA3AF", emoji: "🆕" },
      { label: "学习中", count: stats.learning, color: "#F4A261", emoji: "📖" },
      { label: "复习中", count: stats.review, color: "#6BCB9E", emoji: "🔄" },
      { label: "已掌握", count: stats.mastered, color: "#FF6B6B", emoji: "⭐" },
    ];
    const maxCount = Math.max(...stageData.map((s) => s.count), 1);

    return (
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("summary")} className="text-[#9CA3AF]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#2D2D2D]">📊 记忆统计</h1>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
            <div className="text-2xl font-bold text-[#FF6B6B]">{stats.total}</div>
            <div className="text-xs text-[#9CA3AF]">总词汇</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
            <div className="text-2xl font-bold text-[#6BCB9E]">{stats.mastered}</div>
            <div className="text-xs text-[#9CA3AF]">已掌握</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
            <div className="text-2xl font-bold text-[#F4A261]">{stats.dueToday}</div>
            <div className="text-xs text-[#9CA3AF]">今日待复习</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
            <div className="text-2xl font-bold text-[#FF6B6B]">{streak}</div>
            <div className="text-xs text-[#9CA3AF]">连续天数</div>
          </div>
        </div>

        {/* Stage bar chart */}
        <div className="bg-white rounded-2xl p-5 border border-[#F3E8E2] mb-6">
          <h3 className="text-sm font-semibold text-[#2D2D2D] mb-4">记忆阶段分布</h3>
          <div className="space-y-3">
            {stageData.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{s.emoji}</span>
                <span className="text-xs text-[#6B7280] w-16">{s.label}</span>
                <div className="flex-1 h-6 bg-[#F3E8E2] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color, minWidth: s.count > 0 ? 24 : 0 }}
                  />
                </div>
                <span className="text-sm font-bold text-[#2D2D2D] w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast */}
        {stats.total > 0 && (
          <div className="bg-gradient-to-r from-[#6BCB9E] to-[#4FB584] rounded-2xl p-5 text-white mb-8">
            <p className="text-xs font-medium opacity-80 mb-1">📈 预测</p>
            <p className="text-sm leading-relaxed">
              {stats.mastered > 0
                ? `你已掌握 ${stats.mastered} 个词汇！按当前进度，约 ${Math.ceil((stats.total - stats.mastered) / Math.max(stats.mastered / 7, 1))} 周可全部掌握。`
                : "开始复习后，这里会显示你的学习进度预测。"}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─── Done View ─────────────────────────────────────────────
  if (view === "done") {
    const accuracy = sessionReviewed > 0 ? Math.round((sessionCorrect / sessionReviewed) * 100) : 0;
    return (
      <div className="px-5 pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center border border-[#F3E8E2] shadow-sm mt-10"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">复习完成！</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">太棒了，坚持就是胜利</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#FFF0EE] rounded-xl p-3">
              <div className="text-xl font-bold text-[#FF6B6B]">{sessionReviewed}</div>
              <div className="text-[10px] text-[#9CA3AF]">已复习</div>
            </div>
            <div className="bg-[#EEFBF4] rounded-xl p-3">
              <div className="text-xl font-bold text-[#6BCB9E]">{accuracy}%</div>
              <div className="text-[10px] text-[#9CA3AF]">正确率</div>
            </div>
            <div className="bg-[#FFF5EB] rounded-xl p-3">
              <div className="text-xl font-bold text-[#F4A261]">{streak}</div>
              <div className="text-[10px] text-[#9CA3AF]">连续天数</div>
            </div>
          </div>

          <p className="text-xs text-[#6BCB9E] mb-6">+15 🪙 复习奖励</p>

          <div className="flex flex-col gap-2">
            <button
              onClick={startReview}
              className="bg-[#FF6B6B] text-white px-6 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
            >
              再来一轮
            </button>
            <Link
              href="/dashboard"
              className="text-[#9CA3AF] text-sm py-2"
            >
              返回首页
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Review View ───────────────────────────────────────────
  if (!current) {
    // No cards to review
    return (
      <div className="px-5 pt-6 text-center">
        <div className="text-4xl mb-4 mt-20">🎊</div>
        <h2 className="text-lg font-bold text-[#2D2D2D]">没有待复习的卡片</h2>
        <p className="text-sm text-[#9CA3AF] mt-2">去词汇页面添加一些吧</p>
        <Link href="/dashboard/vocabulary" className="inline-block mt-4 text-[#FF6B6B] text-sm font-medium">
          去添加词汇 →
        </Link>
      </div>
    );
  }

  const isVocab = !!current.vocab;
  const isPron = !!current.pronunciation;
  const word = current.vocab?.word || current.pronunciation?.word || "";
  const phonetic = current.vocab?.phonetic || current.pronunciation?.phonetic || "";
  const chinese = current.vocab?.chinese || current.pronunciation?.chinese || "";

  // Calculate next review interval preview
  const nextIntervals = [0, 1, 2, 3].map((q) => {
    const simulated = { ...current.card };
    // Simple preview
    if (q <= 1) return 1;
    if (simulated.interval === 0) return q === 3 ? 3 : 1;
    if (simulated.interval <= 1) return q === 3 ? 3 : 1;
    return Math.round(simulated.interval * (q === 3 ? simulated.easeFactor : simulated.easeFactor * 0.8));
  });

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setView("summary")} className="text-[#9CA3AF]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-[#9CA3AF]">
          {currentIdx + 1} / {queue.length}
        </span>
        <BookOpen className="w-5 h-5 text-[#9CA3AF]" />
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#F3E8E2] rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / queue.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl border border-[#F3E8E2] shadow-sm overflow-hidden"
      >
        {/* Front - always visible */}
        <div className="p-8 text-center">
          <div className="text-xs text-[#9CA3AF] mb-2">
            {isVocab ? "📖 词汇" : isPron ? "🎤 发音" : "💬 短语"}
          </div>
          <h2 className="text-3xl font-bold text-[#2D2D2D] mb-2">{word}</h2>
          <p className="text-lg text-[#9CA3AF] font-mono mb-4">{phonetic}</p>
          <button
            onClick={() => speak(word)}
            className="inline-flex items-center gap-2 bg-[#EEFBF4] text-[#6BCB9E] px-4 py-2 rounded-xl text-sm active:scale-95 transition-transform"
          >
            <Volume2 className="w-4 h-4" /> 听发音
          </button>

          {!revealed && (
            <p className="text-xs text-[#9CA3AF] mt-6 animate-pulse">
              回忆一下中文意思，然后点击下方查看
            </p>
          )}
        </div>

        {/* Reveal button / answer */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-4 bg-[#FFF8F5] border-t border-[#F3E8E2] text-[#FF6B6B] font-semibold text-sm active:bg-[#FFF0EE]"
          >
            点击查看答案
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-[#F3E8E2]"
            >
              <div className="p-6 text-center bg-[#FFF8F5]">
                <h3 className="text-2xl font-bold text-[#FF6B6B] mb-2">{chinese}</h3>
                {isVocab && current.vocab && (
                  <div className="bg-white rounded-xl p-3 mt-3 text-left border border-[#F3E8E2]">
                    <p className="text-xs text-[#9CA3AF] mb-1">例句</p>
                    <p className="text-sm text-[#2D2D2D]">{current.vocab.example}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{current.vocab.exampleChinese}</p>
                  </div>
                )}
                {isPron && current.pronunciation && (
                  <div className="bg-white rounded-xl p-3 mt-3 text-left border border-[#F3E8E2]">
                    <p className="text-xs text-[#9CA3AF] mb-1">发音技巧</p>
                    <p className="text-sm text-[#2D2D2D]">{current.pronunciation.tip}</p>
                  </div>
                )}
              </div>

              {/* Rating buttons */}
              {ratedQuality === null ? (
                <div className="p-4 grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRate(0)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <span className="text-lg">🔴</span>
                    <span className="text-[10px] font-medium text-red-500">忘了</span>
                    <span className="text-[9px] text-[#9CA3AF]">1天</span>
                  </button>
                  <button
                    onClick={() => handleRate(1)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-orange-50 active:bg-orange-100 transition-colors"
                  >
                    <span className="text-lg">🟠</span>
                    <span className="text-[10px] font-medium text-orange-500">困难</span>
                    <span className="text-[9px] text-[#9CA3AF]">1天</span>
                  </button>
                  <button
                    onClick={() => handleRate(2)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-green-50 active:bg-green-100 transition-colors"
                  >
                    <span className="text-lg">🟢</span>
                    <span className="text-[10px] font-medium text-green-500">记得</span>
                    <span className="text-[9px] text-[#9CA3AF]">{nextIntervals[2]}天</span>
                  </button>
                  <button
                    onClick={() => handleRate(3)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-yellow-50 active:bg-yellow-100 transition-colors"
                  >
                    <span className="text-lg">🌟</span>
                    <span className="text-[10px] font-medium text-yellow-600">简单</span>
                    <span className="text-[9px] text-[#9CA3AF]">{nextIntervals[3]}天</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-[#9CA3AF] mb-3">
                    下次复习：{(() => {
                      const c = loadCards().find((c) => c.itemId === current.card.itemId);
                      return c?.nextReview || "明天";
                    })()}
                  </p>
                  <button
                    onClick={handleNext}
                    className="bg-[#FF6B6B] text-white px-8 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                  >
                    {currentIdx + 1 >= queue.length ? "完成 🎉" : "下一个 →"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
