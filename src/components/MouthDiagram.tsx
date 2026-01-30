"use client";

import React from "react";

interface MouthDiagramProps {
  symbolId: string;
  size?: number;
}

/**
 * Front-view mouth diagram showing lip shape, teeth, and tongue position.
 * Much more intuitive than a sagittal cross-section — like looking in a mirror.
 */

interface MouthShape {
  // Lip shape
  lipWidth: number;      // 0-1, how wide the lips spread
  lipHeight: number;     // 0-1, how open the mouth is
  lipRound: boolean;     // rounded lips (like /uː/, /oʊ/)
  // Teeth
  showTopTeeth: boolean;
  showBottomTeeth: boolean;
  teethOnLip: boolean;   // upper teeth on lower lip (like /f/, /v/)
  // Tongue
  tongueVisible: boolean;
  tonguePosition: "tip-out" | "tip-up" | "tip-behind-teeth" | "flat" | "back" | "mid" | "high-front" | "low" | "curled" | "none";
  // Extra
  label: string;         // Chinese description shown below
  airflow?: "out" | "nose" | "sides"; // airflow direction
}

const symbolToMouth: Record<string, MouthShape> = {
  // === CONSONANTS ===
  // Bilabials /p/ /b/ /m/ — lips pressed together
  "c-p": { lipWidth: 0.5, lipHeight: 0, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "none", label: "双唇紧闭，突然弹开", airflow: "out" },
  "c-b": { lipWidth: 0.5, lipHeight: 0, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "none", label: "双唇紧闭，振动喉咙", airflow: "out" },
  "c-m": { lipWidth: 0.5, lipHeight: 0, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "none", label: "双唇闭合，气从鼻子出", airflow: "nose" },
  // Labiodental /f/ /v/ — teeth on lip
  "c-f": { lipWidth: 0.6, lipHeight: 0.15, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: true, tongueVisible: false, tonguePosition: "none", label: "上齿轻咬下唇，吹气" },
  "c-v": { lipWidth: 0.6, lipHeight: 0.15, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: true, tongueVisible: false, tonguePosition: "none", label: "上齿轻咬下唇，振动" },
  // Dental /θ/ /ð/ — tongue between teeth
  "c-theta": { lipWidth: 0.6, lipHeight: 0.2, lipRound: false, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: true, tonguePosition: "tip-out", label: "舌尖伸出上下齿之间" },
  "c-eth": { lipWidth: 0.6, lipHeight: 0.2, lipRound: false, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: true, tonguePosition: "tip-out", label: "舌尖伸出齿间，振动" },
  // Alveolar /t/ /d/ /n/ /s/ /z/ /l/
  "c-t": { lipWidth: 0.5, lipHeight: 0.15, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "tip-up", label: "舌尖抵住上齿龈" },
  "c-d": { lipWidth: 0.5, lipHeight: 0.15, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "tip-up", label: "舌尖抵住上齿龈，振动" },
  "c-n": { lipWidth: 0.5, lipHeight: 0.15, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "tip-up", label: "舌尖抵上齿龈，气从鼻出", airflow: "nose" },
  "c-s": { lipWidth: 0.55, lipHeight: 0.1, lipRound: false, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: false, tonguePosition: "tip-behind-teeth", label: "牙齿几乎合拢，舌尖靠近齿龈" },
  "c-z": { lipWidth: 0.55, lipHeight: 0.1, lipRound: false, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: false, tonguePosition: "tip-behind-teeth", label: "同 /s/ 但振动喉咙" },
  "c-l": { lipWidth: 0.5, lipHeight: 0.2, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "tip-up", label: "舌尖抵上齿龈，气从两侧出", airflow: "sides" },
  // Post-alveolar /ʃ/ /ʒ/ /tʃ/ /dʒ/ /r/
  "c-sh": { lipWidth: 0.45, lipHeight: 0.2, lipRound: true, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: false, tonguePosition: "tip-behind-teeth", label: "嘴唇微圆突出，像说「嘘」" },
  "c-zh": { lipWidth: 0.45, lipHeight: 0.2, lipRound: true, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: false, tonguePosition: "tip-behind-teeth", label: "同 /ʃ/ 但振动喉咙" },
  "c-ch": { lipWidth: 0.45, lipHeight: 0.2, lipRound: true, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: false, tonguePosition: "tip-behind-teeth", label: "嘴唇圆突，先堵再放" },
  "c-j": { lipWidth: 0.45, lipHeight: 0.2, lipRound: true, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: false, tonguePosition: "tip-behind-teeth", label: "同 /tʃ/ 但振动喉咙" },
  "c-r": { lipWidth: 0.45, lipHeight: 0.2, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "curled", label: "嘴唇微圆，舌尖卷起不碰任何地方" },
  // Velar /k/ /ɡ/ /ŋ/
  "c-k": { lipWidth: 0.5, lipHeight: 0.3, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "back", label: "舌根抬起碰软腭" },
  "c-g": { lipWidth: 0.5, lipHeight: 0.3, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "back", label: "舌根碰软腭，振动喉咙" },
  "c-ng": { lipWidth: 0.5, lipHeight: 0.3, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "back", label: "舌根碰软腭，气从鼻出", airflow: "nose" },
  // Glottal /h/
  "c-h": { lipWidth: 0.55, lipHeight: 0.35, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "none", label: "嘴自然张开，从喉咙哈气", airflow: "out" },
  // Palatal /j/
  "c-y": { lipWidth: 0.6, lipHeight: 0.15, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "high-front", label: "嘴微开，舌面抬向上腭" },
  // Labiovelar /w/
  "c-w": { lipWidth: 0.3, lipHeight: 0.25, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "back", label: "嘴唇收圆突出，像吹口哨" },

  // === VOWELS ===
  // High front /iː/ /ɪ/
  "v-ii": { lipWidth: 0.7, lipHeight: 0.1, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "high-front", label: "嘴角用力向两边拉，像微笑" },
  "v-i": { lipWidth: 0.6, lipHeight: 0.15, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "high-front", label: "比 /iː/ 稍放松，嘴不用拉那么开" },
  // Mid front /e/
  "v-e": { lipWidth: 0.6, lipHeight: 0.2, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "mid", label: "嘴半开，舌中高位" },
  // Low front /æ/
  "v-ae": { lipWidth: 0.65, lipHeight: 0.45, lipRound: false, showTopTeeth: true, showBottomTeeth: true, teethOnLip: false, tongueVisible: true, tonguePosition: "low", label: "嘴大张，舌头放平压低" },
  // Central /ʌ/ /ə/ /ɜː/
  "v-uh": { lipWidth: 0.5, lipHeight: 0.3, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "mid", label: "嘴自然半开，很放松的「啊」" },
  "v-schwa": { lipWidth: 0.45, lipHeight: 0.2, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "mid", label: "最放松的音，嘴巴几乎不动" },
  "v-er": { lipWidth: 0.4, lipHeight: 0.2, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "curled", label: "嘴微圆，舌尖稍卷起" },
  // Back /ɒ/ /ɔː/
  "v-o": { lipWidth: 0.4, lipHeight: 0.4, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "low", label: "嘴圆张大，像说「噢」" },
  "v-oo": { lipWidth: 0.35, lipHeight: 0.35, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "back", label: "嘴圆形，舌后部抬高" },
  // High back /uː/ /ʊ/
  "v-uu": { lipWidth: 0.25, lipHeight: 0.2, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "back", label: "嘴唇收成小圆形，像吹蜡烛" },
  "v-u": { lipWidth: 0.3, lipHeight: 0.2, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: false, tonguePosition: "back", label: "嘴稍圆，比 /uː/ 更放松" },
  // Low back /ɑː/
  "v-aa": { lipWidth: 0.5, lipHeight: 0.5, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "low", label: "嘴张到最大，像医生叫你说「啊」" },

  // === DIPHTHONGS ===
  "d-ei": { lipWidth: 0.6, lipHeight: 0.25, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "mid", label: "从「诶」滑到「一」，嘴逐渐收小" },
  "d-ai": { lipWidth: 0.55, lipHeight: 0.4, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "low", label: "从大张「啊」滑到「一」" },
  "d-oi": { lipWidth: 0.4, lipHeight: 0.35, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "back", label: "从圆嘴「噢」滑到扁嘴「一」" },
  "d-au": { lipWidth: 0.55, lipHeight: 0.4, lipRound: false, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "low", label: "从大张「啊」滑到圆嘴「乌」" },
  "d-ou": { lipWidth: 0.4, lipHeight: 0.3, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "mid", label: "从「欧」滑到圆嘴「乌」" },
  "d-ie": { lipWidth: 0.55, lipHeight: 0.2, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "high-front", label: "从「一」滑到「额」" },
  "d-ea": { lipWidth: 0.6, lipHeight: 0.25, lipRound: false, showTopTeeth: true, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "mid", label: "从「诶」滑到「额」" },
  "d-ua": { lipWidth: 0.35, lipHeight: 0.25, lipRound: true, showTopTeeth: false, showBottomTeeth: false, teethOnLip: false, tongueVisible: true, tonguePosition: "back", label: "从圆嘴「乌」滑到「额」" },
};

