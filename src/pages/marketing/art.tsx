import type { ReactNode } from "react";

type ArtFn = (a: string, s: string, i: string, b: string) => ReactNode;

export const ART: Record<string, ArtFn> = {
  office: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="300" y="36" width="140" height="150" rx="8" fill={b} />
      <path d="M370 36v150M300 111h140" stroke={s} strokeWidth="7" />
      <rect x="30" y="252" width="420" height="16" rx="5" fill={i} />
      <rect x="64" y="268" width="12" height="92" fill={i} />
      <rect x="404" y="268" width="12" height="92" fill={i} />
      <rect x="150" y="146" width="176" height="106" rx="9" fill={i} />
      <rect x="160" y="156" width="156" height="86" rx="4" fill={a} />
      <rect x="174" y="170" width="74" height="9" rx="4" fill={b} />
      <rect x="174" y="188" width="112" height="6" rx="3" fill={b} opacity=".65" />
      <rect x="174" y="204" width="54" height="16" rx="5" fill={b} />
      <rect x="58" y="206" width="44" height="46" rx="6" fill={a} />
      <ellipse cx="70" cy="184" rx="13" ry="30" fill="#3E8E5A" transform="rotate(-20 70 184)" />
      <ellipse cx="92" cy="182" rx="13" ry="32" fill="#2F7A4B" transform="rotate(18 92 182)" />
      <rect x="356" y="222" width="30" height="30" rx="6" fill={b} />
      <path d="M386 230h8a7 7 0 010 14h-8" stroke={b} strokeWidth="4" fill="none" />
    </>
  ),
  agency: (a, s, i, _b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="170" cy="190" r="118" fill={a} />
      <rect x="226" y="66" width="176" height="176" fill={i} transform="rotate(12 314 154)" />
      <circle cx="352" cy="262" r="56" fill="none" stroke={a} strokeWidth="16" />
      <rect x="60" y="56" width="90" height="12" rx="6" fill={i} opacity=".9" />
      <rect x="60" y="78" width="56" height="12" rx="6" fill={i} opacity=".5" />
      <path d="M250 300l40-60 40 60z" fill={i} opacity=".9" />
    </>
  ),
  tools: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <path d="M90 320V178L220 82l130 96v142z" fill={b} />
      <path d="M70 186L220 74l150 112" stroke={i} strokeWidth="14" fill="none" strokeLinejoin="round" />
      <rect x="190" y="230" width="60" height="90" rx="6" fill={a} />
      <rect x="120" y="196" width="50" height="44" rx="4" fill={s} />
      <rect x="270" y="196" width="50" height="44" rx="4" fill={s} />
      <g transform="rotate(-38 392 150)">
        <rect x="378" y="96" width="28" height="170" rx="12" fill={i} />
        <circle cx="392" cy="94" r="36" fill={i} />
        <rect x="380" y="52" width="24" height="44" fill={s} />
      </g>
      <path d="M60 110c0 12 9 20 18 20s18-8 18-20c0-14-18-34-18-34s-18 20-18 34z" fill={a} />
      <path d="M28 160c0 8 6 13 12 13s12-5 12-13c0-9-12-22-12-22s-12 13-12 22z" fill={a} opacity=".7" />
    </>
  ),
  consult: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="80" y="44" width="320" height="272" rx="10" fill={b} />
      <path d="M120 270h250M120 220h250M120 170h250M120 120h250" stroke={s} strokeWidth="3" />
      <rect x="132" y="210" width="30" height="60" fill={s} />
      <rect x="182" y="186" width="30" height="84" fill={s} />
      <rect x="232" y="160" width="30" height="110" fill={s} />
      <rect x="282" y="132" width="30" height="138" fill={s} />
      <path
        d="M130 236L196 196l52 18 70-86 44-24"
        stroke={a}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="362" cy="104" r="10" fill={a} />
      <rect x="120" y="70" width="120" height="12" rx="6" fill={i} />
      <g transform="rotate(32 410 250)">
        <rect x="400" y="170" width="16" height="130" rx="6" fill={i} />
        <path d="M400 300h16l-8 20z" fill={a} />
      </g>
    </>
  ),
  app: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="230" y="26" width="160" height="320" rx="26" fill={i} />
      <rect x="240" y="40" width="140" height="292" rx="16" fill={b} />
      <rect x="254" y="60" width="70" height="10" rx="5" fill={i} />
      <rect x="254" y="86" width="112" height="56" rx="10" fill={a} />
      <rect x="266" y="100" width="50" height="8" rx="4" fill={b} />
      <rect x="266" y="116" width="80" height="12" rx="4" fill={b} />
      <rect x="254" y="156" width="112" height="24" rx="6" fill={s} />
      <rect x="254" y="188" width="112" height="24" rx="6" fill={s} />
      <rect x="254" y="220" width="112" height="24" rx="6" fill={s} />
      <g transform="rotate(-8 150 200)">
        <rect x="70" y="120" width="170" height="190" rx="12" fill={b} />
        <rect x="88" y="140" width="80" height="10" rx="5" fill={i} />
        <rect x="88" y="162" width="130" height="6" rx="3" fill={i} opacity=".35" />
        <rect x="88" y="176" width="110" height="6" rx="3" fill={i} opacity=".35" />
        <rect x="88" y="210" width="130" height="1.5" fill={i} opacity=".3" />
        <rect x="88" y="226" width="60" height="8" rx="4" fill={i} opacity=".6" />
        <rect x="170" y="222" width="48" height="16" rx="8" fill={a} />
        <rect x="88" y="262" width="130" height="30" rx="8" fill={a} />
      </g>
    </>
  ),
  gallery: (_a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="50" y="50" width="230" height="260" fill={b} />
      <rect x="64" y="64" width="202" height="232" fill="#C9C9C2" />
      <circle cx="210" cy="120" r="22" fill="#F2F2EE" />
      <path d="M64 296l70-110 46 64 34-40 52 86z" fill={i} />
      <rect x="300" y="50" width="130" height="120" fill={b} />
      <rect x="312" y="62" width="106" height="96" fill="#9B9B94" />
      <path d="M312 158l40-50 30 34 36-22v38z" fill={i} opacity=".85" />
      <rect x="300" y="190" width="130" height="120" fill={b} />
      <rect x="312" y="202" width="106" height="96" fill="#D8D8D2" />
      <rect x="340" y="222" width="50" height="76" fill={i} opacity=".8" />
    </>
  ),
  clinic: (a, s, _i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="240" cy="180" r="128" fill={b} />
      <path
        d="M240 108c-14-8-24-12-40-12-34 0-54 24-54 62 0 32 12 54 20 86 6 24 14 40 26 40 14 0 14-44 48-44s34 44 48 44c12 0 20-16 26-40 8-32 20-54 20-86 0-38-20-62-54-62-16 0-26 4-40 12z"
        fill={b}
        stroke={a}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <path d="M196 140c-12 4-18 14-18 28" stroke={a} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".5" />
      <g fill={a}>
        <path d="M372 70h10v18h18v10h-18v18h-10v-18h-18V88h18z" />
        <circle cx="96" cy="252" r="8" />
        <circle cx="392" cy="270" r="6" />
        <circle cx="110" cy="86" r="5" />
      </g>
    </>
  ),
  food: (a, s, _i, _b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="230" cy="185" r="138" fill="#3A2A20" />
      <circle cx="230" cy="185" r="118" fill="#F4EBDD" />
      <circle cx="230" cy="185" r="92" fill="#EADBC4" />
      <circle cx="204" cy="164" r="44" fill={a} />
      <circle cx="262" cy="206" r="36" fill="#B5462B" />
      <circle cx="252" cy="148" r="22" fill="#F1E3C8" />
      <ellipse cx="190" cy="222" rx="24" ry="12" fill="#5C8A3A" transform="rotate(-24 190 222)" />
      <ellipse cx="282" cy="160" rx="16" ry="8" fill="#5C8A3A" transform="rotate(30 282 160)" />
      <circle cx="214" cy="150" r="5" fill="#F7EBDD" />
      <circle cx="196" cy="176" r="4" fill="#F7EBDD" />
      <rect x="396" y="70" width="14" height="230" rx="7" fill="#C9B79C" />
      <ellipse cx="403" cy="70" rx="20" ry="30" fill="#C9B79C" />
      <circle cx="70" cy="300" r="34" fill="#3A2A20" />
      <circle cx="70" cy="300" r="24" fill={a} opacity=".8" />
    </>
  ),
  launch: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="40" y="44" width="400" height="272" rx="16" fill={b} />
      <rect x="64" y="68" width="90" height="10" rx="5" fill={i} opacity=".8" />
      <rect x="64" y="90" width="60" height="22" rx="6" fill={a} />
      <rect x="300" y="68" width="116" height="24" rx="12" fill={s} />
      <path d="M64 262l50-36 46 14 52-50 46 22 56-58 62-26v134H64z" fill={a} opacity=".28" />
      <path
        d="M64 262l50-36 46 14 52-50 46 22 56-58 62-26"
        stroke={a}
        strokeWidth="5"
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="376" cy="128" r="8" fill={a} />
      <path d="M64 292h352" stroke={i} strokeOpacity=".15" strokeWidth="2" />
    </>
  ),
  law: (a, s, i, _b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="226" y="70" width="28" height="210" rx="6" fill={i} />
      <rect x="160" y="280" width="160" height="22" rx="6" fill={i} />
      <rect x="110" y="96" width="260" height="12" rx="6" fill={i} />
      <circle cx="240" cy="70" r="16" fill={a} />
      <path d="M130 108l-40 90h80z" fill="none" stroke={i} strokeWidth="5" />
      <path d="M350 108l-40 90h80z" fill="none" stroke={i} strokeWidth="5" />
      <path d="M84 198a46 22 0 0092 0z" fill={a} />
      <path d="M304 198a46 22 0 0092 0z" fill={a} />
    </>
  ),
  home: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="390" cy="70" r="30" fill={a} opacity=".6" />
      <rect x="0" y="300" width="480" height="60" fill="#5C8A3A" opacity=".55" />
      <path d="M110 300V170l110-80 110 80v130z" fill={b} />
      <path d="M90 178L220 82l130 96" stroke={i} strokeWidth="14" fill="none" strokeLinejoin="round" />
      <rect x="196" y="226" width="48" height="74" rx="4" fill={a} />
      <rect x="138" y="190" width="40" height="36" rx="3" fill={s} />
      <rect x="262" y="190" width="40" height="36" rx="3" fill={s} />
      <rect x="378" y="220" width="12" height="80" fill="#6B4A2E" />
      <circle cx="384" cy="200" r="40" fill="#3E8E5A" />
    </>
  ),
  fit: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="240" cy="180" r="130" fill={b} />
      <rect x="120" y="170" width="240" height="20" rx="8" fill={i} />
      <rect x="128" y="130" width="26" height="100" rx="8" fill={a} />
      <rect x="96" y="146" width="26" height="68" rx="8" fill={a} />
      <rect x="326" y="130" width="26" height="100" rx="8" fill={a} />
      <rect x="358" y="146" width="26" height="68" rx="8" fill={a} />
      <path d="M200 250h80l10 40h-100z" fill={i} opacity=".8" />
      <circle cx="240" cy="246" r="24" fill="none" stroke={i} strokeWidth="8" opacity=".8" />
    </>
  ),
  beauty: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <ellipse cx="200" cy="160" rx="90" ry="110" fill={b} stroke={i} strokeWidth="10" />
      <rect x="190" y="268" width="20" height="60" fill={i} />
      <rect x="150" y="320" width="100" height="14" rx="7" fill={i} />
      <path d="M160 120c20-30 60-30 80 0" stroke={a} strokeWidth="6" fill="none" strokeLinecap="round" opacity=".7" />
      <rect x="330" y="150" width="46" height="120" rx="12" fill={a} />
      <rect x="342" y="128" width="22" height="26" rx="4" fill={i} />
      <circle cx="384" cy="96" r="6" fill={a} />
      <circle cx="300" cy="80" r="4" fill={a} />
    </>
  ),
  heart: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="240" cy="180" r="130" fill={b} />
      <path d="M240 270s-90-52-90-118c0-32 24-52 50-52 18 0 32 10 40 24 8-14 22-24 40-24 26 0 50 20 50 52 0 66-90 118-90 118z" fill={a} />
      <path d="M110 250c30 20 70 30 130 30s100-10 130-30" stroke={i} strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="96" cy="100" r="8" fill={a} opacity=".6" />
      <circle cx="392" cy="110" r="6" fill={a} opacity=".6" />
    </>
  ),
  music: (a, s, i, _b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="210" cy="190" r="130" fill={i} />
      <circle cx="210" cy="190" r="100" fill="none" stroke={s} strokeWidth="2" opacity=".4" />
      <circle cx="210" cy="190" r="74" fill="none" stroke={s} strokeWidth="2" opacity=".4" />
      <circle cx="210" cy="190" r="44" fill={a} />
      <circle cx="210" cy="190" r="8" fill={s} />
      <path d="M370 70v120a24 24 0 11-14-22V90l60-14v94a24 24 0 11-14-22V64z" fill={a} />
    </>
  ),
  edu: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <path d="M60 140l180-70 180 70-180 70z" fill={i} />
      <path d="M130 168v60c0 20 50 40 110 40s110-20 110-40v-60l-110 42z" fill={i} opacity=".85" />
      <rect x="408" y="140" width="6" height="90" fill={a} />
      <circle cx="411" cy="236" r="12" fill={a} />
      <path d="M140 290h100v40H140zM240 290h100v40H240z" fill={b} />
      <path d="M240 290v40" stroke={a} strokeWidth="4" />
    </>
  ),
  event: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="120" y="70" width="240" height="230" rx="18" fill={b} />
      <rect x="120" y="70" width="240" height="60" rx="18" fill={a} />
      <rect x="120" y="110" width="240" height="20" fill={a} />
      <rect x="170" y="52" width="14" height="40" rx="7" fill={i} />
      <rect x="296" y="52" width="14" height="40" rx="7" fill={i} />
      <circle cx="80" cy="90" r="8" fill={a} />
      <rect x="400" y="70" width="14" height="14" fill={i} transform="rotate(20 407 77)" />
      <circle cx="410" cy="270" r="10" fill={a} opacity=".7" />
    </>
  ),
  car: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <rect x="0" y="270" width="480" height="90" fill={i} opacity=".15" />
      <path d="M70 250v-40c0-12 8-20 20-22l50-8 50-50c8-8 18-12 30-12h90c12 0 22 4 30 14l40 48h40c16 0 30 14 30 30v40z" fill={a} />
      <path d="M200 130h60v48h-100zM280 130h40l36 48h-76z" fill={b} opacity=".85" />
      <circle cx="140" cy="258" r="34" fill={i} />
      <circle cx="140" cy="258" r="14" fill={s} />
      <circle cx="350" cy="258" r="34" fill={i} />
      <circle cx="350" cy="258" r="14" fill={s} />
      <rect x="408" y="210" width="20" height="12" rx="4" fill={b} />
    </>
  ),
  pet: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="240" cy="190" r="130" fill={b} />
      <ellipse cx="240" cy="220" rx="54" ry="46" fill={a} />
      <ellipse cx="180" cy="150" rx="22" ry="28" fill={a} />
      <ellipse cx="220" cy="120" rx="22" ry="28" fill={a} />
      <ellipse cx="262" cy="120" rx="22" ry="28" fill={a} />
      <ellipse cx="302" cy="150" rx="22" ry="28" fill={a} />
      <path d="M360 290h70" stroke={i} strokeWidth="14" strokeLinecap="round" />
      <circle cx="356" cy="282" r="10" fill={i} />
      <circle cx="356" cy="298" r="10" fill={i} />
      <circle cx="434" cy="282" r="10" fill={i} />
      <circle cx="434" cy="298" r="10" fill={i} />
    </>
  ),
  travel: (a, s, i, b) => (
    <>
      <rect width="480" height="360" fill={s} />
      <circle cx="360" cy="90" r="40" fill={a} />
      <path d="M0 300l120-140 80 80 70-90 210 150z" fill={i} />
      <path d="M220 210l50-60 40 50" fill={b} opacity=".35" />
      <rect x="0" y="300" width="480" height="60" fill={i} opacity=".85" />
      <path d="M60 110c80-50 160-50 230-20" stroke={b} strokeWidth="4" strokeDasharray="10 10" fill="none" />
      <path d="M300 86l28 8-28 8-6-8z" fill={b} />
    </>
  ),
};
