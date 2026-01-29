"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, MessageCircle, BookOpen, Settings, Home, Drama } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "首页" },
  { href: "/dashboard/pronunciation", icon: Mic, label: "发音" },
  { href: "/dashboard/scenarios", icon: MessageCircle, label: "对话" },
  { href: "/dashboard/conversation", icon: Drama, label: "训练" },
  { href: "/dashboard/vocabulary", icon: BookOpen, label: "词汇" },
  { href: "/dashboard/settings", icon: Settings, label: "设置" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FFF8F5] pb-20">
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
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? "text-[#FF6B6B]" : "text-[#9CA3AF]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
