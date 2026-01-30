"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      if (!supabase) { router.replace("/login"); return; }

      // Wait for Supabase to process the hash fragment (#access_token=...)
      for (let i = 0; i < 20; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session established! Check if profile exists
          const { ensureProfile } = await import("@/lib/auth-store");
          const { hasProfile, needsSetup } = await ensureProfile();
          if (hasProfile) {
            router.replace("/dashboard");
          } else if (needsSetup) {
            router.replace("/complete-profile");
          } else {
            router.replace("/dashboard");
          }
          return;
        }
        await new Promise(r => setTimeout(r, 300));
      }
      // Timeout - no session established
      router.replace("/login");
    }
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF8F5] to-[#FFF0EB]">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🩺</div>
        <p className="text-[#6B7280]">Signing you in... 正在登录...</p>
      </div>
    </div>
  );
}
