"use client";

import { useState, useMemo } from "react";
import { Search, Volume2, ChevronLeft, Shuffle, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { allPhrases, phraseCategories, type MedicalPhrase } from "@/data/phrases";

const difficultyColors = {
  basic: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function PhrasesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return allPhrases.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedDifficulty !== "all" && p.difficulty !== selectedDifficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.phrase.toLowerCase().includes(q) || p.chinese.includes(q);
      }
      return true;
    });
  }, [selectedCategory, selectedDifficulty, search]);

  const handleShuffle = () => {
    if (filtered.length === 0) return;
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setFlippedId(random.id);
    document.getElementById(`phrase-${random.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.85;
    speechSynthesis.speak(u);
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#F3E8E2]">
          <ChevronLeft className="w-5 h-5 text-[#2D2D2D]" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2D2D2D]">医学短语</h1>
          <p className="text-xs text-[#9CA3AF]">Medical Phrases · {allPhrases.length} phrases</p>
        </div>
        <button onClick={handleShuffle} className="p-2 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B]">
          <Shuffle className="w-5 h-5" />
        </button>
        <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-full bg-[#F3E8E2]">
          <Filter className="w-5 h-5 text-[#2D2D2D]" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="搜索短语..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F3E8E2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 space-y-3 bg-white rounded-xl p-4 border border-[#F3E8E2]">
          <div>
            <p className="text-xs font-medium text-[#9CA3AF] mb-2">类型</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCategory === "all" ? "bg-[#FF6B6B] text-white" : "bg-[#F3E8E2] text-[#6B7280]"}`}
              >全部</button>
              {phraseCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCategory === c.id ? "bg-[#FF6B6B] text-white" : "bg-[#F3E8E2] text-[#6B7280]"}`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#9CA3AF] mb-2">难度</p>
            <div className="flex gap-2">
              {["all", "basic", "intermediate", "advanced"].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedDifficulty === d ? "bg-[#FF6B6B] text-white" : "bg-[#F3E8E2] text-[#6B7280]"}`}
                >
                  {d === "all" ? "全部" : d === "basic" ? "初级" : d === "intermediate" ? "中级" : "高级"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs (horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${selectedCategory === "all" ? "bg-[#FF6B6B] text-white" : "bg-white border border-[#F3E8E2] text-[#6B7280]"}`}
        >全部 ({allPhrases.length})</button>
        {phraseCategories.map((c) => {
          const count = allPhrases.filter(p => p.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${selectedCategory === c.id ? "bg-[#FF6B6B] text-white" : "bg-white border border-[#F3E8E2] text-[#6B7280]"}`}
            >{c.icon} {c.name} ({count})</button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-[#9CA3AF] mb-3">{filtered.length} 条短语</p>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((phrase) => {
          const isFlipped = flippedId === phrase.id;
          return (
            <div
              key={phrase.id}
              id={`phrase-${phrase.id}`}
              onClick={() => setFlippedId(isFlipped ? null : phrase.id)}
              className="bg-white rounded-xl p-4 border border-[#F3E8E2] cursor-pointer hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${difficultyColors[phrase.difficulty]}`}>
                      {phrase.difficulty}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {phraseCategories.find(c => c.id === phrase.category)?.name}
                    </span>
                  </div>
                  <p className="font-semibold text-[#2D2D2D] text-sm">{phrase.phrase}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{phrase.chinese}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(phrase.phrase); }}
                  className="p-2 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B] shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {isFlipped && (
                <div className="mt-3 pt-3 border-t border-[#F3E8E2]">
                  <p className="text-sm text-[#4B5563]">{phrase.example}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{phrase.exampleChinese}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(phrase.example); }}
                    className="mt-2 flex items-center gap-1 text-xs text-[#FF6B6B]"
                  >
                    <Volume2 className="w-3 h-3" /> 播放例句
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#9CA3AF] text-sm">没有找到匹配的短语</p>
        </div>
      )}
    </div>
  );
}
