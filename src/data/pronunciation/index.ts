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
import { emotionsOpinionsPronunciation } from "./emotions-opinions";
import { travelDirectionsPronunciation } from "./travel-directions";
import { workplaceSchoolPronunciation } from "./workplace-school";
import { socialPolitePronunciation } from "./social-polite";
import { weatherNaturePronunciation } from "./weather-nature";
import { familyHomePronunciation } from "./family-home";
import { healthBodyPronunciation } from "./health-body";
import { idiomSlangPronunciation } from "./idioms-slang";

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
  ...emotionsOpinionsPronunciation,
  ...travelDirectionsPronunciation,
  ...workplaceSchoolPronunciation,
  ...socialPolitePronunciation,
  ...weatherNaturePronunciation,
  ...familyHomePronunciation,
  ...healthBodyPronunciation,
  ...idiomSlangPronunciation,
];
