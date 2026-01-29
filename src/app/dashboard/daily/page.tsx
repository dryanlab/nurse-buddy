"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Volume2, CheckCircle, XCircle, Star, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { allVocabulary, type VocabWord } from "@/data/vocabulary";
import { allPhrases, type MedicalPhrase } from "@/data/phrases";
import { saveProgress, getProgress } from "@/lib/progress-store";
import { earnCoins } from "@/lib/coin-store";

interface DailyQuestion {
  type: "vocab" | "fill-blank" | "pronunciation" | "phrase";
  question: string;
  questionChinese: string;
  options: string[];
  correctIndex: number;
  speakText?: string;
}

function generateDailyQuestions(): DailyQuestion[] {
  const today = new Date().toISOString().slice(0, 10);
  // Use date as seed for consistent daily questions
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i) * (i + 1);

  const seededRandom = (max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * max);
  };

  const shuffled = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = seededRandom(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const vocab = shuffled(allVocabulary);
  const phrases = shuffled(allPhrases);
  const questions: DailyQuestion[] = [];

  // 3 vocab multiple choice
  for (let i = 0; i < 3 && i < vocab.length; i++) {
    const w = vocab[i];
    const wrongOptions = shuffled(allVocabulary.filter(v => v.id !== w.id && v.category === w.category)).slice(0, 3);
    if (wrongOptions.length < 3) {
      wrongOptions.push(...shuffled(allVocabulary.filter(v => v.id !== w.id)).slice(0, 3 - wrongOptions.length));
    }
    const allOpts = shuffled([w, ...wrongOptions.slice(0, 3)]);
    questions.push({
      type: "vocab",
      question: `"${w.word}" 的中文意思是什么？`,
      questionChinese: `What does "${w.word}" mean?`,
      options: allOpts.map(o => o.chinese),
      correctIndex: allOpts.findIndex(o => o.id === w.id),
      speakText: w.word,
    });
  }

  // 3 fill-in-the-blank
  for (let i = 3; i < 6 && i < vocab.length; i++) {
    const w = vocab[i];
    const blank = w.example.replace(new RegExp(w.word, "i"), "______");
    if (blank === w.example) continue;
    const wrongWords = shuffled(allVocabulary.filter(v => v.id !== w.id && v.category === w.category)).slice(0, 3);
    if (wrongWords.length < 3) {
      wrongWords.push(...shuffled(allVocabulary.filter(v => v.id !== w.id)).slice(0, 3 - wrongWords.length));
    }
    const allOpts = shuffled([w, ...wrongWords.slice(0, 3)]);
    questions.push({
      type: "fill-blank",
      question: blank,
      questionChinese: w.exampleChinese,
      options: allOpts.map(o => o.word),
      correctIndex: allOpts.findIndex(o => o.id === w.id),
      speakText: w.example,
    });
  }

  // 2 pronunciation (listen and choose the word)
  for (let i = 6; i < 8 && i < vocab.length; i++) {
    const w = vocab[i];
    const wrongWords = shuffled(allVocabulary.filter(v => v.id !== w.id)).slice(0, 3);
    const allOpts = shuffled([w, ...wrongWords]);
    questions.push({
      type: "pronunciation",
      question: "🔊 听发音，选择正确的单词",
      questionChinese: "Listen and choose the correct word",
      options: allOpts.map(o => o.word),
      correctIndex: allOpts.findIndex(o => o.id === w.id),
      speakText: w.word,
    });
  }

  // 2 phrase questions
  for (let i = 0; i < 2 && i < phrases.length; i++) {
    const p = phrases[i];
    const wrongPhrases = shuffled(allPhrases.filter(ph => ph.id !== p.id)).slice(0, 3);
    const allOpts = shuffled([p, ...wrongPhrases]);
    questions.push({
      type: "phrase",
      question: `"${p.phrase}" 的意思是？`,
      questionChinese: `What does "${p.phrase}" mean?`,
      options: allOpts.map(o => o.chinese),
      correctIndex: allOpts.findIndex(o => o.id === p.id),
      speakText: p.phrase,
    });
  }

  return questions;
}

