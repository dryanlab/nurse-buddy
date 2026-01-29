"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Check, RotateCcw, ChevronLeft, ChevronRight, Filter, Brain, Shuffle } from "lucide-react";
import { vocabulary, vocabCategories, type VocabWord } from "@/data/vocabulary";
import { speak } from "@/lib/speech";
import { getProgress, toggleVocabMastered } from "@/lib/progress-store";
import { addCard, hasCard } from "@/lib/srs-engine";

export default function VocabularyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [inSrs, setInSrs] = useState<Set<string>>(new Set());

  const [shuffledWords, setShuffledWords] = useState<VocabWord[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const baseWords = selectedCategory === "all"
    ? vocabulary
    : vocabulary.filter((w) => w.category === selectedCategory);

  const filteredWords = isShuffled ? shuffledWords : baseWords;

  const handleShuffle = () => {
    const arr = [...baseWords];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledWords(arr);
    setIsShuffled(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const word: VocabWord | undefined = filteredWords[currentIndex];

  useEffect(() => {
    const progress = getProgress();
    setMastered(new Set(progress.vocabMastered));
    // Check which words are in SRS
    const srsSet = new Set<string>();
    for (const w of vocabulary) {
      if (hasCard(w.id)) srsSet.add(w.id);
    }
    setInSrs(srsSet);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  }, [selectedCategory]);

  const handleSpeak = useCallback(async () => {
    if (word) {
      try { await speak(word.word); } catch { /* ignore */ }
    }
  }, [word]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleMastered = () => {
    if (!word) return;
    toggleVocabMastered(word.id);
    const newMastered = new Set(mastered);
    if (newMastered.has(word.id)) {
      newMastered.delete(word.id);
    } else {
      newMastered.add(word.id);
    }
    setMastered(newMastered);
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % filteredWords.length);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex((i) => (i - 1 + filteredWords.length) % filteredWords.length);
    setIsFlipped(false);
  };

  if (!word) {
    return (
      <div className="px-5 pt-6 text-center text-[#9CA3AF]">
        暂无词汇
      </div>
    );
  }

  const isMastered = mastered.has(word.id);

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#2D2D2D]">词汇卡片</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            已掌握 {mastered.size} / {vocabulary.length} 词
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShuffle}
            className={`p-2 rounded-lg transition-colors ${isShuffled ? "bg-[#FFF0EE] text-[#FF6B6B]" : "text-[#9CA3AF] hover:text-[#FF6B6B]"}`}
            title="Shuffle · 随机排列"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2 rounded-lg transition-colors ${showFilter ? "bg-[#FFF0EE] text-[#FF6B6B]" : "text-[#9CA3AF]"}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  selectedCategory === "all" ? "bg-[#FF6B6B] text-white" : "bg-white text-[#6B7280] border border-[#F3E8E2]"
                }`}
              >
                全部 ({vocabulary.length})
              </button>
              {vocabCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    selectedCategory === cat.id ? "bg-[#FF6B6B] text-white" : "bg-white text-[#6B7280] border border-[#F3E8E2]"
                  }`}
                >
                  {cat.icon} {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-[#F3E8E2] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6B6B] rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / filteredWords.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#9CA3AF]">{currentIndex + 1}/{filteredWords.length}</span>
      </div>

      {/* Flip Card */}
      <div className="flip-card cursor-pointer" onClick={handleFlip}>
        <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
          <div className="flip-card-inner relative" style={{ minHeight: 280 }}>
            {/* Front */}
            <div className="flip-card-front absolute inset-0 bg-white rounded-3xl p-8 shadow-sm border border-[#F3E8E2] flex flex-col items-center justify-center">
              {isMastered && (
                <span className="absolute top-4 right-4 text-xs bg-[#EEFBF4] text-[#6BCB9E] px-2 py-0.5 rounded-full">
                  ✅ 已掌握
                </span>
              )}
              <h2 className="text-3xl font-bold text-[#2D2D2D] mb-3">{word.word}</h2>
              <p className="text-lg text-[#9CA3AF] font-mono mb-4">{word.phonetic}</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(); }}
                className="flex items-center gap-2 bg-[#EEFBF4] text-[#6BCB9E] px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                <Volume2 className="w-4 h-4" /> 听发音
              </button>
              <p className="text-xs text-[#9CA3AF] mt-6">点击翻转查看释义 →</p>
            </div>

            {/* Back */}
            <div className="flip-card-back absolute inset-0 bg-gradient-to-b from-[#FFF8F5] to-white rounded-3xl p-8 shadow-sm border border-[#F3E8E2] flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold text-[#FF6B6B] mb-2">{word.chinese}</h2>
              <p className="text-sm text-[#6B7280] mb-4">{word.word} {word.phonetic}</p>
              <div className="bg-white rounded-xl p-4 w-full border border-[#F3E8E2]">
                <p className="text-xs text-[#9CA3AF] mb-1">例句：</p>
                <p className="text-sm text-[#2D2D2D] leading-relaxed mb-2">{word.example}</p>
                <p className="text-sm text-[#6B7280] leading-relaxed">{word.exampleChinese}</p>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-4">点击翻回正面 →</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        <button
          onClick={handleMastered}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-all ${
            isMastered
              ? "bg-[#6BCB9E] text-white"
              : "bg-[#EEFBF4] text-[#6BCB9E] border border-[#6BCB9E]/20"
          }`}
        >
          <Check className="w-4 h-4" /> {isMastered ? "已掌握" : "标记掌握"}
        </button>
        <button
          onClick={() => {
            addCard(word.id, "vocab");
            setInSrs((s) => new Set([...s, word.id]));
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-all ${
            inSrs.has(word.id)
              ? "bg-[#7C3AED] text-white"
              : "bg-[#F3E8FF] text-[#7C3AED] border border-[#7C3AED]/20"
          }`}
        >
          <Brain className="w-4 h-4" /> {inSrs.has(word.id) ? "已加入复习" : "加入复习"}
        </button>
        <button
          onClick={() => { toggleVocabMastered(word.id); handleNext(); }}
          className="flex items-center gap-2 bg-[#FFF5EB] text-[#F4A261] px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          <RotateCcw className="w-4 h-4" /> 需复习
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6 mb-8">
        <button onClick={handlePrev} className="flex items-center gap-1 text-sm text-[#9CA3AF]">
          <ChevronLeft className="w-4 h-4" /> 上一个
        </button>
        <button onClick={handleNext} className="flex items-center gap-1 text-sm text-[#FF6B6B] font-medium">
          下一个 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
