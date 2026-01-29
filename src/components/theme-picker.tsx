"use client";

import { useTheme } from "@/lib/theme-context";

export default function ThemePicker() {
  const { themeId, setThemeId, themes, markThemeChosen } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setThemeId(t.id);
            markThemeChosen();
          }}
          className={`p-3 rounded-xl border-2 transition-all text-center ${
            themeId === t.id
              ? "border-[var(--color-primary)] scale-105 shadow-md"
              : "border-transparent bg-white/60"
          }`}
          style={themeId === t.id ? { borderColor: "var(--color-primary)" } : {}}
        >
          <div className="text-2xl mb-1">{t.emoji}</div>
          <div className="text-xs font-medium">{t.name}</div>
          <div className="text-[10px] text-[#9CA3AF]">{t.nameZh}</div>
        </button>
      ))}
    </div>
  );
}
