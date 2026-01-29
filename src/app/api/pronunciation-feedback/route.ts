import { NextRequest } from "next/server";
import { getProvider } from "@/lib/ai-provider";

const SYSTEM_PROMPT = `你是一位温柔友好的英语发音教练，专门帮助中国人改善英语发音。

规则：
1. 用中文回复
2. 先表扬用户的尝试（哪怕说得不好也要鼓励）
3. 如果分数低，温柔指出可能的发音问题
4. 针对中国人常见的发音问题给出具体建议（如 th/r/l/v 等）
5. 给一个简短的练习小贴士
6. 保持回复简短（3-5句话），温暖鼓励
7. 使用一些 emoji 让回复更友好`;

export async function POST(req: NextRequest) {
  const { target, spoken, score, tip } = await req.json();

  const provider = getProvider();

  if (!provider) {
    // Mock feedback
    const feedback = score >= 80
      ? `太棒了！🎉 你的发音非常接近标准！"${target}" 说得很清楚。继续保持这样的状态，你的英语会越来越好的！💪`
      : score >= 50
      ? `不错的尝试！👍 你说的是 "${spoken}"，目标是 "${target}"。${tip} 多练几次就会越来越好！加油！🌟`
      : `勇气可嘉！💪 你迈出了第一步，这很重要。${tip} 先听一下标准发音，然后慢慢跟读。每天进步一点点！🌈`;
    return Response.json({ feedback });
  }

  try {
    const userMessage = `用户正在练习发音：
目标单词/短语："${target}"
用户说出的内容："${spoken}"
匹配得分：${score}/100
发音技巧参考：${tip}

请给出简短的发音反馈和鼓励。`;

    const feedback = await provider.generateText(SYSTEM_PROMPT, userMessage);
    return Response.json({ feedback });
  } catch {
    return Response.json({
      feedback: score >= 50
        ? `不错！继续练习 "${target}"，你会越来越好的！💪`
        : `别气馁！"${target}" 确实不容易，${tip} 多练几次就好了！🌟`,
    });
  }
}
