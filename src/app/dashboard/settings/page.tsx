"use client";

import ThemePicker from "@/components/theme-picker";

export default function SettingsPage() {
  const resetAssessment = () => {
    localStorage.removeItem("english-buddy-assessed");
    localStorage.removeItem("english-buddy-level");
    window.location.href = "/dashboard";
  };

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-6">设置 ⚙️</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[#6B7280] mb-3">主题 / Theme</h2>
        <ThemePicker />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[#6B7280] mb-3">水平测试</h2>
        <button
          onClick={resetAssessment}
          className="bg-white border border-[#F3E8E2] rounded-xl px-5 py-3 text-sm text-[#2D2D2D] active:scale-95 transition-transform"
        >
          重新测试英语水平 🔄
        </button>
      </section>
    </div>
  );
}