export default function DailyChallengePage() {
  const router = useRouter();
  const [questions] = useState<DailyQuestion[]>(() => generateDailyQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  const current = questions[currentIndex];
  const totalQuestions = questions.length;

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.85;
    speechSynthesis.speak(u);
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  };

  const score = useMemo(() =>
    questions.filter((q, i) => answers[i] === q.correctIndex).length,
    [questions, answers]
  );

  useEffect(() => {
    if (finished && !rewarded) {
      const xpEarned = score * 10;
      const coinsEarned = score >= 8 ? 30 : score >= 5 ? 15 : 5;
      try {
        saveProgress({ xp: getProgress().xp + xpEarned });
        earnCoins(coinsEarned, "daily-challenge");
      } catch {}
      setRewarded(true);
    }
  }, [finished, rewarded, score]);

  if (finished) {
    const xpEarned = score * 10;
    const coinsEarned = score >= 8 ? 30 : score >= 5 ? 15 : 5;
    return (
      <div className="px-4 py-6">
        <div className="text-center pt-8">
          <div className="text-6xl mb-4">{score >= 8 ? "🏆" : score >= 5 ? "⭐" : "💪"}</div>
          <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">每日挑战完成！</h1>
          <p className="text-4xl font-bold text-[#FF6B6B] mb-2">{score}/{totalQuestions}</p>
          <p className="text-sm text-[#9CA3AF] mb-6">
            {score === totalQuestions ? "完美！你太厉害了！" : score >= 7 ? "表现优秀！" : score >= 5 ? "不错，继续加油！" : "多练习，明天会更好！"}
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-[#FFF5EB] rounded-xl px-6 py-3">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-lg font-bold text-[#FF6B6B]">+{xpEarned}</span>
              </div>
              <p className="text-[10px] text-[#9CA3AF]">经验值</p>
            </div>
            <div className="bg-[#FFF5EB] rounded-xl px-6 py-3">
              <div className="flex items-center gap-1">
                <span className="text-lg">🪙</span>
                <span className="text-lg font-bold text-[#F4A261]">+{coinsEarned}</span>
              </div>
              <p className="text-[10px] text-[#9CA3AF]">金币</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 rounded-xl bg-[#FF6B6B] text-white font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#F3E8E2]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#2D2D2D]">每日挑战</h1>
          <p className="text-xs text-[#9CA3AF]">Daily Challenge</p>
        </div>
        <span className="text-sm font-medium text-[#FF6B6B]">{currentIndex + 1}/{totalQuestions}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#F3E8E2] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question type badge */}
      <div className="mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B6B]/10 text-[#FF6B6B]">
          {current.type === "vocab" ? "📚 词汇" : current.type === "fill-blank" ? "✍️ 填空" : current.type === "pronunciation" ? "🔊 听力" : "💬 短语"}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-6 border border-[#F3E8E2] mb-6">
        <p className="text-base font-medium text-[#2D2D2D] leading-relaxed">{current.question}</p>
        <p className="text-xs text-[#9CA3AF] mt-2">{current.questionChinese}</p>
        {current.speakText && (
          <button
            onClick={() => speak(current.speakText!)}
            className="mt-3 flex items-center gap-1.5 text-sm text-[#FF6B6B]"
          >
            <Volume2 className="w-4 h-4" /> 播放发音
          </button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {current.options.map((opt, idx) => {
          const isSelected = answers[currentIndex] === idx;
          const isCorrect = current.correctIndex === idx;
          let style = "border-[#F3E8E2] bg-white";
          if (showResult && isCorrect) style = "border-green-400 bg-green-50";
          else if (showResult && isSelected && !isCorrect) style = "border-red-400 bg-red-50";
          else if (isSelected) style = "border-[#FF6B6B] bg-[#FF6B6B]/5";

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${style}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${
                  showResult && isCorrect ? "bg-green-500 text-white border-green-500" :
                  showResult && isSelected && !isCorrect ? "bg-red-500 text-white border-red-500" :
                  isSelected ? "bg-[#FF6B6B] text-white border-[#FF6B6B]" :
                  "border-[#E5E7EB] text-[#9CA3AF]"
                }`}>
                  {showResult && isCorrect ? <CheckCircle className="w-4 h-4" /> :
                   showResult && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> :
                   String.fromCharCode(65 + idx)}
                </div>
                <span className="text-[#2D2D2D]">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {showResult && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl font-medium text-white bg-[#FF6B6B]"
        >
          {currentIndex < totalQuestions - 1 ? "下一题" : "查看结果"}
        </button>
      )}
    </div>
  );
}
