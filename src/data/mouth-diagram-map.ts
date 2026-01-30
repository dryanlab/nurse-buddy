/**
 * Maps IPA sound IDs to their corresponding mouth diagram image paths.
 * Each diagram shows a sagittal cross-section of the oral cavity
 * illustrating the articulation position for that sound group.
 */
export const mouthDiagramMap: Record<string, string> = {
  // Bilabial — /p/ /b/ /m/
  "c-p": "/mouth-diagrams/bilabial.png",
  "c-b": "/mouth-diagrams/bilabial.png",
  "c-m": "/mouth-diagrams/bilabial.png",

  // Labiodental — /f/ /v/
  "c-f": "/mouth-diagrams/labiodental.png",
  "c-v": "/mouth-diagrams/labiodental.png",

  // Dental — /θ/ /ð/
  "c-theta": "/mouth-diagrams/dental.png",
  "c-eth": "/mouth-diagrams/dental.png",

  // Alveolar stop — /t/ /d/
  "c-t": "/mouth-diagrams/alveolar-stop.png",
  "c-d": "/mouth-diagrams/alveolar-stop.png",

  // Alveolar fricative — /s/ /z/
  "c-s": "/mouth-diagrams/alveolar-fricative.png",
  "c-z": "/mouth-diagrams/alveolar-fricative.png",

  // Alveolar nasal — /n/
  "c-n": "/mouth-diagrams/alveolar-nasal.png",

  // Alveolar lateral — /l/
  "c-l": "/mouth-diagrams/alveolar-lateral.png",

  // Alveolar approximant — /r/
  "c-r": "/mouth-diagrams/alveolar-approximant.png",

  // Postalveolar — /ʃ/ /ʒ/ /tʃ/ /dʒ/
  "c-sh": "/mouth-diagrams/postalveolar.png",
  "c-zh": "/mouth-diagrams/postalveolar.png",
  "c-ch": "/mouth-diagrams/postalveolar.png",
  "c-j": "/mouth-diagrams/postalveolar.png",

  // Velar — /k/ /ɡ/ /ŋ/
  "c-k": "/mouth-diagrams/velar.png",
  "c-g": "/mouth-diagrams/velar.png",
  "c-ng": "/mouth-diagrams/velar.png",

  // Glottal — /h/
  "c-h": "/mouth-diagrams/glottal.png",

  // Palatal approximant — /j/
  "c-y": "/mouth-diagrams/palatal.png",

  // Labial-velar approximant — /w/
  "c-w": "/mouth-diagrams/labial-velar.png",

  // Front high vowels — /iː/ /ɪ/
  "v-ii": "/mouth-diagrams/vowel-front-high.png",
  "v-i": "/mouth-diagrams/vowel-front-high.png",

  // Front low vowels — /e/ /æ/
  "v-e": "/mouth-diagrams/vowel-front-low.png",
  "v-ae": "/mouth-diagrams/vowel-front-low.png",

  // Central vowels — /ə/ /ɜː/ /ʌ/
  "v-schwa": "/mouth-diagrams/vowel-central.png",
  "v-er": "/mouth-diagrams/vowel-central.png",
  "v-uh": "/mouth-diagrams/vowel-central.png",

  // Back high vowels — /uː/ /ʊ/
  "v-uu": "/mouth-diagrams/vowel-back-high.png",
  "v-u": "/mouth-diagrams/vowel-back-high.png",

  // Back low vowels — /ɑː/ /ɒ/ /ɔː/
  "v-aa": "/mouth-diagrams/vowel-back-low.png",
  "v-o": "/mouth-diagrams/vowel-back-low.png",
  "v-oo": "/mouth-diagrams/vowel-back-low.png",

  // Diphthongs — map to the starting vowel position
  "d-ei": "/mouth-diagrams/vowel-front-low.png",   // /eɪ/ starts front-low
  "d-ai": "/mouth-diagrams/vowel-back-low.png",     // /aɪ/ starts low
  "d-oi": "/mouth-diagrams/vowel-back-low.png",     // /ɔɪ/ starts back-low
  "d-au": "/mouth-diagrams/vowel-back-low.png",     // /aʊ/ starts low
  "d-ou": "/mouth-diagrams/vowel-back-low.png",     // /əʊ/ starts central-back
  "d-ie": "/mouth-diagrams/vowel-front-high.png",   // /ɪə/ starts front-high
  "d-ea": "/mouth-diagrams/vowel-front-low.png",    // /eə/ starts front-low
  "d-ua": "/mouth-diagrams/vowel-back-high.png",    // /ʊə/ starts back-high
};
