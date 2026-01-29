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
import { anatomyVocab } from "./anatomy";
import { pharmacyVocab } from "./pharmacy";
import { additional1Vocab } from "./additional1";
import { additional2Vocab } from "./additional2";

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
  ...anatomyVocab,
  ...pharmacyVocab,
  ...additional1Vocab,
  ...additional2Vocab,
];
