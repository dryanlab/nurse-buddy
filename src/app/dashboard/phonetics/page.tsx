"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Search, CheckCircle, BookOpen, Trophy, ArrowLeft, Sparkles, Filter } from "lucide-react";
import { ipaSymbols, consonants, vowels, diphthongs, type IPASymbol } from "@/data/ipa-guide";
import { speak } from "@/lib/speech";
import MouthDiagram from "@/components/MouthDiagram";

type Tab = "consonant" | "vowel" | "diphthong";
type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type Mode = "learn" | "quiz";

interface QuizQuestion {
  symbol: IPASymbol;
  options: string[];
  correctAnswer: string;
  type: "symbol-to-word" | "word-to-symbol";
}

const LEARNED_KEY = "ipa-learned-symbols";

function getLearnedSymbols(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const data = localStorage.getItem(LEARNED_KEY);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLearnedSymbols(set: Set<string>) {
  localStorage.setItem(LEARNED_KEY, JSON.stringify([...set]));
}

export default function PhoneticsPage() {
  const [tab, setTab] = useState<Tab>("consonant");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IPASymbol | null>(null);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>("learn");
  const [showFilters, setShowFilters] = useState(false);

  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    setLearned(getLearnedSymbols());
  }, []);

  const tabData: Record<Tab, IPASymbol[]> = useMemo(
    () => ({ consonant: consonants, vowel: vowels, diphthong: diphthongs }),
    []
  );

  const filtered = useMemo(() => {
    let items = tabData[tab];
    if (difficulty !== "all") items = items.filter((s) => s.difficulty === difficulty);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.nameCn.includes(q) ||
          s.examples.some((e) => e.word.toLowerCase().includes(q))
      );
    }
    return items;
  }, [tab, difficulty, search, tabData]);

  const toggleLearned = useCallback(
    (id: string) => {
      setLearned((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        saveLearnedSymbols(next);
        return next;
      });
    },
    []
  );

  const handleSpeak = useCallback(async (word: string) => {
    try {
      await speak(word);
    } catch {
      // silent
    }
  }, []);

  // Quiz logic
  const generateQuiz = useCallback(() => {
    const pool = ipaSymbols.filter((s) => s.type === tab);
    if (pool.length < 4) return;
    const symbol = pool[Math.floor(Math.random() * pool.length)];
    const isSymbolToWord = Math.random() > 0.5;

    if (isSymbolToWord) {
      const correctWord = symbol.examples[0].word;
      const otherWords = pool
        .filter((s) => s.id !== symbol.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => s.examples[0].word);
      const options = [...otherWords, correctWord].sort(() => Math.random() - 0.5);
      setQuizQuestion({ symbol, options, correctAnswer: correctWord, type: "symbol-to-word" });
    } else {
      const correctSymbolStr = symbol.symbol;
      const otherSymbols = pool
        .filter((s) => s.id !== symbol.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => s.symbol);
      const options = [...otherSymbols, correctSymbolStr].sort(() => Math.random() - 0.5);
      setQuizQuestion({ symbol, options, correctAnswer: correctSymbolStr, type: "word-to-symbol" });
    }
    setQuizAnswer(null);
  }, [tab]);

  const handleQuizAnswer = useCallback(
    (answer: string) => {
      if (!quizQuestion || quizAnswer !== null) return;
      setQuizAnswer(answer);
      setQuizScore((prev) => ({
        correct: prev.correct + (answer === quizQuestion.correctAnswer ? 1 : 0),
        total: prev.total + 1,
      }));
    },
    [quizQuestion, quizAnswer]
  );

  useEffect(() => {
    if (mode === "quiz") generateQuiz();
  }, [mode, tab, generateQuiz]);

  const totalSymbols = ipaSymbols.length;
  const learnedCount = learned.size;
  const progress = totalSymbols > 0 ? Math.round((learnedCount / totalSymbols) * 100) : 0;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "consonant", label: "辅音", count: consonants.length },
    { key: "vowel", label: "元音", count: vowels.length },
    { key: "diphthong", label: "双元音", count: diphthongs.length },
  ];

  const difficultyLabels: Record<DifficultyFilter, string> = { all: "全部", easy: "简单", medium: "中等", hard: "困难" };
  const difficultyColors: Record<DifficultyFilter, string> = {
    all: "bg-[#F3F4F6] text-[#6B7280]",
    easy: "bg-[#EEFBF4] text-[#6BCB9E]",
    medium: "bg-[#FFF5EB] text-[#F4A261]",
    hard: "bg-[#FFF0EE] text-[#FF6B6B]",
  };

  // ── Detail view ──
  if (selected) {
    return (
      <div className="px-5 pt-6 pb-8">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 text-sm text-[#9CA3AF] mb-4 active:text-[#6B7280]"
        >
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Symbol big display */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F3E8E2] text-center">
            <div className="text-5xl font-mono font-bold text-[#FF6B6B] mb-2">{selected.symbol}</div>
            <div className="text-lg font-semibold text-[#2D2D2D]">{selected.nameCn}</div>
            <div className="text-sm text-[#9CA3AF]">{selected.name}</div>
            {/* Listen to this sound */}
            <button
              onClick={() => handleSpeak(selected.soundText || selected.examples[0]?.word || "a")}
              className="mt-3 mx-auto flex items-center gap-2 bg-[#FF6B6B] text-white px-5 py-2.5 rounded-full text-sm font-medium active:scale-95 transition-transform shadow-sm"
            >
              <Volume2 className="w-4 h-4" /> 听这个音
            </button>
            <div className="flex justify-center gap-2 mt-3">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  selected.difficulty === "easy"
                    ? "bg-[#EEFBF4] text-[#6BCB9E]"
                    : selected.difficulty === "medium"
                    ? "bg-[#FFF5EB] text-[#F4A261]"
                    : "bg-[#FFF0EE] text-[#FF6B6B]"
                }`}
              >
                {selected.difficulty === "easy" ? "简单" : selected.difficulty === "medium" ? "中等" : "困难"}
              </span>
              <button
                onClick={() => toggleLearned(selected.id)}
                className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
                  learned.has(selected.id)
                    ? "bg-[#EEFBF4] text-[#6BCB9E]"
                    : "bg-[#F3F4F6] text-[#9CA3AF]"
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                {learned.has(selected.id) ? "已掌握" : "标记掌握"}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2]">
            <div className="text-xs text-[#9CA3AF] font-medium mb-2">📖 发音说明</div>
            <p className="text-sm text-[#4B5563] leading-relaxed">{selected.description}</p>
          </div>

          {/* Mouth position with diagram + step-by-step */}
          <div className="bg-[#F0F4FF] rounded-2xl p-4">
            <div className="text-xs text-[#7C83FD] font-medium mb-3">👄 口型位置</div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* SVG diagram */}
              <div className="flex-shrink-0 bg-white rounded-xl p-2 shadow-sm">
                <MouthDiagram symbolId={selected.id} size={140} />
              </div>
              {/* Step-by-step instructions */}
              <div className="flex-1 space-y-2">
                {selected.mouthPosition.split("。").filter(Boolean).map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#7C83FD] text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                    <p className="text-sm text-[#4B5563] leading-relaxed">{step.trim()}。</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick practice */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleSpeak(selected.soundText || selected.examples[0]?.word || "a")}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white text-[#7C83FD] py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform border border-[#7C83FD]/20"
              >
                <Volume2 className="w-3.5 h-3.5" /> 单独发音
              </button>
              <button
                onClick={() => speak(selected.soundText || selected.examples[0]?.word || "a", 0.25)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white text-[#F4A261] py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform border border-[#F4A261]/20"
              >
                🐢 超慢速
              </button>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2]">
            <div className="text-xs text-[#9CA3AF] font-medium mb-3">🔊 例词</div>
            <div className="space-y-2">
              {selected.examples.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-[#FFF8F5] rounded-xl px-3 py-2.5">
                  <div>
                    <span className="font-semibold text-[#2D2D2D]">{ex.word}</span>
                    <span className="text-[#9CA3AF] font-mono text-sm ml-2">{ex.phonetic}</span>
                    <span className="text-[#6B7280] text-sm ml-2">{ex.chinese}</span>
                  </div>
                  <button
                    onClick={() => handleSpeak(ex.word)}
                    className="p-2 rounded-lg bg-[#EEFBF4] text-[#6BCB9E] active:scale-90 transition-transform"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Common mistakes */}
          <div className="bg-[#FFF0EE] rounded-2xl p-4">
            <div className="text-xs text-[#FF6B6B] font-medium mb-2">⚠️ 中国学生常见错误</div>
            <p className="text-sm text-[#4B5563] leading-relaxed">{selected.commonMistakes}</p>
          </div>

          {/* Memory tip */}
          <div className="bg-[#FFF5EB] rounded-2xl p-4">
            <div className="text-xs text-[#F4A261] font-medium mb-2">💡 记忆技巧</div>
            <p className="text-sm text-[#4B5563] leading-relaxed">{selected.tip}</p>
          </div>

          {/* Similar sounds */}
          {selected.similar && selected.similar.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-[#F3E8E2]">
              <div className="text-xs text-[#9CA3AF] font-medium mb-2">🔄 容易混淆的音</div>
              <div className="flex flex-wrap gap-2">
                {selected.similar.map((s) => {
                  const sym = ipaSymbols.find((x) => x.symbol === s);
                  return (
                    <button
                      key={s}
                      onClick={() => sym && setSelected(sym)}
                      className="bg-[#F0F4FF] text-[#7C83FD] px-3 py-1.5 rounded-full text-sm font-mono font-medium active:scale-95 transition-transform"
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Quiz mode ──
  if (mode === "quiz") {
    return (
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setMode("learn");
              setQuizScore({ correct: 0, total: 0 });
            }}
            className="flex items-center gap-1 text-sm text-[#9CA3AF] active:text-[#6B7280]"
          >
            <ArrowLeft className="w-4 h-4" /> 返回学习
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-[#F4A261]" />
            <span className="text-[#2D2D2D] font-semibold">
              {quizScore.correct}/{quizScore.total}
            </span>
          </div>
        </div>

        {/* Tab selection for quiz category */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key ? "bg-[#FF6B6B] text-white" : "bg-white text-[#9CA3AF] border border-[#F3E8E2]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {quizQuestion && (
          <motion.div
            key={quizQuestion.symbol.id + quizQuestion.type + quizScore.total}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F3E8E2] text-center">
              {quizQuestion.type === "symbol-to-word" ? (
                <>
                  <div className="text-xs text-[#9CA3AF] mb-2">这个音标对应哪个单词？</div>
                  <div className="text-4xl font-mono font-bold text-[#FF6B6B] mb-1">
                    {quizQuestion.symbol.symbol}
                  </div>
                  <div className="text-sm text-[#9CA3AF]">{quizQuestion.symbol.nameCn}</div>
                </>
              ) : (
                <>
                  <div className="text-xs text-[#9CA3AF] mb-2">听这个单词，选择正确的音标</div>
                  <div className="text-3xl font-bold text-[#2D2D2D] mb-2">
                    {quizQuestion.symbol.examples[0].word}
                  </div>
                  <button
                    onClick={() => handleSpeak(quizQuestion.symbol.examples[0].word)}
                    className="inline-flex items-center gap-2 bg-[#EEFBF4] text-[#6BCB9E] px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
                  >
                    <Volume2 className="w-4 h-4" /> 听发音
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {quizQuestion.options.map((opt) => {
                let bg = "bg-white border border-[#F3E8E2]";
                if (quizAnswer !== null) {
                  if (opt === quizQuestion.correctAnswer) bg = "bg-[#EEFBF4] border-2 border-[#6BCB9E]";
                  else if (opt === quizAnswer) bg = "bg-[#FFF0EE] border-2 border-[#FF6B6B]";
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleQuizAnswer(opt)}
                    disabled={quizAnswer !== null}
                    className={`${bg} rounded-2xl p-4 text-center active:scale-95 transition-all ${
                      quizQuestion.type === "word-to-symbol" ? "font-mono text-lg" : "text-base font-medium"
                    } text-[#2D2D2D]`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizAnswer !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div
                  className={`text-center text-sm font-medium ${
                    quizAnswer === quizQuestion.correctAnswer ? "text-[#6BCB9E]" : "text-[#FF6B6B]"
                  }`}
                >
                  {quizAnswer === quizQuestion.correctAnswer ? "🎉 正确！" : "❌ 错误"}
                </div>
                <div className="bg-[#FFF5EB] rounded-xl p-3 text-sm text-[#6B7280]">
                  💡 {quizQuestion.symbol.tip}
                </div>
                <button
                  onClick={generateQuiz}
                  className="w-full bg-[#FF6B6B] text-white py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform"
                >
                  下一题 →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // ── Learn mode (main) ──
  return (
    <div className="px-5 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#2D2D2D]">音标教学</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            已掌握 {learnedCount}/{totalSymbols} ({progress}%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-colors ${
              showFilters ? "bg-[#7C83FD] text-white" : "bg-white text-[#9CA3AF] border border-[#F3E8E2]"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode("quiz")}
            className="flex items-center gap-1.5 bg-[#FF6B6B] text-white px-3 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4" /> 测验
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-3 border border-[#F3E8E2] mb-4">
        <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1.5">
          <span>学习进度</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-[#F3E8E2] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="搜索音标、名称或例词..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF8F5] border border-[#F3E8E2] text-sm text-[#2D2D2D] placeholder:text-[#C4C4C4] outline-none focus:border-[#FF6B6B]"
                />
              </div>
              {/* Difficulty */}
              <div>
                <div className="text-xs text-[#9CA3AF] mb-2 font-medium">难度</div>
                <div className="flex flex-wrap gap-2">
                  {(["all", "easy", "medium", "hard"] as DifficultyFilter[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        difficulty === d
                          ? difficultyColors[d] + " ring-2 ring-offset-1 ring-current"
                          : "bg-[#F9FAFB] text-[#9CA3AF]"
                      }`}
                    >
                      {difficultyLabels[d]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? "bg-[#FF6B6B] text-white shadow-sm" : "bg-white text-[#9CA3AF] border border-[#F3E8E2]"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF] text-sm">没有匹配的音标</div>
      ) : (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {filtered.map((sym) => (
            <motion.button
              key={sym.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelected(sym)}
              className={`relative bg-white rounded-2xl p-3 border transition-colors text-center ${
                learned.has(sym.id) ? "border-[#6BCB9E]/40 bg-[#EEFBF4]/30" : "border-[#F3E8E2]"
              }`}
            >
              {learned.has(sym.id) && (
                <CheckCircle className="absolute top-1.5 right-1.5 w-3 h-3 text-[#6BCB9E]" />
              )}
              <div className="text-lg font-mono font-bold text-[#2D2D2D]">{sym.symbol}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">{sym.nameCn}</div>
              <div
                className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                  sym.difficulty === "easy"
                    ? "bg-[#6BCB9E]"
                    : sym.difficulty === "medium"
                    ? "bg-[#F4A261]"
                    : "bg-[#FF6B6B]"
                }`}
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-[#9CA3AF]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#6BCB9E]" /> 简单
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#F4A261]" /> 中等
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" /> 困难
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-2.5 h-2.5 text-[#6BCB9E]" /> 已掌握
        </span>
      </div>
    </div>
  );
}
