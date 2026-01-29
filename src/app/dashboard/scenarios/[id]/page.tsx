"use client";

import { useState, useRef, useEffect, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Mic, Loader2, Lightbulb } from "lucide-react";
import Link from "next/link";
import { scenarios } from "@/data/scenarios";
import { recordScenario } from "@/lib/progress-store";
import { startListening } from "@/lib/speech";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const scenario = scenarios.find((s) => s.id === id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scenario) {
      setMessages([{ role: "assistant", content: scenario.starterMessage }]);
    }
  }, [scenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!scenario) {
    return (
      <div className="px-5 pt-6 text-center">
        <p className="text-[#9CA3AF]">场景未找到</p>
        <Link href="/dashboard/scenarios" className="text-[#FF6B6B] text-sm mt-2 inline-block">返回</Link>
      </div>
    );
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: scenario.systemPrompt,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantContent += parsed.content;
              setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
            }
          } catch { /* skip */ }
        }
      }

      recordScenario(scenario.id);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ 网络错误，请重试。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    try {
      const result = await startListening();
      setInput(result.transcript);
    } catch (err) {
      // Silently fail
      console.error(err);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF8F5]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-[#F3E8E2]">
        <Link href="/dashboard/scenarios" className="text-[#9CA3AF]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-[#2D2D2D]">
            {scenario.icon} {scenario.title}
          </h1>
          <p className="text-[10px] text-[#9CA3AF]">
            你：{scenario.userRole} · AI：{scenario.aiRole}
          </p>
        </div>
        <button
          onClick={() => setShowPhrases(!showPhrases)}
          className={`p-2 rounded-lg transition-colors ${showPhrases ? "bg-[#FFF5EB] text-[#F4A261]" : "text-[#9CA3AF]"}`}
        >
          <Lightbulb className="w-4 h-4" />
        </button>
      </div>

      {/* Key Phrases Panel */}
      {showPhrases && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-[#FFF5EB] px-5 py-3 border-b border-[#F3E8E2]"
        >
          <p className="text-xs text-[#F4A261] font-medium mb-2">💡 参考短语（可以直接用）</p>
          <div className="flex flex-wrap gap-1.5">
            {scenario.keyPhrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => setInput(phrase)}
                className="text-xs bg-white text-[#6B7280] px-2.5 py-1.5 rounded-lg border border-[#F3E8E2] active:bg-[#FFF0EE] transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-32">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#FF6B6B] text-white rounded-br-md"
                  : "bg-white text-[#2D2D2D] border border-[#F3E8E2] rounded-bl-md"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#F3E8E2] rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 text-[#9CA3AF] animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F3E8E2] px-4 py-3 z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            disabled={isListening}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? "bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/30"
                : "bg-[#FFF0EE] text-[#FF6B6B]"
            }`}
          >
            {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="用英语回复..."
            className="flex-1 bg-[#FFF8F5] border border-[#F3E8E2] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF6B6B] transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-[#FF6B6B] text-white rounded-xl disabled:opacity-50 active:scale-90 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
