"use client";

import React from "react";

interface MouthDiagramProps {
  symbolId: string;
  size?: number;
}

// Articulation group type
type ArticulationGroup =
  | "bilabial"
  | "labiodental"
  | "dental"
  | "alveolar"
  | "postalveolar"
  | "velar"
  | "glottal"
  | "palatal"
  | "labiovelar"
  | "vowel-high-front"
  | "vowel-mid-front"
  | "vowel-low-front"
  | "vowel-central"
  | "vowel-high-back"
  | "vowel-mid-back"
  | "vowel-low-back"
  | "diphthong-ei"
  | "diphthong-ai"
  | "diphthong-oi"
  | "diphthong-au"
  | "diphthong-ou"
  | "diphthong-ie"
  | "diphthong-ea"
  | "diphthong-ua";

const symbolToGroup: Record<string, ArticulationGroup> = {
  // Consonants
  "c-p": "bilabial",
  "c-b": "bilabial",
  "c-m": "bilabial",
  "c-f": "labiodental",
  "c-v": "labiodental",
  "c-theta": "dental",
  "c-eth": "dental",
  "c-t": "alveolar",
  "c-d": "alveolar",
  "c-n": "alveolar",
  "c-s": "alveolar",
  "c-z": "alveolar",
  "c-l": "alveolar",
  "c-sh": "postalveolar",
  "c-zh": "postalveolar",
  "c-ch": "postalveolar",
  "c-j": "postalveolar",
  "c-r": "postalveolar",
  "c-k": "velar",
  "c-g": "velar",
  "c-ng": "velar",
  "c-h": "glottal",
  "c-y": "palatal",
  "c-w": "labiovelar",
  // Vowels
  "v-i": "vowel-high-front",
  "v-ii": "vowel-high-front",
  "v-e": "vowel-mid-front",
  "v-ae": "vowel-low-front",
  "v-schwa": "vowel-central",
  "v-er": "vowel-central",
  "v-uh": "vowel-central",
  "v-u": "vowel-high-back",
  "v-uu": "vowel-high-back",
  "v-o": "vowel-low-back",
  "v-aa": "vowel-low-back",
  "v-oo": "vowel-mid-back",
  // Diphthongs
  "d-ei": "diphthong-ei",
  "d-ai": "diphthong-ai",
  "d-oi": "diphthong-oi",
  "d-au": "diphthong-au",
  "d-ou": "diphthong-ou",
  "d-ie": "diphthong-ie",
  "d-ea": "diphthong-ea",
  "d-ua": "diphthong-ua",
};

// Nasal symbols
const nasalSymbols = new Set(["c-m", "c-n", "c-ng"]);

// Colors
const C = {
  outline: "#9CA3AF",
  palate: "#D1D5DB",
  teeth: "#E5E7EB",
  tongue: "#F97316",
  tongueDark: "#EA580C",
  airflow: "#60A5FA",
  nasal: "#818CF8",
  lip: "#FB7185",
  fill: "#FFF7ED",
  label: "#9CA3AF",
};

// Base mouth anatomy SVG paths (sagittal cross-section, viewBox 0 0 200 200)
// Simplified: nose on left, throat on right
function BaseAnatomy({ showNasal, lipsClosed }: { showNasal?: boolean; lipsClosed?: boolean }) {
  return (
    <g>
      {/* Nasal passage */}
      <path
        d="M 30 45 Q 40 30, 80 28 Q 120 26, 140 35"
        fill="none"
        stroke={showNasal ? C.nasal : C.palate}
        strokeWidth={showNasal ? 2 : 1.2}
        strokeDasharray={showNasal ? "none" : "3 3"}
        opacity={showNasal ? 1 : 0.4}
      />
      {/* Hard palate */}
      <path
        d="M 45 65 Q 70 48, 100 50 Q 125 52, 140 60"
        fill="none"
        stroke={C.palate}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Soft palate (velum) + uvula */}
      <path
        d="M 140 60 Q 155 65, 158 80 Q 160 90, 155 95"
        fill="none"
        stroke={C.palate}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Upper teeth */}
      <line x1="45" y1="65" x2="45" y2="78" stroke={C.teeth} strokeWidth={3} strokeLinecap="round" />
      {/* Lower teeth */}
      <line x1="45" y1="130" x2="45" y2="118" stroke={C.teeth} strokeWidth={3} strokeLinecap="round" />
      {/* Upper lip */}
      <path
        d={lipsClosed ? "M 25 72 Q 35 68, 42 72" : "M 20 65 Q 30 60, 42 68"}
        fill="none"
        stroke={C.lip}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Lower lip */}
      <path
        d={lipsClosed ? "M 25 78 Q 35 82, 42 78" : "M 20 135 Q 30 140, 42 130"}
        fill="none"
        stroke={C.lip}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Throat / pharynx */}
      <path
        d="M 155 95 Q 160 110, 165 130 Q 168 145, 165 165"
        fill="none"
        stroke={C.outline}
        strokeWidth={1.5}
        opacity={0.4}
      />
      {/* Lower jaw outline */}
      <path
        d="M 42 130 Q 80 150, 130 148 Q 155 145, 165 135"
        fill="none"
        stroke={C.outline}
        strokeWidth={1.5}
        opacity={0.4}
      />
    </g>
  );
}

