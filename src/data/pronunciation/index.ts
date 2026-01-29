import type { PronunciationItem } from "../pronunciation-words";
import { medicalTermsPronunciation } from "./medical-terms";
import { nursingPhrasesPronunciation } from "./nursing-phrases";
import { patientDialoguesPronunciation } from "./patient-dialogues";
import { emergencyPhrasesPronunciation } from "./emergency-phrases";
import { dailyExpressionsPronunciation } from "./daily-expressions";
import { phonePhrasePronunciation } from "./phone-phrases";
import { advancedMedicalPronunciation } from "./advanced-medical";
import { dailyGreetingsPronunciation } from "./daily-greetings";
import { shoppingDiningPronunciation } from "./shopping-dining";

export const expandedPronunciationItems: PronunciationItem[] = [
  ...medicalTermsPronunciation,
  ...nursingPhrasesPronunciation,
  ...patientDialoguesPronunciation,
  ...emergencyPhrasesPronunciation,
  ...dailyExpressionsPronunciation,
  ...phonePhrasePronunciation,
  ...advancedMedicalPronunciation,
  ...dailyGreetingsPronunciation,
  ...shoppingDiningPronunciation,
];
