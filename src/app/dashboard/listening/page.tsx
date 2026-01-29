"use client";

import { useState } from "react";
import { ChevronLeft, Volume2, CheckCircle, XCircle, Play, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { listeningExercises, type ListeningExercise } from "@/data/listening-exercises";

const scenarioLabels: Record<string, { label: string; icon: string }> = {
  handoff: { label: "护士交班", icon: "🔄" },
  "doctor-orders": { label: "医嘱", icon: "📋" },
  "patient-symptoms": { label: "患者症状", icon: "🤒" },
  "phone-call": { label: "电话", icon: "📞" },
  announcement: { label: "广播", icon: "📢" },
};

const difficultyColors = {
  basic: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function ListeningPage() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<ListeningExercise | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? listeningExercises : listeningExercises.filter(e => e.scenario === filter);

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const handleAnswer = (qIdx: number, aIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleSubmit = () => setSubmitted(true);

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setShowTranscript(false);
  };

  const handleBack = () => {
    if (selectedExercise) {
      setSelectedExercise(null);
      handleReset();
    } else {
      router.back();
    }
  };

  const score = selectedExercise
    ? selectedExercise.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  if (selectedExercise) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBack} className="p-2 rounded-full hover:bg-[#F3E8E2]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#2D2D2D]">{selectedExercise.title}</h1>
            <p className="text-xs text-[#9CA3AF]">{selectedExercise.titleChinese}</p>
          </div>
        </div>

        {/* Play button */}
        <div className="bg-gradient-to-br from-[#FF6B6B] to-[#F4A261] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{scenarioLabels[selectedExercise.scenario]?.icon}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20`}>
              {selectedExercise.difficulty}
            </span>
          </div>
          <p className="text-sm mb-4 opacity-90">听录音，然后回答下面的问题</p>
          <button
            onClick={() => speak(selectedExercise.transcript)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl transition-colors"
          >
            <Play className="w-5 h-5" fill="white" />
            <span className="text-sm font-medium">播放录音</span>
          </button>
        </div>

        {/* Transcript toggle */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full text-left mb-4 bg-white rounded-xl p-4 border border-[#F3E8E2]"
        >
          <span className="text-sm font-medium text-[#2D2D2D]">
            {showTranscript ? "隐藏文本" : "📝 显示文本（提示）"}
          </span>
        </button>

        {showTranscript && (
          <div className="bg-[#FFF5EB] rounded-xl p-4 mb-4 text-sm">
            <p className="text-[#4B5563] leading-relaxed">{selectedExercise.transcript}</p>
            <p className="text-[#9CA3AF] mt-3 leading-relaxed text-xs">{selectedExercise.transcriptChinese}</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {selectedExercise.questions.map((q, qi) => (
            <div key={qi} className="bg-white rounded-xl p-4 border border-[#F3E8E2]">
              <p className="text-sm font-medium text-[#2D2D2D] mb-1">Q{qi + 1}. {q.question}</p>
              <p className="text-xs text-[#9CA3AF] mb-3">{q.questionChinese}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = q.correctIndex === oi;
                  let style = "border-[#F3E8E2] bg-white text-[#4B5563]";
                  if (submitted && isCorrect) style = "border-green-400 bg-green-50 text-green-700";
                  else if (submitted && isSelected && !isCorrect) style = "border-red-400 bg-red-50 text-red-700";
                  else if (isSelected) style = "border-[#FF6B6B] bg-[#FF6B6B]/5 text-[#FF6B6B]";

                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(qi, oi)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${style}`}
                    >
                      <div className="flex items-center gap-2">
                        {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                        {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit / Score */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < selectedExercise.questions.length}
            className="w-full py-3 rounded-xl font-medium text-white bg-[#FF6B6B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交答案
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-xl p-6 border border-[#F3E8E2] mb-4">
              <p className="text-3xl font-bold text-[#FF6B6B]">{score}/{selectedExercise.questions.length}</p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                {score === selectedExercise.questions.length ? "🎉 完美！" : score > 0 ? "👍 继续加油！" : "💪 再试一次！"}
              </p>
            </div>
            <button onClick={handleReset} className="px-6 py-2.5 rounded-xl bg-[#F3E8E2] text-sm font-medium text-[#2D2D2D]">
              重新练习
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#F3E8E2]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#2D2D2D]">听力练习</h1>
          <p className="text-xs text-[#9CA3AF]">Listening Exercises · {listeningExercises.length} exercises</p>
        </div>
      </div>

      {/* Scenario filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setFilter("all")}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${filter === "all" ? "bg-[#FF6B6B] text-white" : "bg-white border border-[#F3E8E2] text-[#6B7280]"}`}
        >全部</button>
        {Object.entries(scenarioLabels).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${filter === key ? "bg-[#FF6B6B] text-white" : "bg-white border border-[#F3E8E2] text-[#6B7280]"}`}
          >{icon} {label}</button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="w-full text-left bg-white rounded-xl p-4 border border-[#F3E8E2] hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{scenarioLabels[ex.scenario]?.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${difficultyColors[ex.difficulty]}`}>
                    {ex.difficulty}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF]">{scenarioLabels[ex.scenario]?.label}</span>
                </div>
                <p className="font-medium text-sm text-[#2D2D2D] truncate">{ex.title}</p>
                <p className="text-xs text-[#9CA3AF] truncate">{ex.titleChinese}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
