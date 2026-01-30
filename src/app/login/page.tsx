"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { getUser, signIn } from "@/lib/auth-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      const user = getUser();
      if (user) { router.replace("/dashboard"); return; }
      // Check Supabase session (Google OAuth callback)
      if (isSupabaseConfigured) {
        const { getSupabase } = await import("@/lib/supabase");
        const supabase = getSupabase();
        if (supabase) {
          let { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            await new Promise(r => setTimeout(r, 500));
            ({ data: { session } } = await supabase.auth.getSession());
          }
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

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      if (!email || !password) {
        setError("Please enter email and password. 请输入邮箱和密码。");
        return;
      }
      const { error: err } = await signIn(email, password);
      if (err) { setError(err); return; }
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
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🩺</div>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">Nurse Buddy</h1>
          <p className="mt-2 text-[#6B7280]">Welcome back!</p>
          <p className="text-sm text-[#9CA3AF]">欢迎回来！</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#F3E8E2] shadow-sm">
          <h2 className="text-xl font-bold text-[#2D2D2D] mb-1">Sign In</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">登录你的账号</p>

          {isSupabaseConfigured && (
            <div className="mb-6 space-y-4">
              <GoogleSignInButton mode="signin" />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#F3E8E2]" />
                <span className="text-sm text-[#9CA3AF]">or / 或</span>
                <div className="flex-1 h-px bg-[#F3E8E2]" />
              </div>
            </div>
          )}

          <div className="space-y-4">
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
                Password <span className="text-[#9CA3AF] text-xs">密码</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter password..."
                className="w-full px-4 py-3 bg-[#FFF8F5] border border-[#F3E8E2] rounded-xl text-[#2D2D2D] placeholder-[#C4C4C4] focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]/25 transition-colors"
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm">
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-[#FF6B6B] text-white font-bold rounded-xl hover:bg-[#E55555] transition-all disabled:opacity-50 shadow-lg shadow-[#FF6B6B]/20"
            >
              {loading ? "Loading..." : "🩺 Sign In · 登录"}
            </motion.button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#9CA3AF]">
              New here?{" "}
              <Link href="/register" className="text-[#FF6B6B] hover:text-[#E55555] font-medium">
                Create Account
              </Link>
            </p>
            <p className="text-xs text-[#C4C4C4]">
              新用户？<Link href="/register" className="text-[#FF6B6B]/70 hover:text-[#FF6B6B]">注册账号</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
