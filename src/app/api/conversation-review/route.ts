import { NextRequest } from "next/server";
import { getProvider } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  const { scenario, messages } = await req.json();

  const systemPrompt = `You are an English language teacher specializing in medical English for nursing students.

Analyze this role-play conversation between a nursing student (playing: ${scenario.studentRole}) and an AI (playing: ${scenario.aiRole}).

Scenario: ${scenario.title} - ${scenario.context}
Key vocabulary expected: ${scenario.keyVocabulary.join(", ")}

IMPORTANT: The student's text comes from SPEECH RECOGNITION (spoken language converted to text). Therefore:
- Do NOT penalize missing punctuation, capitalization, or formatting — these are artifacts of speech-to-text, not student errors
- Focus ONLY on: grammar structure, word choice, vocabulary usage, sentence construction, medical terminology accuracy, and naturalness of expression
- For "improved" versions, you may add punctuation for readability, but do NOT list missing punctuation as an "issue"
- Evaluate as if you were listening to the student speak, not reading their writing

Provide a detailed review in this EXACT JSON format (no markdown, just raw JSON):
{
  "overallScore": 85,
  "fluencyScore": 80,
  "grammarScore": 90,
  "vocabularyScore": 85,
  "pronunciationScore": 80,
  "summary": "Overall feedback. First in English, then in Chinese.",
  "sentenceReviews": [
    {
      "original": "what student said",
      "issues": [
        { "type": "grammar|vocabulary|expression", "detail": "explanation in Chinese", "suggestion": "better way to say it" }
      ],
      "improved": "polished version (may add punctuation for readability but this is NOT an issue)"
    }
  ],
  "vocabularyUsed": ["medical terms student used correctly"],
  "missedVocabulary": ["key terms they could have used but didn't"],
  "tips": ["2-3 actionable improvement tips in Chinese, focused on spoken English skills"]
}

Issue types should ONLY be: "grammar" (sentence structure errors), "vocabulary" (wrong word choice or missing medical terms), "expression" (unnatural phrasing that a native speaker wouldn't say). Do NOT include punctuation or capitalization issues.

Be encouraging but honest. Score fairly. If the student communicated effectively despite imperfect grammar, acknowledge that. Provide 2-3 tips in Chinese focused on improving spoken English skills.`;

  const transcript = messages
    .map((m: { role: string; content: string }) =>
      `${m.role === "user" ? "Student" : "AI"}: ${m.content}`
    )
    .join("\n");

  const provider = getProvider();

  if (!provider) {
    // Mock review
    const studentMessages = messages.filter((m: { role: string }) => m.role === "user");
    return Response.json({
      overallScore: 78,
      fluencyScore: 75,
      grammarScore: 80,
      vocabularyScore: 72,
      pronunciationScore: 76,
      summary: "Good effort! You communicated the key information clearly. Your grammar was mostly correct, and you maintained a professional tone. 做得不错！你清楚地传达了关键信息。语法基本正确，保持了专业的语气。",
      sentenceReviews: studentMessages.map((m: { content: string }) => ({
        original: m.content,
        issues: [],
        improved: m.content,
      })),
      vocabularyUsed: scenario.keyVocabulary.slice(0, 3),
      missedVocabulary: scenario.keyVocabulary.slice(3, 6),
      tips: [
        "多使用专业医学术语，这会让你的表达更准确",
        "注意句子的完整性，避免使用碎片式表达",
        "练习使用更多过渡词来连接你的想法",
      ],
    });
  }

  try {
    const result = await provider.generateText(systemPrompt, transcript);
    // Strip markdown code fences if present
    const cleaned = result.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    // Extract JSON from response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Failed to parse review. Raw: " + cleaned.slice(0, 200) }, { status: 500 });
    }
    try {
      const review = JSON.parse(jsonMatch[0]);
      return Response.json(review);
    } catch {
      return Response.json({ error: "JSON parse failed. Raw: " + jsonMatch[0].slice(0, 200) }, { status: 500 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