// Tongue shapes for different articulation groups
function TonguePath({ group }: { group: ArticulationGroup }) {
  // All tongues start from tongue root (~155,120) and go to tongue tip
  const tongueShapes: Record<string, string> = {
    // Consonants - tongue tip positions vary
    bilabial:
      "M 155 120 Q 130 115, 100 118 Q 80 120, 60 115 Q 50 112, 48 108",
    labiodental:
      "M 155 120 Q 130 115, 100 118 Q 80 120, 60 115 Q 50 112, 48 108",
    dental:
      "M 155 120 Q 130 115, 100 112 Q 75 108, 55 95 Q 48 85, 44 75",
    alveolar:
      "M 155 120 Q 130 115, 100 110 Q 75 105, 58 90 Q 50 80, 48 72",
    postalveolar:
      "M 155 120 Q 130 112, 100 100 Q 80 92, 65 82 Q 55 76, 52 74",
    velar:
      "M 155 110 Q 145 85, 135 70 Q 125 60, 110 68 Q 90 85, 70 100 Q 55 108, 48 108",
    glottal:
      "M 155 125 Q 130 120, 100 122 Q 80 124, 60 120 Q 50 118, 48 115",
    palatal:
      "M 155 118 Q 130 108, 105 80 Q 90 65, 80 62 Q 65 70, 55 85 Q 48 95, 48 105",
    labiovelar:
      "M 155 108 Q 145 88, 135 75 Q 125 65, 115 72 Q 95 88, 75 102 Q 58 112, 48 112",
    // Vowels - tongue body height/position
    "vowel-high-front":
      "M 155 120 Q 130 112, 105 95 Q 85 72, 70 62 Q 58 60, 50 70 Q 48 80, 48 95",
    "vowel-mid-front":
      "M 155 120 Q 130 115, 105 105 Q 85 88, 70 80 Q 58 78, 50 85 Q 48 92, 48 100",
    "vowel-low-front":
      "M 155 122 Q 130 120, 105 118 Q 85 112, 70 105 Q 58 100, 50 100 Q 48 105, 48 110",
    "vowel-central":
      "M 155 120 Q 130 115, 105 108 Q 90 100, 75 100 Q 60 102, 50 105 Q 48 108, 48 110",
    "vowel-high-back":
      "M 155 108 Q 145 90, 130 78 Q 115 72, 100 80 Q 85 92, 70 102 Q 55 110, 48 112",
    "vowel-mid-back":
      "M 155 112 Q 145 95, 130 85 Q 115 80, 100 88 Q 85 98, 70 106 Q 55 112, 48 115",
    "vowel-low-back":
      "M 155 122 Q 140 118, 120 115 Q 100 112, 80 115 Q 60 118, 48 118",
  };

  // For diphthongs, use the start position
  const diphthongStart: Record<string, string> = {
    "diphthong-ei": tongueShapes["vowel-mid-front"],
    "diphthong-ai": tongueShapes["vowel-low-front"],
    "diphthong-oi": tongueShapes["vowel-mid-back"],
    "diphthong-au": tongueShapes["vowel-low-front"],
    "diphthong-ou": tongueShapes["vowel-mid-back"],
    "diphthong-ie": tongueShapes["vowel-high-front"],
    "diphthong-ea": tongueShapes["vowel-mid-front"],
    "diphthong-ua": tongueShapes["vowel-high-back"],
  };

  const diphthongEnd: Record<string, string> = {
    "diphthong-ei": tongueShapes["vowel-high-front"],
    "diphthong-ai": tongueShapes["vowel-high-front"],
    "diphthong-oi": tongueShapes["vowel-high-front"],
    "diphthong-au": tongueShapes["vowel-high-back"],
    "diphthong-ou": tongueShapes["vowel-high-back"],
    "diphthong-ie": tongueShapes["vowel-central"],
    "diphthong-ea": tongueShapes["vowel-central"],
    "diphthong-ua": tongueShapes["vowel-central"],
  };

  const isDiphthong = group.startsWith("diphthong");

  if (isDiphthong) {
    const startPath = diphthongStart[group] || tongueShapes["vowel-central"];
    const endPath = diphthongEnd[group] || tongueShapes["vowel-central"];
    return (
      <g>
        {/* Start tongue (faded) */}
        <path
          d={startPath}
          fill="none"
          stroke={C.tongue}
          strokeWidth={3}
          opacity={0.35}
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        {/* End tongue (solid) */}
        <path
          d={endPath}
          fill="none"
          stroke={C.tongue}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        {/* Arrow indicating direction */}
        <text x="85" y="58" fontSize="14" fill={C.tongueDark} fontWeight="bold" textAnchor="middle">→</text>
      </g>
    );
  }

  const path = tongueShapes[group] || tongueShapes["vowel-central"];
  return (
    <path
      d={path}
      fill="none"
      stroke={C.tongue}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  );
}

