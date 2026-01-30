"use client";

import React from "react";

interface MouthDiagramProps {
  symbolId: string;
  size?: number;
}

// ─── Articulation types ───

type ConsonantPlace =
  | "bilabial" | "labiodental" | "dental" | "alveolar"
  | "postalveolar" | "velar" | "glottal" | "palatal" | "labiovelar";

type VowelPos = { height: number; front: number; round?: boolean };
// height: 0=high, 1=low; front: 0=front, 1=back

interface ConsonantInfo {
  type: "consonant";
  place: ConsonantPlace;
  nasal?: boolean;
  label: string;
}

interface VowelInfo {
  type: "vowel";
  pos: VowelPos;
  label: string;
}

interface DiphthongInfo {
  type: "diphthong";
  from: VowelPos;
  to: VowelPos;
  label: string;
}

type SoundInfo = ConsonantInfo | VowelInfo | DiphthongInfo;

const sounds: Record<string, SoundInfo> = {
  // Consonants
  "c-p":     { type: "consonant", place: "bilabial", label: "双唇" },
  "c-b":     { type: "consonant", place: "bilabial", label: "双唇" },
  "c-m":     { type: "consonant", place: "bilabial", nasal: true, label: "双唇(鼻)" },
  "c-f":     { type: "consonant", place: "labiodental", label: "唇齿" },
  "c-v":     { type: "consonant", place: "labiodental", label: "唇齿" },
  "c-theta": { type: "consonant", place: "dental", label: "齿间" },
  "c-eth":   { type: "consonant", place: "dental", label: "齿间" },
  "c-t":     { type: "consonant", place: "alveolar", label: "齿龈" },
  "c-d":     { type: "consonant", place: "alveolar", label: "齿龈" },
  "c-n":     { type: "consonant", place: "alveolar", nasal: true, label: "齿龈(鼻)" },
  "c-s":     { type: "consonant", place: "alveolar", label: "齿龈" },
  "c-z":     { type: "consonant", place: "alveolar", label: "齿龈" },
  "c-l":     { type: "consonant", place: "alveolar", label: "齿龈" },
  "c-sh":    { type: "consonant", place: "postalveolar", label: "龈后" },
  "c-zh":    { type: "consonant", place: "postalveolar", label: "龈后" },
  "c-ch":    { type: "consonant", place: "postalveolar", label: "龈后" },
  "c-j":     { type: "consonant", place: "postalveolar", label: "龈后" },
  "c-r":     { type: "consonant", place: "postalveolar", label: "龈后" },
  "c-k":     { type: "consonant", place: "velar", label: "软腭" },
  "c-g":     { type: "consonant", place: "velar", label: "软腭" },
  "c-ng":    { type: "consonant", place: "velar", nasal: true, label: "软腭(鼻)" },
  "c-h":     { type: "consonant", place: "glottal", label: "声门" },
  "c-y":     { type: "consonant", place: "palatal", label: "硬腭" },
  "c-w":     { type: "consonant", place: "labiovelar", label: "唇+软腭" },

  // Vowels  height: 0=high 1=low, front: 0=front 1=back
  "v-ii":    { type: "vowel", pos: { height: 0, front: 0 }, label: "高前" },
  "v-i":     { type: "vowel", pos: { height: 0.15, front: 0.1 }, label: "次高前" },
  "v-e":     { type: "vowel", pos: { height: 0.35, front: 0.1 }, label: "中前" },
  "v-ae":    { type: "vowel", pos: { height: 0.8, front: 0.15 }, label: "低前" },
  "v-uh":    { type: "vowel", pos: { height: 0.5, front: 0.5 }, label: "中央" },
  "v-schwa": { type: "vowel", pos: { height: 0.45, front: 0.5 }, label: "中央" },
  "v-er":    { type: "vowel", pos: { height: 0.4, front: 0.45 }, label: "中央卷舌" },
  "v-uu":    { type: "vowel", pos: { height: 0, front: 1, round: true }, label: "高后圆" },
  "v-u":     { type: "vowel", pos: { height: 0.15, front: 0.9, round: true }, label: "次高后圆" },
  "v-oo":    { type: "vowel", pos: { height: 0.4, front: 0.9, round: true }, label: "中后圆" },
  "v-aa":    { type: "vowel", pos: { height: 0.9, front: 0.85 }, label: "低后" },
  "v-o":     { type: "vowel", pos: { height: 0.7, front: 0.8, round: true }, label: "低后圆" },

  // Diphthongs
  "d-ei":  { type: "diphthong", from: { height: 0.35, front: 0.1 }, to: { height: 0.1, front: 0 }, label: "eɪ" },
  "d-ai":  { type: "diphthong", from: { height: 0.85, front: 0.5 }, to: { height: 0.1, front: 0 }, label: "aɪ" },
  "d-oi":  { type: "diphthong", from: { height: 0.6, front: 0.85 }, to: { height: 0.1, front: 0 }, label: "ɔɪ" },
  "d-au":  { type: "diphthong", from: { height: 0.85, front: 0.5 }, to: { height: 0.1, front: 1 }, label: "aʊ" },
  "d-ou":  { type: "diphthong", from: { height: 0.4, front: 0.5 }, to: { height: 0.1, front: 1 }, label: "oʊ" },
  "d-ie":  { type: "diphthong", from: { height: 0.1, front: 0 }, to: { height: 0.45, front: 0.5 }, label: "ɪə" },
  "d-ea":  { type: "diphthong", from: { height: 0.35, front: 0.1 }, to: { height: 0.45, front: 0.5 }, label: "eə" },
  "d-ua":  { type: "diphthong", from: { height: 0.1, front: 0.9 }, to: { height: 0.45, front: 0.5 }, label: "ʊə" },
};

