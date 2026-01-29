"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { getUser, registerUser, signUp, getAvatarOptions } from "@/lib/auth-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const GRADES = [
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "9", label: "Grade 9" },
  { value: "10", label: "Grade 10" },
];

export default function RegisterPage() {
  const router = useRouter();
  const avatars = getAvatarOptions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("6");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) router.replace("/dashboard");
  }, [router]);

  async function handleRegister() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your name! 请输入名字！"); return; }
    if (trimmed.length < 2) { setError("Name must be at least 2 characters. 名字至少2个字符。"); return; }

    if (isSupabaseConfigured) {
      if (!email) { setError("Please enter your email. 请输入邮箱。"); return; }
      if (!password || password.length < 6) { setError("Password must be at least 6 characters. 密码至少6位。"); return; }
    }

    setLoading(true);
    setError("");
    try {
      if (isSupabaseConfigured) {
        const { error: err } = await signUp(email, password, trimmed, grade, avatar);
        if (err) { setError(err); return; }
      } else {
        registerUser(trimmed, grade, avatar);
      }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#FFF8F5] to-[#FFF0EB]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-7xl mb-4"
          >
            🩺
          </motion.div>
          <h1 className="text-3xl font-bold text-[#FF6B6B]">Create Your Profile</h1>
          <p className="text-sm text-[#9CA3AF] mt-2">创建你的学习档案</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white border border-[#F3E8E2] rounded-2xl p-8 shadow-sm space-y-6">
          {/* Google Sign Up */}
          {isSupabaseConfigured && (
            <>
              <GoogleSignInButton mode="signup" />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#F3E8E2]" />
                <span className="text-sm text-[#9CA3AF]">or / 或</span>
                <div className="flex-1 h-px bg-[#F3E8E2]" />
              </div>
            </>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Your Name <span className="text-[#9CA3AF] text-xs">你的名字</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-4 py-3 bg-[#FFF8F5] border border-[#F3E8E2] rounded-xl text-[#2D2D2D] placeholder-[#C4C4C4] focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]/25 transition-colors"
            />
          </div>

          {/* Email & Password */}
          {isSupabaseConfigured && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Email <span className="text-[#9CA3AF] text-xs">邮箱</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-[#FFF8F5] border border-[#F3E8E2] rounded-xl text-[#2D2D2D] placeholder-[#C4C4C4] focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]/25 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Password <span className="text-[#9CA3AF] text-xs">密码（至少6位）</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Create a password..."
                  className="w-full px-4 py-3 bg-[#FFF8F5] border border-[#F3E8E2] rounded-xl text-[#2D2D2D] placeholder-[#C4C4C4] focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]/25 transition-colors"
                />
              </div>
            </>
          )}

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Grade Level <span className="text-[#9CA3AF] text-xs">年级</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <motion.button
                  key={g.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGrade(g.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    grade === g.value
                      ? "bg-[#FF6B6B]/10 border border-[#FF6B6B]/50 text-[#FF6B6B]"
                      : "bg-[#FFF8F5] border border-[#F3E8E2] text-[#9CA3AF] hover:border-[#FF6B6B]/30"
                  }`}
                >
                  {g.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Choose Your Avatar <span className="text-[#9CA3AF] text-xs">选择头像</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((a) => (
                <motion.button
                  key={a}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAvatar(a)}
                  className={`text-3xl p-3 rounded-xl transition-colors ${
                    avatar === a
                      ? "bg-[#FF6B6B]/10 border-2 border-[#FF6B6B]/50 shadow-lg shadow-[#FF6B6B]/10"
                      : "bg-[#FFF8F5] border-2 border-transparent hover:border-[#F3E8E2]"
                  }`}
                >
                  {a}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#FFF8F5] border border-[#F3E8E2] rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">{avatar}</div>
            <div className="font-bold text-lg text-[#2D2D2D]">{name || "????"}</div>
            <div className="text-xs text-[#9CA3AF]">Grade {grade} · 英语学习者</div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 bg-[#FF6B6B] text-white font-bold rounded-xl text-lg hover:bg-[#E55555] transition-all disabled:opacity-50 shadow-lg shadow-[#FF6B6B]/20"
          >
            {loading ? "Creating..." : "🩺 Start Learning! · 开始学习！"}
          </motion.button>

          <div className="text-center">
            <p className="text-sm text-[#9CA3AF]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#FF6B6B] hover:text-[#E55555] font-medium">Sign In</Link>
            </p>
            <p className="text-xs text-[#C4C4C4]">
              已有账号？<Link href="/login" className="text-[#FF6B6B]/70">登录</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
