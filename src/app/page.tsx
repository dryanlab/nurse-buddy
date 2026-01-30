"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Mic, MessageCircle, BookOpen, TrendingUp } from "lucide-react";
import { isLoggedIn } from "@/lib/auth-store";

const features = [
  { icon: Mic, title: "发音练习", desc: "AI 分析你的发音，给出精准反馈", color: "text-[#FF6B6B]" },
  { icon: MessageCircle, title: "场景对话", desc: "模拟真实医疗场景，和 AI 角色扮演", color: "text-[#6BCB9E]" },
  { icon: BookOpen, title: "词汇卡片", desc: "200+ 护理专业词汇，卡片式记忆", color: "text-[#F4A261]" },
  { icon: TrendingUp, title: "进度追踪", desc: "记录每天的进步，保持学习动力", color: "text-[#7C83FD]" },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    async function check() {
      if (isLoggedIn()) { router.replace("/dashboard"); return; }
      // Handle OAuth callback that might land on root
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const hasHash = window.location.hash.includes("access_token");
      if (code || hasHash) {
        const { getSupabase } = await import("@/lib/supabase");
        const supabase = getSupabase();
        if (supabase) {
          if (code) {
            try { await supabase.auth.exchangeCodeForSession(code); } catch {}
          }
          if (hasHash) await new Promise(r => setTimeout(r, 500));
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { ensureProfile } = await import("@/lib/auth-store");
            const { hasProfile, needsSetup } = await ensureProfile();
            if (hasProfile) { router.replace("/dashboard"); return; }
            if (needsSetup) { router.replace("/complete-profile"); return; }
          }
        }
      }
    }
    check();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] to-[#FFF0EB]">
      {/* Hero */}
      <div className="max-w-lg mx-auto px-6 pt-16 pb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-6"
        >
          🩺
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-[#2D2D2D] mb-3"
        >
          Nurse Buddy
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-[#6B7280] mb-2"
        >
          护士英语学习伙伴
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-[#9CA3AF] mb-8 leading-relaxed"
        >
          专为在美华人护理从业者设计<br />
          AI 驱动 · 发音纠正 · 医疗场景 · 中文界面
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-[#FF6B6B] text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-[#FF6B6B]/30 hover:bg-[#E55555] active:scale-95 transition-all"
          >
            <Heart className="w-5 h-5" />
            Sign Up · 注册
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#FF6B6B] px-8 py-4 rounded-2xl text-lg font-semibold border border-[#FF6B6B]/30 hover:bg-[#FFF0EE] active:scale-95 transition-all"
          >
            Login · 登录
          </Link>
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-lg mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#F3E8E2]"
            >
              <f.icon className={`w-8 h-8 ${f.color} mb-3`} />
              <h3 className="font-semibold text-[#2D2D2D] mb-1">{f.title}</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs text-[#9CA3AF]">
        <p>用温柔的方式，说自信的英语 💪</p>
      </div>
    </div>
  );
}
