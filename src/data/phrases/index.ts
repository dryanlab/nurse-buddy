import { MedicalPhrase } from "./types";
import { collocations } from "./collocations";
import { phrasalVerbs } from "./phrasal-verbs";
import { nursingExpressions } from "./nursing-expressions";
import { patientCommunication } from "./patient-communication";
import { idioms } from "./idioms";
import { abbreviations } from "./abbreviations";

export type { MedicalPhrase } from "./types";
export { phraseCategories } from "./types";

export const allPhrases: MedicalPhrase[] = [
  ...collocations,
  ...phrasalVerbs,
  ...nursingExpressions,
  ...patientCommunication,
  ...idioms,
  ...abbreviations,
];
