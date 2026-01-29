"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, RotateCcw, ChevronRight, ChevronLeft, Lightbulb, Loader2, Shuffle, Filter } from "lucide-react";
import { pronunciationItems, CATEGORIES, type PronunciationItem } from "@/data/pronunciation-words";
import { speak, startListening, compareTexts } from "@/lib/speech";
import { recordPronunciation } from "@/lib/progress-store";

type PracticeState = "idle" | "listening" | "evaluating" | "result";
type DifficultyFilter = "all" | "easy" | "medium" | "hard";

export default function PronunciationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<PracticeState>("idle");
  const [spokenText, setSpokenText] = useState("");
  const [score, setScore] = useState(0);
  const [matchedWords, setMatchedWords] = useState<{ word: string; matched: boolean }[]>([]);
  const [error, setError] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const filteredItems = useMemo(() => {
    return pronunciationItems.filter((item) => {
      if (difficultyFilter !== "all" && item.difficulty !== difficultyFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      return true;
    });
  }, [difficultyFilter, categoryFilter]);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredItems.length - 1));
  const item: PronunciationItem | undefined = filteredItems[safeIndex];

  const handleSpeak = useCallback(async (rate = 1) => {
    if (!item) return;
    try {
      await speak(item.word, rate);
    } catch {
      setError("语音播放失败，请检查浏览器设置");
    }
  }, [item]);

  const handleListen = useCallback(async () => {
    if (!item) return;
    setState("listening");
    setError("");
    setAiFeedback("");

    try {
      const result = await startListening();
      setState("evaluating");
      setSpokenText(result.transcript);

      const comparison = compareTexts(item.word, result.transcript);
      setScore(comparison.score);
      setMatchedWords(comparison.targetWords);
      recordPronunciation(comparison.score);

      setLoadingFeedback(true);
      try {
        const res = await fetch("/api/pronunciation-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: item.word,
            spoken: result.transcript,
            score: comparison.score,
            tip: item.tip,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiFeedback(data.feedback);
        }
      } catch {
        // AI feedback is optional
      } finally {
        setLoadingFeedback(false);
      }

      setState("result");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "识别失败");
    }
  }, [item]);

  const resetState = () => {
    setState("idle");
    setSpokenText("");
    setScore(0);
    setMatchedWords([]);
    setError("");
    setAiFeedback("");
    setShowTip(false);
  };

  const handleNext = () => {
    if (randomMode) {
      const newIndex = Math.floor(Math.random() * filteredItems.length);
      setCurrentIndex(newIndex);
    } else {
      setCurrentIndex((i) => (i + 1) % filteredItems.length);
    }
    resetState();
  };

  const handlePrev = () => {
    if (randomMode) {
      const newIndex = Math.floor(Math.random() * filteredItems.length);
      setCurrentIndex(newIndex);
    } else {
      setCurrentIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
    }
    resetState();
  };

  const handleRandom = () => {
    const newIndex = Math.floor(Math.random() * filteredItems.length);
    setCurrentIndex(newIndex);
    resetState();
  };

  const scoreColor = score >= 80 ? "text-[#6BCB9E]" : score >= 50 ? "text-[#F4A261]" : "text-[#FF6B6B]";
  const scoreEmoji = score >= 80 ? "🎉" : score >= 50 ? "👍" : "💪";

  const difficultyLabels: Record<DifficultyFilter, string> = { all: "全部", easy: "简单", medium: "中等", hard: "困难" };
  const difficultyColors: Record<DifficultyFilter, string> = {
    all: "bg-[#F3F4F6] text-[#6B7280]",
    easy: "bg-[#EEFBF4] text-[#6BCB9E]",
    medium: "bg-[#FFF5EB] text-[#F4A261]",
    hard: "bg-[#FFF0EE] text-[#FF6B6B]",
  };

  // Stats
  const easyCount = filteredItems.filter(i => i.difficulty === "easy").length;
  const medCount = filteredItems.filter(i => i.difficulty === "medium").length;
  const hardCount = filteredItems.filter(i => i.difficulty === "hard").length;

  if (!item) {
    return (
      <div className="px-5 pt-6 text-center">
        <h1 className="text-xl font-bold text-[#2D2D2D] mb-4">发音练习</h1>
        <p className="text-[#9CA3AF]">没有匹配的练习项目，请调整筛选条件。</p>
        <button onClick={() => { setDifficultyFilter("all"); setCategoryFilter("all"); }} className="mt-4 text-[#FF6B6B] font-medium">重置筛选</button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#2D2D2D]">发音练习</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRandomMode(!randomMode); }}
            className={`p-2 rounded-xl transition-colors ${randomMode ? "bg-[#FF6B6B] text-white" : "bg-white text-[#9CA3AF] border border-[#F3E8E2]"}`}
            title={randomMode ? "随机模式开启" : "随机模式关闭"}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-colors ${showFilters ? "bg-[#7C83FD] text-white" : "bg-white text-[#9CA3AF] border border-[#F3E8E2]"}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="bg-white px-3 py-1 rounded-full border border-[#F3E8E2] text-[#9CA3AF]">
          {randomMode ? "🎲 随机" : `${safeIndex + 1} / ${filteredItems.length}`}
        </span>
        <span className="text-[#9CA3AF]">
          共 {filteredItems.length} 词
        </span>
        <span className="text-[#6BCB9E]">简{easyCount}</span>
        <span className="text-[#F4A261]">中{medCount}</span>
        <span className="text-[#FF6B6B]">难{hardCount}</span>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2] space-y-3">
              {/* Difficulty */}
              <div>
                <div className="text-xs text-[#9CA3AF] mb-2 font-medium">难度</div>
                <div className="flex flex-wrap gap-2">
                  {(["all", "easy", "medium", "hard"] as DifficultyFilter[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDifficultyFilter(d); setCurrentIndex(0); resetState(); }}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        difficultyFilter === d
                          ? difficultyColors[d] + " ring-2 ring-offset-1 ring-current"
                          : "bg-[#F9FAFB] text-[#9CA3AF]"
                      }`}
                    >
                      {difficultyLabels[d]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="text-xs text-[#9CA3AF] mb-2 font-medium">分类</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setCategoryFilter("all"); setCurrentIndex(0); resetState(); }}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      categoryFilter === "all"
                        ? "bg-[#F3E8E2] text-[#2D2D2D] ring-2 ring-offset-1 ring-[#F3E8E2]"
                        : "bg-[#F9FAFB] text-[#9CA3AF]"
                    }`}
                  >
                    全部
                  </button>
                  {CATEGORIES.map((cat) => {
                    const count = pronunciationItems.filter(
                      (i) => i.category === cat && (difficultyFilter === "all" || i.difficulty === difficultyFilter)
                    ).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setCategoryFilter(cat); setCurrentIndex(0); resetState(); }}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                          categoryFilter === cat
                            ? "bg-[#FFF0EE] text-[#FF6B6B] ring-2 ring-offset-1 ring-[#FF6B6B]"
                            : "bg-[#F9FAFB] text-[#9CA3AF]"
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Badge */}
      <div className="mb-4">
        <span className="text-xs bg-[#FFF0EE] text-[#FF6B6B] px-3 py-1 rounded-full font-medium">
          {item.category}
        </span>
        <span className={`text-xs ml-2 px-3 py-1 rounded-full font-medium ${
          item.difficulty === "easy" ? "bg-[#EEFBF4] text-[#6BCB9E]" :
          item.difficulty === "medium" ? "bg-[#FFF5EB] text-[#F4A261]" :
          "bg-[#FFF0EE] text-[#FF6B6B]"
        }`}>
          {item.difficulty === "easy" ? "简单" : item.difficulty === "medium" ? "中等" : "困难"}
        </span>
      </div>

      {/* Main Card */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-[#F3E8E2]"
      >
        {/* Word Display */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#2D2D2D] mb-2">{item.word}</h2>
          {/* In random mode, hide phonetic until revealed */}
          {randomMode && !showTip && state !== "result" ? (
            <button
              onClick={() => setShowTip(true)}
              className="text-sm text-[#7C83FD] underline"
            >
              点击显示音标和提示
            </button>
          ) : (
            <>
              <p className="text-lg text-[#9CA3AF] font-mono">{item.phonetic}</p>
              <p className="text-sm text-[#6B7280] mt-1">{item.chinese}</p>
            </>
          )}
        </div>

        {/* Listen Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => handleSpeak(1)}
            className="flex items-center gap-2 bg-[#EEFBF4] text-[#6BCB9E] px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            <Volume2 className="w-4 h-4" /> 听发音
          </button>
          <button
            onClick={() => handleSpeak(0.2)}
            className="flex items-center gap-2 bg-[#FFF5EB] text-[#F4A261] px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            🐢 慢速
          </button>
          {randomMode && (
            <button
              onClick={handleRandom}
              className="flex items-center gap-2 bg-[#F0F4FF] text-[#7C83FD] px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              <Shuffle className="w-4 h-4" /> 随机
            </button>
          )}
        </div>

        {/* Record Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={state === "idle" || state === "result" ? handleListen : undefined}
            disabled={state === "listening" || state === "evaluating"}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              state === "listening"
                ? "bg-[#FF6B6B] shadow-lg shadow-[#FF6B6B]/40"
                : "bg-[#FF6B6B] shadow-md shadow-[#FF6B6B]/30 hover:shadow-lg"
            }`}
          >
            {state === "listening" && (
              <span className="absolute inset-0 rounded-full bg-[#FF6B6B] pulse-ring" />
            )}
            {state === "evaluating" ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-white relative z-10" />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-[#9CA3AF] mb-4">
          {state === "listening" ? "正在听你说..." : state === "evaluating" ? "正在评估..." : "点击麦克风开始跟读"}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-[#FFF0EE] text-[#FF6B6B] text-sm p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {state === "result" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Score */}
              <div className="text-center">
                <span className="text-4xl mr-2">{scoreEmoji}</span>
                <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
                <span className="text-lg text-[#9CA3AF]">/100</span>
              </div>

              {/* Comparison */}
              <div className="bg-[#FFF8F5] rounded-xl p-4">
                <div className="text-xs text-[#9CA3AF] mb-2">你说的：</div>
                <div className="text-sm font-medium text-[#2D2D2D] mb-3">
                  &quot;{spokenText}&quot;
                </div>
                <div className="text-xs text-[#9CA3AF] mb-2">目标：</div>
                <div className="flex flex-wrap gap-1">
                  {matchedWords.map((w, i) => (
                    <span
                      key={i}
                      className={`text-sm font-medium px-1.5 py-0.5 rounded ${
                        w.matched
                          ? "bg-[#EEFBF4] text-[#6BCB9E]"
                          : "bg-[#FFF0EE] text-[#FF6B6B]"
                      }`}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Feedback */}
              {(loadingFeedback || aiFeedback) && (
                <div className="bg-[#F0F4FF] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs text-[#7C83FD] font-medium mb-2">
                    <Lightbulb className="w-3.5 h-3.5" /> AI 发音建议
                  </div>
                  {loadingFeedback ? (
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <Loader2 className="w-3 h-3 animate-spin" /> 正在分析...
                    </div>
                  ) : (
                    <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">{aiFeedback}</p>
                  )}
                </div>
              )}

              {/* Tip */}
              <div className="bg-[#FFF5EB] rounded-xl p-4">
                <div className="text-xs text-[#F4A261] font-medium mb-1">💡 发音技巧</div>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.tip}</p>
              </div>

              {/* Retry */}
              <button
                onClick={resetState}
                className="w-full flex items-center justify-center gap-2 bg-white border border-[#F3E8E2] text-[#6B7280] py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4" /> 再试一次
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-6 mb-8">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 text-sm text-[#9CA3AF] active:text-[#6B7280]"
        >
          <ChevronLeft className="w-4 h-4" /> {randomMode ? "随机上一个" : "上一个"}
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 text-sm text-[#FF6B6B] font-medium active:text-[#E55555]"
        >
          {randomMode ? "随机下一个" : "下一个"} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
