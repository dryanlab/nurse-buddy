"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Mic, MessageCircle, BookOpen, Settings, Home, ShoppingBag, Trophy, Brain } from "lucide-react";
import { getUser, isLoggedIn, type UserProfile } from "@/lib/auth-store";
import { getProgress, getLevelInfo } from "@/lib/progress-store";
import { getCoinState } from "@/lib/coin-store";

const navItems = [
  { href: "/dashboard", icon: Home, label: "首页" },
  { href: "/dashboard/review", icon: Brain, label: "复习" },
  { href: "/dashboard/pronunciation", icon: Mic, label: "发音" },
  { href: "/dashboard/conversation", icon: MessageCircle, label: "对话" },
  { href: "/dashboard/vocabulary", icon: BookOpen, label: "词汇" },
  { href: "/dashboard/shop", icon: ShoppingBag, label: "商店" },
  { href: "/dashboard/achievements", icon: Trophy, label: "成就" },
  { href: "/dashboard/settings", icon: Settings, label: "设置" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [levelInfo, setLevelInfo] = useState<ReturnType<typeof getLevelInfo> | null>(null);
  const [coins, setCoins] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      // First check localStorage (fast)
      if (isLoggedIn()) {
        const u = getUser();
        setUser(u);
        const p = getProgress();
        setLevelInfo(getLevelInfo(p.xp));
        setCoins(getCoinState().coins);
        setReady(true);
        return;
      }
      // Then check Supabase session (for Google OAuth callback)
      const { getSessionUser, ensureProfile } = await import("@/lib/auth-store");
      const sessionUser = await getSessionUser();
      if (sessionUser) {
        setUser(sessionUser);
        const p = getProgress();
        setLevelInfo(getLevelInfo(p.xp));
        setCoins(getCoinState().coins);
        setReady(true);
        return;
      }
      // Check if we need profile setup (Google OAuth first time)
      const { needsSetup } = await ensureProfile();
      if (needsSetup) {
        router.replace("/complete-profile");
        return;
      }
      // Not logged in at all
      router.replace("/login");
    }
    init();
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#FFF8F5] pb-20">
      {/* User Info Bar */}
      {user && levelInfo && (
        <div className="bg-white border-b border-[#F3E8E2] px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            {/* Avatar */}
            <div className="text-2xl">{user.avatar}</div>

            {/* Name + Level */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#2D2D2D] truncate">{user.name}</span>
                <span className="text-[10px] bg-[#FF6B6B]/10 text-[#FF6B6B] px-2 py-0.5 rounded-full font-medium">
                  Lv.{levelInfo.level}
                </span>
              </div>
              {/* XP Bar */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-[#F3E8E2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F4A261] rounded-full transition-all"
                    style={{ width: `${levelInfo.progressToNext * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-[#9CA3AF] whitespace-nowrap">
                  {getProgress().xp} XP
                </span>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1 bg-[#FFF5EB] px-2 py-1 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold text-[#F4A261]">{coins}</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-lg mx-auto">{children}</main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3E8E2] z-50">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive ? "text-[#FF6B6B]" : "text-[#9CA3AF]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