// Airflow arrows
function AirflowArrows({ group, isNasal }: { group: ArticulationGroup; isNasal: boolean }) {
  if (isNasal) {
    return (
      <g>
        {/* Nasal airflow */}
        <path
          d="M 150 50 Q 120 35, 80 32 Q 50 30, 25 38"
          fill="none"
          stroke={C.nasal}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#arrowNasal)"
        />
      </g>
    );
  }

  if (group === "glottal") {
    return (
      <path
        d="M 155 130 Q 120 115, 80 105 Q 50 100, 25 95"
        fill="none"
        stroke={C.airflow}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        markerEnd="url(#arrowBlue)"
      />
    );
  }

  // Default oral airflow
  return (
    <path
      d="M 140 85 Q 110 80, 80 78 Q 50 76, 28 70"
      fill="none"
      stroke={C.airflow}
      strokeWidth={1.2}
      strokeDasharray="4 3"
      markerEnd="url(#arrowBlue)"
      opacity={0.6}
    />
  );
}

// Special articulation markers
function ArticulationMarker({ group, symbolId }: { group: ArticulationGroup; symbolId: string }) {
  if (group === "bilabial") {
    // Lips pressed together indicator
    return (
      <g>
        <circle cx="30" cy="75" r="4" fill={C.lip} opacity={0.5} />
        <text x="12" y="90" fontSize="7" fill={C.label}>唇</text>
      </g>
    );
  }
  if (group === "labiodental") {
    // Upper teeth on lower lip
    return (
      <g>
        <circle cx="44" cy="82" r="3" fill={C.lip} opacity={0.5} />
        <text x="10" y="88" fontSize="7" fill={C.label}>齿+唇</text>
      </g>
    );
  }
  if (group === "dental") {
    // Tongue between teeth
    return (
      <g>
        <circle cx="44" cy="75" r="3" fill={C.tongue} opacity={0.6} />
        <text x="8" y="68" fontSize="7" fill={C.label}>齿间</text>
      </g>
    );
  }
  if (group === "alveolar") {
    return (
      <g>
        <circle cx="52" cy="68" r="3" fill={C.tongue} opacity={0.5} />
        <text x="55" y="58" fontSize="7" fill={C.label}>齿龈</text>
      </g>
    );
  }
  if (group === "velar") {
    return (
      <g>
        <circle cx="138" cy="62" r="3" fill={C.tongue} opacity={0.5} />
        <text x="120" y="52" fontSize="7" fill={C.label}>软腭</text>
      </g>
    );
  }
  if (group === "palatal") {
    return (
      <g>
        <circle cx="90" cy="58" r="3" fill={C.tongue} opacity={0.5} />
        <text x="78" y="48" fontSize="7" fill={C.label}>硬腭</text>
      </g>
    );
  }
  return null;
}

// Group label displayed at bottom
const groupLabels: Record<string, string> = {
  bilabial: "双唇",
  labiodental: "唇齿",
  dental: "齿间",
  alveolar: "齿龈",
  postalveolar: "龈后",
  velar: "软腭",
  glottal: "声门",
  palatal: "硬腭",
  labiovelar: "唇+软腭",
  "vowel-high-front": "高前",
  "vowel-mid-front": "中前",
  "vowel-low-front": "低前",
  "vowel-central": "中央",
  "vowel-high-back": "高后",
  "vowel-mid-back": "中后",
  "vowel-low-back": "低后",
  "diphthong-ei": "e→ɪ 滑动",
  "diphthong-ai": "a→ɪ 滑动",
  "diphthong-oi": "ɔ→ɪ 滑动",
  "diphthong-au": "a→ʊ 滑动",
  "diphthong-ou": "o→ʊ 滑动",
  "diphthong-ie": "ɪ→ə 滑动",
  "diphthong-ea": "e→ə 滑动",
  "diphthong-ua": "ʊ→ə 滑动",
};

export default function MouthDiagram({ symbolId, size = 200 }: MouthDiagramProps) {
  const group = symbolToGroup[symbolId];
  if (!group) return null;

  const isNasal = nasalSymbols.has(symbolId);
  const lipsClosed = group === "bilabial";

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="drop-shadow-sm"
      >
        <defs>
          <marker id="arrowBlue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={C.airflow} />
          </marker>
          <marker id="arrowNasal" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill={C.nasal} />
          </marker>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="200" height="200" rx="16" fill={C.fill} />

        {/* Anatomy */}
        <BaseAnatomy showNasal={isNasal} lipsClosed={lipsClosed} />

        {/* Tongue */}
        <TonguePath group={group} />

        {/* Airflow */}
        <AirflowArrows group={group} isNasal={isNasal} />

        {/* Articulation markers */}
        <ArticulationMarker group={group} symbolId={symbolId} />

        {/* Label */}
        <text
          x="100"
          y="188"
          textAnchor="middle"
          fontSize="9"
          fill={C.label}
          fontWeight="500"
        >
          {groupLabels[group] || ""}
        </text>
      </svg>
    </div>
  );
}
