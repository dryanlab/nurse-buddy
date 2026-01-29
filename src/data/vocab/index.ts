import { VocabWord } from "../vocabulary";
import { bodyVocab } from "./body";
import { symptomsVocab } from "./symptoms";
import { medicationsVocab } from "./medications";
import { equipmentVocab } from "./equipment";
import { diseasesVocab } from "./diseases";
import { proceduresVocab } from "./procedures";
import { nursingVocab } from "./nursing";
import { emergencyVocab } from "./emergency";
import { labVocab } from "./lab";
import { mentalVocab } from "./mental";

export const additionalVocabulary: VocabWord[] = [
  ...bodyVocab,
  ...symptomsVocab,
  ...medicationsVocab,
  ...equipmentVocab,
  ...diseasesVocab,
  ...proceduresVocab,
  ...nursingVocab,
  ...emergencyVocab,
  ...labVocab,
  ...mentalVocab,
];
