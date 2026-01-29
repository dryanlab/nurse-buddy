"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAvatarOptions, completeGoogleProfile, ensureProfile } from "@/lib/auth-store";

const GRADES = [
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "9", label: "Grade 9" },
  { value: "10", label: "Grade 10" },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const avatars = getAvatarOptions();
  const [grade, setGrade] = useState("6");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureProfile().then(({ hasProfile }) => {
      if (hasProfile) router.replace("/dashboard");
    });
  }, [router]);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const { error: err } = await completeGoogleProfile(grade, avatar);
    if (err) { setError(err); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#FFF8F5] to-[#FFF0EB]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🩺</div>
          <h1 className="text-3xl font-bold text-[#FF6B6B]">Complete Your Profile</h1>
          <p className="text-sm text-[#9CA3AF] mt-2">完善你的学习档案</p>
        </div>

        <div className="bg-white border border-[#F3E8E2] rounded-2xl p-8 shadow-sm space-y-6">
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

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-[#FF6B6B] text-white font-bold rounded-xl text-lg hover:bg-[#E55555] transition-all disabled:opacity-50 shadow-lg shadow-[#FF6B6B]/20"
          >
            {loading ? "Saving..." : "🩺 Start Learning! · 开始学习！"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