// Default fallback
const defaultMouth: MouthShape = {
  lipWidth: 0.5, lipHeight: 0.3, lipRound: false,
  showTopTeeth: false, showBottomTeeth: false, teethOnLip: false,
  tongueVisible: false, tonguePosition: "none", label: "自然张开",
};

export default function MouthDiagram({ symbolId, size = 200 }: MouthDiagramProps) {
  const mouth = symbolToMouth[symbolId] || defaultMouth;
  const w = size;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;

  // Lip dimensions based on parameters
  const lipW = w * 0.3 + (w * 0.35 * mouth.lipWidth);
  const lipH = h * 0.05 + (h * 0.35 * mouth.lipHeight);
  const lipRx = mouth.lipRound ? lipW * 0.5 : lipW * 0.6;
  const lipRy = lipH * 0.5;

  // Colors
  const lipColor = "#E8787A";
  const lipOutline = "#C4494C";
  const skinColor = "#FDDCB5";
  const teethColor = "#FFFFFF";
  const teethOutline = "#DDD";
  const tongueColor = "#E85D6F";
  const insideColor = "#8B2040";

  // Teeth dimensions
  const teethW = lipW * 0.7;
  const toothW = teethW / 6;
  const toothH = Math.min(lipH * 0.3, h * 0.06);

  // Tongue
  const tongueW = lipW * 0.55;
  const tongueBaseY = cy + lipH * 0.15;

  const renderTongue = () => {
    if (!mouth.tongueVisible) return null;

    switch (mouth.tonguePosition) {
      case "tip-out": // /θ/ /ð/ — tongue sticking out between teeth
        return (
          <ellipse cx={cx} cy={cy - toothH * 0.3} rx={tongueW * 0.4} ry={toothH * 0.8}
            fill={tongueColor} stroke="#C44A5C" strokeWidth={1} />
        );
      case "tip-up": // /t/ /d/ /n/ /l/ — tongue tip touching top
        return (
          <path d={`M ${cx - tongueW * 0.5} ${tongueBaseY + lipH * 0.15}
            Q ${cx} ${cy - lipH * 0.35} ${cx + tongueW * 0.5} ${tongueBaseY + lipH * 0.15}`}
            fill={tongueColor} stroke="#C44A5C" strokeWidth={1} />
        );
      case "curled": // /r/ /ɜː/ — tongue curled up
        return (
          <path d={`M ${cx - tongueW * 0.4} ${tongueBaseY + lipH * 0.1}
            Q ${cx - tongueW * 0.1} ${cy - lipH * 0.1} ${cx} ${cy - lipH * 0.2}
            Q ${cx + tongueW * 0.1} ${cy - lipH * 0.1} ${cx + tongueW * 0.4} ${tongueBaseY + lipH * 0.1}`}
            fill={tongueColor} stroke="#C44A5C" strokeWidth={1} />
        );
      case "high-front": // /iː/ /j/ — tongue high and forward
        return (
          <path d={`M ${cx - tongueW * 0.5} ${tongueBaseY + lipH * 0.1}
            Q ${cx} ${cy - lipH * 0.25} ${cx + tongueW * 0.5} ${tongueBaseY + lipH * 0.1}`}
            fill={tongueColor} stroke="#C44A5C" strokeWidth={1} />
        );
      case "back": // /k/ /ɡ/ /uː/ — tongue back raised
        return (
          <ellipse cx={cx} cy={tongueBaseY + lipH * 0.05} rx={tongueW * 0.45} ry={lipH * 0.15}
            fill={tongueColor} stroke="#C44A5C" strokeWidth={1} />
        );
      case "low": // /æ/ /ɑː/ — tongue flat and low
        return (
          <ellipse cx={cx} cy={tongueBaseY + lipH * 0.2} rx={tongueW * 0.5} ry={lipH * 0.08}
            fill={tongueColor} stroke="#C44A5C" strokeWidth={1} />
        );
      case "mid": // /e/ /ə/ — tongue mid position
        return (
          <ellipse cx={cx} cy={tongueBaseY + lipH * 0.1} rx={tongueW * 0.4} ry={lipH * 0.1}
            fill={tongueColor} stroke="#C44A5C" strokeWidth={1} />
        );
      default:
        return null;
    }
  };

  const renderTeeth = () => {
    const teeth: React.ReactNode[] = [];
    const startX = cx - teethW / 2;

    if (mouth.showTopTeeth) {
      for (let i = 0; i < 6; i++) {
        const x = startX + i * toothW;
        const y = mouth.teethOnLip ? cy - lipH * 0.1 : cy - lipH * 0.35;
        teeth.push(
          <rect key={`top-${i}`} x={x + 1} y={y} width={toothW - 2} height={toothH}
            rx={2} fill={teethColor} stroke={teethOutline} strokeWidth={0.5} />
        );
      }
    }

    if (mouth.showBottomTeeth) {
      for (let i = 0; i < 6; i++) {
        const x = startX + i * toothW;
        const y = cy + lipH * 0.15;
        teeth.push(
          <rect key={`bot-${i}`} x={x + 1} y={y} width={toothW - 2} height={toothH}
            rx={2} fill={teethColor} stroke={teethOutline} strokeWidth={0.5} />
        );
      }
    }

    return teeth;
  };

  const renderAirflow = () => {
    if (!mouth.airflow) return null;
    const arrowColor = mouth.airflow === "nose" ? "#9B7BDB" : "#5BA4E6";

    if (mouth.airflow === "nose") {
      return (
        <g>
          <path d={`M ${cx - 3} ${cy - lipH * 0.5 - 8} L ${cx - 3} ${cy - lipH * 0.5 - 25}`}
            stroke={arrowColor} strokeWidth={2} markerEnd="url(#arrowNose)" />
          <path d={`M ${cx + 3} ${cy - lipH * 0.5 - 8} L ${cx + 3} ${cy - lipH * 0.5 - 25}`}
            stroke={arrowColor} strokeWidth={2} />
          <text x={cx} y={cy - lipH * 0.5 - 28} textAnchor="middle" fontSize={8} fill={arrowColor} fontWeight="bold">👃</text>
        </g>
      );
    }

    if (mouth.airflow === "sides") {
      return (
        <g>
          <path d={`M ${cx - lipW * 0.3} ${cy} L ${cx - lipW * 0.55} ${cy}`}
            stroke={arrowColor} strokeWidth={2} markerEnd="url(#arrowOut)" />
          <path d={`M ${cx + lipW * 0.3} ${cy} L ${cx + lipW * 0.55} ${cy}`}
            stroke={arrowColor} strokeWidth={2} markerEnd="url(#arrowOut)" />
        </g>
      );
    }

    // "out" — forward airflow
    return (
      <path d={`M ${cx} ${cy + lipH * 0.3} L ${cx} ${cy + lipH * 0.3 + 18}`}
        stroke={arrowColor} strokeWidth={2} markerEnd="url(#arrowOut)" />
    );
  };

  // Closed mouth (bilabials)
  if (mouth.lipHeight === 0) {
    return (
      <div className="flex flex-col items-center">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <marker id="arrowNose" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 Z" fill="#9B7BDB" transform="rotate(-90, 3, 3)" />
            </marker>
          </defs>
          {/* Face circle */}
          <circle cx={cx} cy={cy} r={w * 0.4} fill={skinColor} stroke="#E8C9A0" strokeWidth={1.5} />
          {/* Closed lips — horizontal line */}
          <path d={`M ${cx - lipW * 0.45} ${cy}
            Q ${cx - lipW * 0.2} ${cy - 3} ${cx} ${cy}
            Q ${cx + lipW * 0.2} ${cy - 3} ${cx + lipW * 0.45} ${cy}`}
            fill="none" stroke={lipOutline} strokeWidth={2.5} strokeLinecap="round" />
          {/* Upper lip curve */}
          <path d={`M ${cx - lipW * 0.45} ${cy}
            Q ${cx - lipW * 0.15} ${cy - 6} ${cx} ${cy - 3}
            Q ${cx + lipW * 0.15} ${cy - 6} ${cx + lipW * 0.45} ${cy}`}
            fill={lipColor} stroke={lipOutline} strokeWidth={1} />
          {/* Lower lip curve */}
          <path d={`M ${cx - lipW * 0.45} ${cy}
            Q ${cx} ${cy + 5} ${cx + lipW * 0.45} ${cy}`}
            fill={lipColor} stroke={lipOutline} strokeWidth={1} />
          {renderAirflow()}
        </svg>
        <span className="text-xs text-[#7C83FD] font-medium mt-1 text-center max-w-[160px]">{mouth.label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <marker id="arrowOut" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#5BA4E6" />
          </marker>
          <marker id="arrowNose" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,6 L3,0 L6,6 Z" fill="#9B7BDB" />
          </marker>
        </defs>
        {/* Face circle */}
        <circle cx={cx} cy={cy} r={w * 0.4} fill={skinColor} stroke="#E8C9A0" strokeWidth={1.5} />
        {/* Mouth opening (dark inside) */}
        <ellipse cx={cx} cy={cy} rx={lipRx} ry={lipRy}
          fill={insideColor} />
        {/* Tongue */}
        {renderTongue()}
        {/* Teeth */}
        {renderTeeth()}
        {/* Lips — outer ring */}
        <ellipse cx={cx} cy={cy} rx={lipRx + 4} ry={lipRy + 4}
          fill="none" stroke={lipColor} strokeWidth={8} opacity={0.8} />
        <ellipse cx={cx} cy={cy} rx={lipRx + 4} ry={lipRy + 4}
          fill="none" stroke={lipOutline} strokeWidth={1.5} />
        {/* Upper lip cupid's bow */}
        {!mouth.lipRound && (
          <path d={`M ${cx - lipRx * 0.3} ${cy - lipRy - 2}
            Q ${cx} ${cy - lipRy - 6} ${cx + lipRx * 0.3} ${cy - lipRy - 2}`}
            fill={lipColor} stroke={lipOutline} strokeWidth={0.5} />
        )}
        {/* Airflow arrows */}
        {renderAirflow()}
      </svg>
      <span className="text-xs text-[#7C83FD] font-medium mt-1 text-center max-w-[160px]">{mouth.label}</span>
    </div>
  );
}
