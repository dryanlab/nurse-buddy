"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { scenarios } from "@/data/scenarios";
import { useEffect, useState } from "react";
import { getProgress } from "@/lib/progress-store";

export default function ScenariosPage() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getProgress().scenariosCompleted);
  }, []);

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-bold text-[#2D2D2D] mb-2">场景对话</h1>
      <p className="text-sm text-[#9CA3AF] mb-6">和 AI 角色扮演，练习真实医疗场景对话</p>

      <div className="space-y-4">
        {scenarios.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={`/dashboard/scenarios/${s.id}`}
              className="block bg-white rounded-2xl p-5 border border-[#F3E8E2] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#2D2D2D]">{s.title}</h3>
                    {completed.includes(s.id) && (
                      <span className="text-xs bg-[#EEFBF4] text-[#6BCB9E] px-2 py-0.5 rounded-full">已练习</span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{s.titleEn}</p>
                  <p className="text-sm text-[#9CA3AF] mt-2 leading-relaxed">{s.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[#9CA3AF]">
                    <span>👤 你扮演：{s.userRole}</span>
                    <span>🤖 AI 扮演：{s.aiRole}</span>
                  </div>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                    s.difficulty === "beginner" ? "bg-[#EEFBF4] text-[#6BCB9E]" :
                    s.difficulty === "intermediate" ? "bg-[#FFF5EB] text-[#F4A261]" :
                    "bg-[#FFF0EE] text-[#FF6B6B]"
                  }`}>
                    {s.difficulty === "beginner" ? "初级" : s.difficulty === "intermediate" ? "中级" : "高级"}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 mb-8 bg-[#F0F4FF] rounded-2xl p-4">
        <p className="text-xs text-[#7C83FD] font-medium mb-1">💡 对话练习小贴士</p>
        <p className="text-sm text-[#6B7280] leading-relaxed">
          AI 会扮演病人或同事，你用英语对话。每次回复后，AI 会在中文括号里给你英语学习反馈。放轻松，大胆说！
        </p>
      </div>
    </div>
  );
}
