"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Mic, MicOff, Keyboard, Send, Shuffle, RotateCcw, ChevronDown, ChevronUp, Check, AlertTriangle } from "lucide-react";
import { conversationScenarios, categories, difficulties, ConversationScenario } from "@/data/conversation-scenarios";
import { speak } from "@/lib/speech";
import { incrementDailyGoal } from "@/lib/daily-goals";
import { recordScenario } from "@/lib/progress-store";

// ── Types ──

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SentenceReview {
  original: string;
  issues: { type: string; detail: string; suggestion: string }[];
  improved: string;
}

interface ReviewData {
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  summary: string;
  sentenceReviews: SentenceReview[];
  vocabularyUsed: string[];
  missedVocabulary: string[];
  tips: string[];
}

type Phase = "select" | "conversation" | "review";

// ── Helpers ──

const difficultyColors: Record<string, string> = {
  beginner: "#4CAF50",
  intermediate: "#FF9800",
  advanced: "#F44336",
};

const difficultyLabels: Record<string, string> = {
  beginner: "初级",
  intermediate: "中级",
  advanced: "高级",
};

function CircularScore({ score, size = 100, label }: { score: number; size?: number; label: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#4CAF50" : score >= 60 ? "#FF9800" : "#F44336";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "#4CAF50" : score >= 60 ? "#FF9800" : "#F44336";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

// ── Main Component ──

export default function ConversationPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [scenario, setScenario] = useState<ConversationScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [review, setReview] = useState<ReviewData | null>(null);

  // Filters
  const [diffFilter, setDiffFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  // Conversation state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ReturnType<typeof Object> | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Speech Recognition ──
  const hasSpeechRecognition = typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition || (typeof window !== "undefined" && (window as any).webkitSpeechRecognition);

  const startListening = () => {
    setError("");
    setTranscript("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError("语音识别不支持，请使用Chrome浏览器或文字输入");
      setShowTextInput(true);
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let t = "";
      for (let i = 0; i < event.results.length; i++) {
        t += event.results[i][0].transcript;
      }
      setTranscript(t);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        setError(`语音识别错误: ${event.error}`);
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any).stop();
    }
    setIsListening(false);
  };

  // ── AI interaction ──
  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      await speak(text, 0.5);
    } catch { /* ignore */ }
    setIsSpeaking(false);
  };

  const getAiResponse = async (allMessages: Message[]) => {
    setIsAiThinking(true);
    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, messages: allMessages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const aiMsg: Message = { role: "assistant", content: data.response };
      setMessages(prev => [...prev, aiMsg]);
      speakText(data.response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI响应失败");
    }
    setIsAiThinking(false);
  };

  // ── Start scenario ──
  const startScenario = async (s: ConversationScenario) => {
    setScenario(s);
    setMessages([]);
    setReview(null);
    setTranscript("");
    setTextInput("");
    setError("");
    setPhase("conversation");

    // AI speaks first
    setIsAiThinking(true);
    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: s,
          messages: [{ role: "user", content: "(The student just arrived. Start the conversation in character. Say something to begin the interaction.)" }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const aiMsg: Message = { role: "assistant", content: data.response };
      setMessages([aiMsg]);
      speakText(data.response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
      // Fallback: use context-based opener
      const fallback: Message = { role: "assistant", content: "Hello? Is someone there? I've been waiting..." };
      setMessages([fallback]);
    }
    setIsAiThinking(false);
  };

  // ── Send message ──
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setTranscript("");
    setTextInput("");
    setShowTextInput(false);
    await getAiResponse(newMessages);
  };

  // ── End & Review ──
  const endConversation = async () => {
    if (messages.filter(m => m.role === "user").length === 0) {
      setPhase("select");
      return;
    }
    setIsLoadingReview(true);
    setPhase("review");
    try {
      const res = await fetch("/api/conversation-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, messages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReview(data);
      // Track conversation completion
      incrementDailyGoal("conversationDone");
      if (scenario) {
        recordScenario(scenario.id, data.overallScore);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed");
    }
    setIsLoadingReview(false);
  };

  const userTurnCount = messages.filter(m => m.role === "user").length;
  const totalTurns = scenario?.turns || 8;

  // ── Random scenario ──
  const pickRandom = () => {
    const filtered = getFiltered();
    const s = filtered[Math.floor(Math.random() * filtered.length)];
    if (s) startScenario(s);
  };

  const getFiltered = () => {
    return conversationScenarios.filter(s => {
      if (diffFilter !== "all" && s.difficulty !== diffFilter) return false;
      if (catFilter !== "all" && s.category !== catFilter) return false;
      return true;
    });
  };

  // ══════════════════════════════════════════
  // RENDER: Scenario Selection
  // ══════════════════════════════════════════
  if (phase === "select") {
    const filtered = getFiltered();
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-1">🎭 对话训练 Conversation Practice</h1>
        <p className="text-sm text-gray-500 mb-4">选择一个场景开始角色扮演练习</p>

        {/* Filters */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {difficulties.map(d => (
            <button
              key={d.id}
              onClick={() => setDiffFilter(d.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                diffFilter === d.id
                  ? "bg-[#FF6B6B] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {d.labelZh}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                catFilter === c.id
                  ? "bg-[#FF6B6B] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {c.labelZh}
            </button>
          ))}
        </div>

        {/* Random button */}
        <button
          onClick={pickRandom}
          className="w-full mb-4 py-2.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Shuffle className="w-4 h-4" /> 随机场景 Random Scenario
        </button>

        {/* Scenario grid */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="bg-white rounded-xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{s.title}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                      style={{ backgroundColor: difficultyColors[s.difficulty] }}
                    >
                      {difficultyLabels[s.difficulty]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{s.titleZh}</p>
                  <p className="text-xs text-gray-400">
                    🤖 {s.aiRoleZh} vs 👤 {s.studentRoleZh}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">没有匹配的场景</p>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Active Conversation
  // ══════════════════════════════════════════
  if (phase === "conversation" && scenario) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => setPhase("select")} className="text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-lg">{scenario.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-800 truncate">{scenario.title}</h2>
              <p className="text-[10px] text-gray-400">{scenario.titleZh}</p>
            </div>
            <span className="text-xs text-gray-400">{userTurnCount}/{totalTurns}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span>🤖 {scenario.aiRoleZh}</span>
            <span>👤 {scenario.studentRoleZh}</span>
          </div>
        </div>

        {/* Suggested opener */}
        {messages.length <= 1 && (
          <div className="mx-3 mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[10px] text-blue-500 mb-1">💡 建议开场白 Suggested opener:</p>
            <p className="text-xs text-blue-700 italic">&quot;{scenario.suggestedOpener}&quot;</p>
            <p className="text-[10px] text-blue-400 mt-0.5">{scenario.suggestedOpenerZh}</p>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-[#FF6B6B] text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isAiThinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-3 p-2 bg-red-50 rounded-lg text-xs text-red-600">{error}</div>
        )}

        {/* Input area */}
        <div className="bg-white border-t border-gray-100 p-3 pb-4">
          {/* Transcript preview */}
          {transcript && !isListening && (
            <div className="mb-2 p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">识别结果 Recognized:</p>
              <p className="text-sm text-gray-800">{transcript}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => sendMessage(transcript)}
                  className="flex-1 py-1.5 bg-[#FF6B6B] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Send className="w-3 h-3" /> 发送 Send
                </button>
                <button
                  onClick={() => { setTranscript(""); startListening(); }}
                  className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> 重录
                </button>
              </div>
            </div>
          )}

          {/* Text input fallback */}
          {showTextInput && !transcript && (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(textInput)}
                placeholder="Type your response in English..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B6B]"
              />
              <button
                onClick={() => sendMessage(textInput)}
                disabled={!textInput.trim()}
                className="px-3 py-2 bg-[#FF6B6B] text-white rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Text input toggle */}
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`p-2 rounded-full ${showTextInput ? "bg-gray-200" : "bg-gray-100"} text-gray-500`}
            >
              <Keyboard className="w-5 h-5" />
            </button>

            {/* Mic button */}
            {isListening ? (
              <button
                onClick={stopListening}
                className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-pulse"
              >
                <MicOff className="w-7 h-7" />
              </button>
            ) : (
              <button
                onClick={startListening}
                disabled={isAiThinking || isSpeaking}
                className="w-16 h-16 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center shadow-lg disabled:opacity-50 hover:bg-[#FF5252] transition-colors"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}

            {/* End conversation */}
            <button
              onClick={endConversation}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
            >
              结束
            </button>
          </div>

          {isListening && (
            <p className="text-center text-xs text-red-500 mt-2 animate-pulse">
              🎤 正在听... Listening...
            </p>
          )}
          {isSpeaking && (
            <p className="text-center text-xs text-blue-500 mt-2">
              🔊 AI正在说话... Speaking...
            </p>
          )}

          {!hasSpeechRecognition && (
            <p className="text-center text-[10px] text-amber-500 mt-2">
              ⚠️ 语音识别需要Chrome浏览器。请使用键盘输入。
            </p>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Review
  // ══════════════════════════════════════════
  if (phase === "review") {
    if (isLoadingReview) {
      return (
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">正在分析你的对话...</p>
          <p className="text-gray-400 text-xs">Analyzing your conversation...</p>
        </div>
      );
    }

    if (!review) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-4">{error || "Review failed"}</p>
          <button onClick={() => setPhase("select")} className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg">
            返回 Back
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setPhase("select")} className="text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">📊 对话评估 Review</h1>
        </div>

        {/* Overall score */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 flex flex-col items-center">
          <div className="relative">
            <CircularScore score={review.overallScore} size={110} label="" />
          </div>
          <p className="text-sm font-bold text-gray-800 mt-2">总分 Overall Score</p>
        </div>

        {/* Sub-scores */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 space-y-3">
          <ScoreBar score={review.fluencyScore} label="流利度" />
          <ScoreBar score={review.grammarScore} label="语法" />
          <ScoreBar score={review.vocabularyScore} label="词汇" />
          <ScoreBar score={review.pronunciationScore} label="发音" />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-2">📝 总结 Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{review.summary}</p>
        </div>

        {/* Sentence reviews */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">🔍 逐句分析 Sentence Review</h3>
          <div className="space-y-3">
            {review.sentenceReviews.map((sr, i) => (
              <SentenceReviewCard key={i} review={sr} index={i} />
            ))}
          </div>
        </div>

        {/* Vocabulary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-2">📚 词汇 Vocabulary</h3>
          {review.vocabularyUsed.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-green-600 font-medium mb-1">✅ 正确使用 Used correctly:</p>
              <div className="flex flex-wrap gap-1">
                {review.vocabularyUsed.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs">{v}</span>
                ))}
              </div>
            </div>
          )}
          {review.missedVocabulary.length > 0 && (
            <div>
              <p className="text-xs text-amber-600 font-medium mb-1">💡 可以使用 Could have used:</p>
              <div className="flex flex-wrap gap-1">
                {review.missedVocabulary.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs">{v}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-2">💡 改进建议 Tips</h3>
          <ul className="space-y-1.5">
            {review.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-[#FF6B6B]">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => scenario && startScenario(scenario)}
            className="flex-1 py-2.5 bg-white border border-[#FF6B6B] text-[#FF6B6B] rounded-xl font-medium text-sm"
          >
            🔄 再练一次
          </button>
          <button
            onClick={() => setPhase("select")}
            className="flex-1 py-2.5 bg-[#FF6B6B] text-white rounded-xl font-medium text-sm"
          >
            🎭 换一个场景
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Sentence Review Card ──

function SentenceReviewCard({ review, index }: { review: SentenceReview; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasIssues = review.issues.length > 0;

  return (
    <div className={`rounded-lg border p-2.5 ${hasIssues ? "border-amber-200 bg-amber-50/50" : "border-green-200 bg-green-50/50"}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start gap-2 text-left">
        {hasIssues ? (
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-800">{review.original}</p>
        </div>
        {hasIssues && (
          expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {expanded && hasIssues && (
        <div className="mt-2 pl-6 space-y-2">
          {review.issues.map((issue, j) => (
            <div key={j} className="text-xs">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${
                issue.type === "grammar" ? "bg-purple-400" :
                issue.type === "vocabulary" ? "bg-blue-400" :
                issue.type === "pronunciation" ? "bg-orange-400" :
                "bg-teal-400"
              }`}>
                {issue.type}
              </span>
              <p className="text-gray-600 mt-1">{issue.detail}</p>
              {issue.suggestion && (
                <p className="text-green-700 mt-0.5">→ {issue.suggestion}</p>
              )}
            </div>
          ))}
          {review.improved !== review.original && (
            <div className="text-xs border-t border-amber-200 pt-1.5 mt-1.5">
              <span className="text-gray-500">更好的表达: </span>
              <span className="text-green-700 font-medium">{review.improved}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
