import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "Nurse Buddy — 护士英语学习伙伴",
  description: "AI 驱动的英语发音练习，专为在美华人护理从业者设计",
  manifest: "/manifest.json",
  openGraph: {
    title: "Nurse Buddy — 护士英语学习伙伴",
    description: "AI 驱动的英语发音练习，专为在美华人护理从业者设计",
    siteName: "Nurse Buddy",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nurse Buddy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF6B6B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
