"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  questionZh: string;
  options: { label: string; labelZh: string; value: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "How comfortable are you speaking English?",
    questionZh: "你说英语时感觉如何？",
    options: [
      { label: "Not at all", labelZh: "完全不会", value: 0 },
      { label: "A little", labelZh: "会一点点", value: 1 },
      { label: "Fairly comfortable", labelZh: "还算自如", value: 2 },
      { label: "Very comfortable", labelZh: "非常自如", value: 3 },
    ],
  },
  {
    id: 2,
    question: "Can you understand English medical terms?",
    questionZh: "你能理解英语医学术语吗？",
    options: [
      { label: "No", labelZh: "不能", value: 0 },
      { label: "Some basic ones", labelZh: "一些基本的", value: 1 },
      { label: "Most of them", labelZh: "大部分都能", value: 2 },
    ],
  },
  {
    id: 3,
    question: "How often do you practice English?",
    questionZh: "你多久练一次英语？",
    options: [
      { label: "Rarely", labelZh: "很少", value: 0 },
      { label: "Sometimes", labelZh: "有时候", value: 1 },
      { label: "Daily", labelZh: "每天", value: 2 },
    ],
  },
  {
    id: 4,
    question: "Rate your pronunciation confidence",
    questionZh: "给你的发音信心打分",
    options: [
      { label: "1 — Not confident", labelZh: "1 — 没有信心", value: 1 },
      { label: "2 — Somewhat confident", labelZh: "2 — 有点信心", value: 2 },
      { label: "3 — Confident", labelZh: "3 — 有信心", value: 3 },
    ],
  },
];

function getLevel(score: number): { emoji: string; label: string; labelZh: string } {
  if (score <= 3) return { emoji: "🌱", label: "Starter", labelZh: "入门" };
  if (score <= 7) return { emoji: "🌿", label: "Conversational", labelZh: "日常对话" };
  return { emoji: "🚀", label: "Confident", labelZh: "自信表达" };
}

interface Props {
  onComplete: (level: string) => void;
}

export default function SkillAssessment({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const level = getLevel(totalScore);

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      >
        <div className="text-7xl mb-4">{level.emoji}</div>
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">{level.label}</h2>
        <p className="text-lg text-[#6B7280] mb-6">{level.labelZh}</p>
        <p className="text-sm text-[#9CA3AF] mb-8 max-w-xs">
          我们会根据你的水平定制学习内容，让练习更有效！
        </p>
        <button
          onClick={() => {
            localStorage.setItem("english-buddy-level", level.label.toLowerCase());
            localStorage.setItem("english-buddy-assessed", "true");
            onComplete(level.label.toLowerCase());
          }}
          className="bg-[#FF6B6B] text-white px-8 py-3 rounded-full font-semibold text-lg active:scale-95 transition-transform"
        >
          开始学习 🎉
        </button>
      </motion.div>
    );
  }

  const q = questions[step];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              i <= step ? "bg-[#FF6B6B]" : "bg-[#E5E7EB]"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="w-full max-w-sm"
        >
          <h2 className="text-lg font-bold text-[#2D2D2D] text-center mb-1">{q.question}</h2>
          <p className="text-sm text-[#9CA3AF] text-center mb-6">{q.questionZh}</p>

          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className="w-full text-left bg-white border border-[#F3E8E2] rounded-xl px-5 py-4 active:scale-[0.98] transition-transform hover:border-[#FF6B6B]"
              >
                <div className="font-medium text-[#2D2D2D]">{opt.label}</div>
                <div className="text-xs text-[#9CA3AF]">{opt.labelZh}</div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