// ─── SVG coordinate helpers ───
// ViewBox: 0 0 300 300. Head faces LEFT.
// Key anatomical landmarks (approximate):

const P = {
  // Head profile (facing left)
  noseTip:       [68, 72],
  noseBase:      [82, 95],
  upperLipTop:   [75, 108],
  upperLipFront: [68, 118],
  lowerLipFront: [68, 135],
  lowerLipBot:   [78, 145],
  chin:          [95, 172],
  throat:        [160, 195],
  nape:          [210, 50],

  // Oral cavity
  upperTeethFront: [82, 112],
  upperTeethBack:  [100, 112],
  lowerTeethFront: [84, 138],
  lowerTeethBack:  [100, 138],
  alveolarRidge:   [105, 102],
  hardPalateStart: [110, 90],
  hardPalateMid:   [140, 78],
  hardPalateEnd:   [168, 82],
  velumStart:      [168, 82],
  velumMid:        [188, 88],
  velumEnd:        [195, 100],
  uvula:           [197, 108],

  // Tongue root
  tongueRoot:      [170, 168],
  tongueBase:      [100, 158],

  // Nasal cavity
  nasalFront:      [80, 70],
  nasalBack:       [185, 65],

  // Pharynx
  pharynxTop:      [200, 100],
  pharynxBot:      [195, 175],
} as const;

// Tongue position: given vowel-like coords (height 0-1, front 0-1), produce a tongue tip point and body curve
function tonguePath(height: number, front: number): string {
  // Tongue sits in the oral cavity. Map front/height to positions:
  // front=0 → tip near alveolar; front=1 → tip retracted toward pharynx
  // height=0 → body raised toward palate; height=1 → body low (floor)

  const tipX = 88 + front * 80;   // 88 (front) to 168 (back)
  const tipY = 108 + height * 48;  // 108 (high) to 156 (low)

  // Body humps
  const humpX = 100 + front * 65;
  const humpY = 100 + height * 52;  // raised vs low

  // Root always goes to roughly the same place
  const rootX = 175;
  const rootY = 165;

  // Base follows floor
  const baseX = 95;
  const baseY = 160;

  return `M ${baseX} ${baseY}
    Q ${tipX - 10} ${tipY + 5} ${tipX} ${tipY}
    Q ${humpX} ${humpY} ${humpX + 25} ${humpY + 8}
    Q ${rootX - 10} ${rootY - 15} ${rootX} ${rootY}
    L ${baseX + 75} ${baseY + 2}
    Z`;
}

