export interface MedicalPhrase {
  id: string;
  phrase: string;
  chinese: string;
  example: string;
  exampleChinese: string;
  category: "collocation" | "phrasal-verb" | "nursing-expression" | "patient-communication" | "idiom" | "abbreviation";
  difficulty: "basic" | "intermediate" | "advanced";
}

export interface PhraseCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
}

export const phraseCategories: PhraseCategory[] = [
  { id: "collocation", name: "医学搭配", nameEn: "Medical Collocations", icon: "🔗" },
  { id: "phrasal-verb", name: "短语动词", nameEn: "Phrasal Verbs", icon: "🔄" },
  { id: "nursing-expression", name: "护理用语", nameEn: "Nursing Expressions", icon: "👩‍⚕️" },
  { id: "patient-communication", name: "患者沟通", nameEn: "Patient Communication", icon: "💬" },
  { id: "idiom", name: "惯用语", nameEn: "Idioms & Expressions", icon: "🗣️" },
  { id: "abbreviation", name: "医学缩写", nameEn: "Medical Abbreviations", icon: "📝" },
];
