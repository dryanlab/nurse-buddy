import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProvider {
  name: string;
  model: string;
  streamChat(systemPrompt: string, messages: ChatMessage[]): AsyncIterable<string>;
  generateText(systemPrompt: string, userMessage: string): Promise<string>;
}

// ── Gemini ──

class GeminiProvider implements AIProvider {
  name = "gemini";
  model: string;
  private apiKey: string;

  constructor(apiKey: string, model = "gemini-2.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async *streamChat(systemPrompt: string, messages: ChatMessage[]): AsyncIterable<string> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({
      history,
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
    });

    const result = await chat.sendMessageStream(lastMessage.content);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  async generateText(systemPrompt: string, userMessage: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userMessage);
    return result.response.text();
  }
}

// ── OpenAI ──

class OpenAIProvider implements AIProvider {
  name = "openai";
  model: string;
  private apiKey: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async *streamChat(systemPrompt: string, messages: ChatMessage[]): AsyncIterable<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-20)],
        stream: true,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error (${response.status})`);

    const decoder = new TextDecoder();
    const reader = response.body!.getReader();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch { /* skip */ }
      }
    }
  }

  async generateText(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });
    if (!response.ok) throw new Error(`OpenAI error (${response.status})`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ── Fallback wrapper ──

class FallbackProvider implements AIProvider {
  name = "fallback";
  model: string;
  private providers: AIProvider[];

  constructor(providers: AIProvider[]) {
    this.providers = providers;
    this.model = providers[0]?.model || "unknown";
  }

  async *streamChat(systemPrompt: string, messages: ChatMessage[]): AsyncIterable<string> {
    for (const provider of this.providers) {
      try {
        for await (const chunk of provider.streamChat(systemPrompt, messages)) {
          yield chunk;
        }
        return; // success
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many")) {
          console.warn(`[${provider.name}/${provider.model}] rate limited, trying next...`);
          continue;
        }
        throw e; // non-rate-limit error, don't retry
      }
    }
    throw new Error("All AI providers exhausted");
  }

  async generateText(systemPrompt: string, userMessage: string): Promise<string> {
    for (const provider of this.providers) {
      try {
        return await provider.generateText(systemPrompt, userMessage);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many")) {
          console.warn(`[${provider.name}/${provider.model}] rate limited, trying next...`);
          continue;
        }
        throw e;
      }
    }
    throw new Error("All AI providers exhausted");
  }
}

// ── Factory ──

export function getProvider(): AIProvider | null {
  const googleKey = process.env.GOOGLE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const providers: AIProvider[] = [];

  if (googleKey) {
    providers.push(new GeminiProvider(googleKey, "gemini-2.5-flash"));
    providers.push(new GeminiProvider(googleKey, "gemini-2.0-flash-lite"));
  }
  if (openaiKey) {
    providers.push(new OpenAIProvider(openaiKey));
  }

  if (providers.length === 0) return null;
  if (providers.length === 1) return providers[0];
  return new FallbackProvider(providers);
}