// Consonant tongue shapes
function consonantTonguePath(place: ConsonantPlace): string {
  switch (place) {
    case "bilabial":
    case "glottal":
    case "labiodental":
      // Neutral tongue
      return tonguePath(0.55, 0.4);
    case "dental":
      // Tongue tip extended to teeth
      return `M 95 160
        Q 82 135 78 120
        Q 82 118 88 116
        Q 110 110 140 112
        Q 165 130 175 165
        L 170 162
        Z`;
    case "alveolar":
      // Tongue tip touches alveolar ridge
      return `M 95 160
        Q 90 140 95 120
        Q 100 105 108 104
        Q 130 108 155 125
        Q 170 145 175 165
        L 170 162
        Z`;
    case "postalveolar":
      // Tongue blade raised to postalveolar region
      return `M 95 160
        Q 95 140 100 125
        Q 112 100 125 95
        Q 148 100 162 120
        Q 172 145 175 165
        L 170 162
        Z`;
    case "palatal":
      // Tongue body raised to hard palate
      return `M 95 160
        Q 100 140 108 118
        Q 125 88 150 86
        Q 168 92 172 120
        Q 175 148 175 165
        L 170 162
        Z`;
    case "velar":
    case "labiovelar":
      // Back of tongue raised to velum
      return `M 95 160
        Q 100 150 110 145
        Q 125 138 145 118
        Q 168 90 185 92
        Q 190 110 185 140
        Q 180 160 175 165
        L 170 162
        Z`;
    default:
      return tonguePath(0.55, 0.4);
  }
}

// Contact point for consonants
function contactPoint(place: ConsonantPlace): [number, number] | null {
  switch (place) {
    case "bilabial": return [68, 126];
    case "labiodental": return [78, 118];
    case "dental": return [80, 118];
    case "alveolar": return [106, 104];
    case "postalveolar": return [122, 95];
    case "palatal": return [148, 86];
    case "velar":
    case "labiovelar": return [186, 90];
    case "glottal": return [195, 150];
    default: return null;
  }
}

// Label position for consonants
function labelPos(place: ConsonantPlace): { x: number; y: number; anchor: "start" | "middle" | "end"; lineTarget: [number, number] } {
  switch (place) {
    case "bilabial": return { x: 35, y: 128, anchor: "end", lineTarget: [65, 126] };
    case "labiodental": return { x: 38, y: 112, anchor: "end", lineTarget: [75, 116] };
    case "dental": return { x: 40, y: 105, anchor: "end", lineTarget: [78, 118] };
    case "alveolar": return { x: 108, y: 55, anchor: "middle", lineTarget: [106, 100] };
    case "postalveolar": return { x: 128, y: 52, anchor: "middle", lineTarget: [122, 92] };
    case "palatal": return { x: 155, y: 52, anchor: "middle", lineTarget: [148, 83] };
    case "velar":
    case "labiovelar": return { x: 220, y: 72, anchor: "start", lineTarget: [190, 88] };
    case "glottal": return { x: 228, y: 150, anchor: "start", lineTarget: [198, 150] };
    default: return { x: 150, y: 50, anchor: "middle", lineTarget: [150, 80] };
  }
}

// ─── Component ───

