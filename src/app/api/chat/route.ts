import { NextRequest } from "next/server";
import { getProvider } from "@/lib/ai-provider";

const MOCK_RESPONSES = [
  "Oh, thank you for coming! I've been having this terrible pain in my chest since this morning. It just won't go away...\n\n【很好的开始！👍 你的自我介绍很标准。注意 \"nurse\" 的发音是 /nɜːrs/，不是 /nʌrs/。继续问诊吧！🌟】",
  "Yes, I do take medication for high blood pressure... lisinopril, I think? And I'm allergic to penicillin. I should have mentioned that right away.\n\n【你问得很好！💪 \"Are you allergic to any medications?\" 是非常标准的问诊用语。注意 \"allergic\" 的重音在第二音节：a-LER-gic。继续加油！🎯】",
  "The pain is about a 7... it's a pressure kind of feeling, right here in the center. It started about 3 hours ago. I was just watching TV when it hit me.\n\n【很棒的疼痛评估！🌟 你的 \"scale of 1 to 10\" 用得很准确。小建议：可以再问 \"Does the pain radiate anywhere?\"（疼痛有放射吗？）这是很专业的问法哦！💪】",
];

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

function sseEncode(content: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`);
}

function sseDone(): Uint8Array {
  return new TextEncoder().encode("data: [DONE]\n\n");
}

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    systemPrompt: string;
  };

  const provider = getProvider();

  // Mock mode
  if (!provider) {
    const mockResponse = MOCK_RESPONSES[Math.min(messages.filter(m => m.role === "user").length - 1, MOCK_RESPONSES.length - 1)] || MOCK_RESPONSES[0];
    const stream = new ReadableStream({
      async start(controller) {
        const words = mockResponse.split(" ");
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(sseEncode((i === 0 ? "" : " ") + words[i]));
          await new Promise((r) => setTimeout(r, 25 + Math.random() * 35));
        }
        controller.enqueue(sseDone());
        controller.close();
      },
    });
    return new Response(stream, { headers: SSE_HEADERS });
  }

  // Real AI mode
  try {
    const gen = provider.streamChat(systemPrompt, messages.slice(-20));
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of gen) {
            controller.enqueue(sseEncode(text));
          }
          controller.enqueue(sseDone());
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(sseEncode(`\n\n⚠️ 错误: ${msg}`));
          controller.enqueue(sseDone());
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "连接失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
