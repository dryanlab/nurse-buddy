import { NextRequest } from "next/server";
import { getProvider } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  const { scenario, messages } = await req.json();

  const systemPrompt = `You are role-playing as: ${scenario.aiRole}.

Context: ${scenario.context}

Instructions:
- Stay in character at all times. You ARE this person.
- Respond naturally in English at a level appropriate for a nursing student to understand.
- Keep responses 1-3 sentences. Be conversational and natural.
- If the student makes a grammar or vocabulary error, still understand and respond naturally. Do NOT correct them during the conversation.
- React realistically to what the student says — show emotions, ask questions, express concerns as your character would.
- Use natural filler words occasionally ("um", "well", "you know") to sound human.
- Do not break character or mention that you are an AI.`;

  const provider = getProvider();

  if (!provider) {
    // Mock mode
    const mockResponses = [
      "Oh hello! Yes, I have an appointment today. I'm a bit nervous, to be honest.",
      "Well, I've been having some pain for about two days now. It comes and goes.",
      "I take blood pressure medication... lisinopril, I think? And a baby aspirin every day.",
      "No, I'm not allergic to any medications that I know of. But I am allergic to shellfish.",
      "The pain is about a 6 out of 10 right now. It's more of a dull ache.",
      "Okay, thank you for explaining that. I feel a bit better knowing what to expect.",
    ];
    const turnIndex = Math.min(messages.filter((m: { role: string }) => m.role === "user").length, mockResponses.length - 1);
    return Response.json({ response: mockResponses[turnIndex] });
  }

  try {
    const response = await provider.generateText(
      systemPrompt,
      messages.map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "Student (Nurse)" : "You (${scenario.aiRole})"}: ${m.content}`
      ).join("\n") + "\n\nRespond as your character in 1-3 sentences:"
    );
    return Response.json({ response: response.trim() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