export default function MouthDiagram({ symbolId, size = 200 }: MouthDiagramProps) {
  const info = sounds[symbolId];

  const colors = {
    headOutline: "#B0ADA8",
    skinFill: "#F5EDE3",
    palate: "#E8DDD0",
    tongue: "#E8787A",
    tongueDark: "#C4494C",
    teeth: "#FFFFFF",
    teethBorder: "#CCCCCC",
    inside: "#F9F3EC",
    nasal: "#F0EBE4",
    contact: "#E53935",
    airBlue: "#5BA4E6",
    airPurple: "#9B7BDB",
    label: "#555555",
    leaderLine: "#999999",
  };

  const isNasal = info?.type === "consonant" && info.nasal;
  const isBilabial = info?.type === "consonant" && info.place === "bilabial";
  const isLabiodental = info?.type === "consonant" && info.place === "labiodental";
  const roundLips = info?.type === "consonant" && (info.place === "labiovelar") ||
    (info?.type === "vowel" && info.pos.round) ||
    (info?.type === "diphthong" && info.to.round);

  // Determine velum position (lowered for nasals)
  const velumLowered = isNasal;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={colors.airBlue} />
          </marker>
          <marker id="arrowPurple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={colors.airPurple} />
          </marker>
          <marker id="arrowRed" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill={colors.contact} />
          </marker>
        </defs>

        {/* ── Nasal cavity ── */}
        <path
          d={`M 82 70 Q 85 58 110 55 Q 150 50 185 55 Q 198 58 200 70 L 200 80
              Q 185 75 168 82 L 110 90 Q 100 92 95 88 Q 85 82 82 70 Z`}
          fill={colors.nasal}
          stroke={colors.headOutline}
          strokeWidth={1.2}
          opacity={0.7}
        />

        {/* ── Hard palate ── */}
        <path
          d={`M 100 108 Q 105 98 115 92 Q 140 78 168 82`}
          fill="none"
          stroke={colors.headOutline}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Palate fill (roof of mouth) */}
        <path
          d={`M 100 108 Q 105 98 115 92 Q 140 78 168 82
              Q 155 85 140 88 Q 120 96 108 105 Z`}
          fill={colors.palate}
          opacity={0.6}
        />

        {/* ── Alveolar ridge (bump) ── */}
        <circle cx={106} cy={103} r={4} fill={colors.palate} stroke={colors.headOutline} strokeWidth={1.2} />

        {/* ── Soft palate / Velum ── */}
        {velumLowered ? (
          <path
            d={`M 168 82 Q 180 88 190 100 Q 195 110 193 118 Q 190 125 186 128`}
            fill="none"
            stroke={colors.headOutline}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ) : (
          <path
            d={`M 168 82 Q 182 86 190 92 Q 198 100 197 108`}
            fill="none"
            stroke={colors.headOutline}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* ── Uvula ── */}
        {!velumLowered && (
          <ellipse cx={197} cy={112} rx={3} ry={5} fill={colors.palate} stroke={colors.headOutline} strokeWidth={1} />
        )}
        {velumLowered && (
          <ellipse cx={186} cy={132} rx={3} ry={5} fill={colors.palate} stroke={colors.headOutline} strokeWidth={1} />
        )}

        {/* ── Pharynx (back wall) ── */}
        <path
          d={`M 200 80 Q 210 100 210 130 Q 208 160 200 180`}
          fill="none"
          stroke={colors.headOutline}
          strokeWidth={1.8}
        />

        {/* ── Head profile outline ── */}
        <path
          d={`M 68 55
              Q 62 65 65 72
              L 68 72
              Q 60 82 62 92
              L 82 95
              L 75 108
              ${isBilabial
                ? `Q 68 112 68 118 L 68 118 Q 68 125 68 130 L 68 135`
                : isLabiodental
                  ? `Q 68 112 68 116 L 68 118 Q 68 122 70 128 Q 72 132 68 135`
                  : `Q 68 112 65 118 Q 62 125 65 135`
              }
              Q 72 142 78 145
              Q 88 158 95 172
              Q 110 190 140 195
              Q 170 198 200 180`}
          fill="none"
          stroke={colors.headOutline}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Forehead/top of head to nape (light, for context) ── */}
        <path
          d={`M 68 55 Q 75 25 120 15 Q 170 10 210 30 Q 230 45 225 70 Q 220 90 210 100`}
          fill="none"
          stroke={colors.headOutline}
          strokeWidth={1.2}
          opacity={0.4}
        />

        {/* ── Upper teeth ── */}
        <rect x={82} y={110} width={6} height={12} rx={1}
          fill={colors.teeth} stroke={colors.teethBorder} strokeWidth={0.8} />
        <rect x={89} y={111} width={5} height={10} rx={1}
          fill={colors.teeth} stroke={colors.teethBorder} strokeWidth={0.8} />

        {/* ── Lower teeth ── */}
        <rect x={84} y={132} width={5} height={10} rx={1}
          fill={colors.teeth} stroke={colors.teethBorder} strokeWidth={0.8} />
        <rect x={90} y={133} width={5} height={9} rx={1}
          fill={colors.teeth} stroke={colors.teethBorder} strokeWidth={0.8} />

        {/* ── Floor of mouth ── */}
        <path
          d={`M 95 160 Q 120 168 150 170 Q 175 170 195 165 Q 202 175 200 180`}
          fill="none"
          stroke={colors.headOutline}
          strokeWidth={1.5}
          opacity={0.5}
        />

        {/* ── Tongue ── */}
        {info?.type === "consonant" && (
          <path
            d={consonantTonguePath(info.place)}
            fill={colors.tongue}
            stroke={colors.tongueDark}
            strokeWidth={1.5}
            opacity={0.85}
          />
        )}
        {info?.type === "vowel" && (
          <path
            d={tonguePath(info.pos.height, info.pos.front)}
            fill={colors.tongue}
            stroke={colors.tongueDark}
            strokeWidth={1.5}
            opacity={0.85}
          />
        )}
        {info?.type === "diphthong" && (
          <>
            {/* Show "from" position tongue in lighter shade */}
            <path
              d={tonguePath(info.from.height, info.from.front)}
              fill={colors.tongue}
              stroke={colors.tongueDark}
              strokeWidth={1}
              opacity={0.35}
              strokeDasharray="3 2"
            />
            {/* Show "to" position tongue solid */}
            <path
              d={tonguePath(info.to.height, info.to.front)}
              fill={colors.tongue}
              stroke={colors.tongueDark}
              strokeWidth={1.5}
              opacity={0.85}
            />
          </>
        )}
        {!info && (
          <path
            d={tonguePath(0.55, 0.4)}
            fill={colors.tongue}
            stroke={colors.tongueDark}
            strokeWidth={1.5}
            opacity={0.85}
          />
        )}

        {/* ── Contact point for consonants ── */}
        {info?.type === "consonant" && (() => {
          const cp = contactPoint(info.place);
          if (!cp) return null;
          return (
            <circle cx={cp[0]} cy={cp[1]} r={4}
              fill={colors.contact} opacity={0.7} />
          );
        })()}

        {/* ── Bilabial: lips pressed together indicator ── */}
        {isBilabial && (
          <line x1={63} y1={126} x2={73} y2={126}
            stroke={colors.contact} strokeWidth={3} strokeLinecap="round" />
        )}

        {/* ── Labiodental: upper teeth on lower lip ── */}
        {isLabiodental && (
          <path d="M 82 116 L 78 122 L 86 122 Z"
            fill={colors.teeth} stroke={colors.teethBorder} strokeWidth={0.8} />
        )}

        {/* ── Rounded lips indicator ── */}
        {roundLips && (
          <ellipse cx={64} cy={126} rx={3} ry={8}
            fill="none" stroke={colors.contact} strokeWidth={1.5} opacity={0.6} />
        )}

        {/* ── Nasal airflow (for nasals) ── */}
        {isNasal && (
          <g>
            <path
              d="M 140 60 Q 120 45 95 42 L 70 48"
              fill="none"
              stroke={colors.airPurple}
              strokeWidth={2}
              strokeDasharray="4 3"
              markerEnd="url(#arrowPurple)"
            />
            <text x={105} y={40} fontSize={9} fill={colors.airPurple} textAnchor="middle"
              fontFamily="system-ui, sans-serif">鼻腔气流</text>
          </g>
        )}

        {/* ── Oral airflow (for non-nasals) ── */}
        {info?.type === "consonant" && !isNasal && info.place !== "glottal" && (
          <path
            d="M 100 126 Q 80 126 55 126"
            fill="none"
            stroke={colors.airBlue}
            strokeWidth={1.8}
            strokeDasharray="4 3"
            markerEnd="url(#arrowBlue)"
            opacity={0.7}
          />
        )}

        {/* ── Glottal airflow ── */}
        {info?.type === "consonant" && info.place === "glottal" && (
          <path
            d="M 200 170 Q 180 150 140 130 Q 100 120 55 126"
            fill="none"
            stroke={colors.airBlue}
            strokeWidth={1.8}
            strokeDasharray="4 3"
            markerEnd="url(#arrowBlue)"
            opacity={0.7}
          />
        )}

        {/* ── Labels with leader lines ── */}
        {info?.type === "consonant" && (() => {
          const lp = labelPos(info.place);
          return (
            <g>
              <line
                x1={lp.lineTarget[0]} y1={lp.lineTarget[1]}
                x2={lp.x} y2={lp.y - 4}
                stroke={colors.leaderLine}
                strokeWidth={0.8}
                strokeDasharray="2 2"
              />
              <text
                x={lp.x} y={lp.y}
                textAnchor={lp.anchor}
                fontSize={11}
                fill={colors.label}
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
              >
                {info.label}
              </text>
            </g>
          );
        })()}

        {/* ── Vowel position indicator ── */}
        {info?.type === "vowel" && (() => {
          const tx = 88 + info.pos.front * 80;
          const ty = 108 + info.pos.height * 48;
          return (
            <g>
              <circle cx={tx} cy={ty - 10} r={5}
                fill={colors.contact} opacity={0.5} />
              <text x={tx} y={ty - 22}
                textAnchor="middle" fontSize={10} fill={colors.label}
                fontWeight={600} fontFamily="system-ui, sans-serif">
                {info.label}
              </text>
            </g>
          );
        })()}

        {/* ── Diphthong arrow ── */}
        {info?.type === "diphthong" && (() => {
          const fx = 88 + info.from.front * 80;
          const fy = 98 + info.from.height * 48;
          const tx = 88 + info.to.front * 80;
          const ty = 98 + info.to.height * 48;
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2 - 15;
          return (
            <g>
              <circle cx={fx} cy={fy} r={4} fill={colors.contact} opacity={0.5} />
              <path
                d={`M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}`}
                fill="none"
                stroke={colors.contact}
                strokeWidth={1.8}
                strokeDasharray="4 3"
                markerEnd="url(#arrowRed)"
              />
              <text x={mx} y={my - 8}
                textAnchor="middle" fontSize={10} fill={colors.label}
                fontWeight={600} fontFamily="system-ui, sans-serif">
                {info.label}
              </text>
            </g>
          );
        })()}

        {/* ── Static anatomy labels (small, subtle) ── */}
        <g opacity={0.5} fontFamily="system-ui, sans-serif" fontSize={8} fill={colors.label}>
          <text x={138} y={72}>硬腭</text>
          <text x={188} y={80}>软腭</text>
          <text x={130} y={62}>鼻腔</text>
          <text x={215} y={140}>咽</text>
        </g>

      </svg>
    </div>
  );
}
