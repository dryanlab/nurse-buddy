"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mic, MessageCircle, BookOpen, Flame, Target, Trophy } from "lucide-react";
import { getProgress, type ProgressData } from "@/lib/progress-store";
import SkillAssessment from "@/components/skill-assessment";

const quickActions = [
  { href: "/dashboard/pronunciation", icon: Mic, label: "练发音", desc: "跟读练习", color: "bg-[#FF6B6B]", lightColor: "bg-[#FFF0EE]" },
  { href: "/dashboard/scenarios", icon: MessageCircle, label: "场景对话", desc: "角色扮演", color: "bg-[#6BCB9E]", lightColor: "bg-[#EEFBF4]" },
  { href: "/dashboard/vocabulary", icon: BookOpen, label: "词汇卡片", desc: "200+ 词汇", color: "bg-[#F4A261]", lightColor: "bg-[#FFF5EB]" },
];

export default function DashboardPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [assessed, setAssessed] = useState(true);

  useEffect(() => {
    setProgress(getProgress());
    setAssessed(localStorage.getItem("english-buddy-assessed") === "true");
  }, []);

  if (!assessed) {
    return <SkillAssessment onComplete={() => setAssessed(true)} />;
  }

  const streak = progress?.streakDays ?? 0;
  const totalPractice = progress?.pronunciationAttempts ?? 0;
  const vocabMastered = progress?.vocabMastered?.length ?? 0;
  const accuracy = totalPractice > 0
    ? Math.round(((progress?.pronunciationCorrect ?? 0) / totalPractice) * 100)
    : 0;

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">你好！👋</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">今天也要加油练习英语哦</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mt-6"
      >
        <div className="bg-white rounded-2xl p-4 text-center border border-[#F3E8E2]">
          <Flame className="w-5 h-5 text-[#FF6B6B] mx-auto mb-1" />
          <div className="text-xl font-bold text-[#2D2D2D]">{streak}</div>
          <div className="text-[10px] text-[#9CA3AF]">连续打卡</div>
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
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
              <div>
                <div className="font-semibold text-[#2D2D2D]">{action.label}</div>
                <div className="text-xs text-[#9CA3AF]">{action.desc}</div>
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
        className="mt-6 bg-gradient-to-r from-[#6BCB9E] to-[#4FB584] rounded-2xl p-5 text-white"
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
