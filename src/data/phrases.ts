export interface MedicalPhrase {
  id: string;
  phrase: string;
  phonetic: string;
  chinese: string;
  literal: string;
  example: string;
  exampleChinese: string;
  category: string;
  difficulty: "basic" | "intermediate" | "advanced";
  type: "collocation" | "idiom" | "phrasal_verb" | "fixed_expression" | "medical_phrase";
}

export const allPhrases: MedicalPhrase[] = [
  { id: "p1", phrase: "take temperature", phonetic: "/teɪk ˈtɛmprətʃər/", chinese: "量体温", literal: "拿温度", example: "Let me take your temperature first.", exampleChinese: "让我先给你量体温。", category: "nursing", difficulty: "basic", type: "collocation" },
  { id: "p2", phrase: "check vitals", phonetic: "/tʃɛk ˈvaɪtəlz/", chinese: "检查生命体征", literal: "检查生命", example: "I need to check your vitals.", exampleChinese: "我需要检查你的生命体征。", category: "nursing", difficulty: "basic", type: "collocation" },
  { id: "p3", phrase: "draw blood", phonetic: "/drɔː blʌd/", chinese: "抽血", literal: "抽血", example: "I'm going to draw some blood for testing.", exampleChinese: "我要抽一些血做检查。", category: "nursing", difficulty: "basic", type: "collocation" },
  { id: "p4", phrase: "blood pressure", phonetic: "/blʌd ˈprɛʃər/", chinese: "血压", literal: "血压力", example: "Your blood pressure is a little high today.", exampleChinese: "你今天的血压有点高。", category: "nursing", difficulty: "basic", type: "collocation" },
  { id: "p5", phrase: "pass out", phonetic: "/pæs aʊt/", chinese: "晕倒", literal: "传出去", example: "The patient passed out in the hallway.", exampleChinese: "病人在走廊上晕倒了。", category: "emergency", difficulty: "intermediate", type: "phrasal_verb" },
  { id: "p6", phrase: "come to", phonetic: "/kʌm tuː/", chinese: "苏醒", literal: "来到", example: "The patient came to after a few minutes.", exampleChinese: "病人几分钟后苏醒了。", category: "emergency", difficulty: "intermediate", type: "phrasal_verb" },
  { id: "p7", phrase: "rule out", phonetic: "/ruːl aʊt/", chinese: "排除", literal: "排出", example: "We need to rule out infection first.", exampleChinese: "我们需要先排除感染。", category: "procedures", difficulty: "intermediate", type: "phrasal_verb" },
  { id: "p8", phrase: "under the weather", phonetic: "/ˈʌndər ðə ˈwɛðər/", chinese: "身体不适", literal: "在天气下", example: "I've been feeling under the weather all week.", exampleChinese: "我这整周都感觉不舒服。", category: "idioms", difficulty: "intermediate", type: "idiom" },
  { id: "p9", phrase: "on the mend", phonetic: "/ɒn ðə mɛnd/", chinese: "在康复中", literal: "在修补上", example: "Good news — you're on the mend!", exampleChinese: "好消息——你在康复了！", category: "idioms", difficulty: "intermediate", type: "idiom" },
  { id: "p10", phrase: "NPO", phonetic: "/ɛn piː oʊ/", chinese: "禁食禁水", literal: "Nothing Per Os", example: "Patient is NPO after midnight for surgery.", exampleChinese: "病人手术前午夜后禁食禁水。", category: "abbreviations", difficulty: "advanced", type: "medical_phrase" },
];

export const phraseCategories = [
  { id: "all", name: "全部", nameEn: "All", icon: "📝" },
  { id: "nursing", name: "护理搭配", nameEn: "Nursing", icon: "👩‍⚕️" },
  { id: "emergency", name: "急诊", nameEn: "Emergency", icon: "🚑" },
  { id: "procedures", name: "操作", nameEn: "Procedures", icon: "🔬" },
  { id: "idioms", name: "习语", nameEn: "Idioms", icon: "💬" },
  { id: "abbreviations", name: "缩写", nameEn: "Abbreviations", icon: "📋" },
];
