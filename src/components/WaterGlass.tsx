import { useId } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface WaterGlassProps {
  progress: number;
  consumedMl: number;
  goalMl: number;
}

export default function WaterGlass({ progress, consumedMl, goalMl }: WaterGlassProps) {
  const { theme } = useTheme();
  const fill = Math.max(0, Math.min(progress, 100));
  const clipId = useId();
  const isDrop = theme === 'ocean';
  const isPotion = theme === 'ocean-green';
  const isChalice = theme === 'dracula';
  const isDragonade = theme === 'dragonade';

  const dropPath = 'M70 8 C60 27 23 66 23 105 C23 139 43 161 70 161 C97 161 117 139 117 105 C117 66 80 27 70 8 Z';
  const rocksPath = 'M28 34 H112 L106 153 Q105 164 94 164 H46 Q35 164 34 153 Z';
  // Fireball bottle silhouette: red-cap neck, sloping shoulders, broad squared body.
  const dragonadePath = 'M48 24 H92 V53 Q92 62 104 70 L126 91 Q135 99 135 114 V174 Q135 192 117 192 H23 Q5 192 5 174 V114 Q5 99 14 91 L36 70 Q48 62 48 53 Z';
  // Round, classic RPG potion flask with a narrow neck and bulbous glass body.
  const potionPath = 'M55 18 H85 V57 C107 66 120 86 120 111 C120 140 98 162 70 162 C42 162 20 140 20 111 C20 86 33 66 55 57 Z';
  // Elegant fantasy chalice: wide bowl, narrow stem, and a broad foot.
  const chalicePath = 'M31 35 H109 C108 65 101 91 83 107 L77 112 V151 H91 Q101 151 101 161 V166 H39 V161 Q39 151 49 151 H63 V112 L57 107 C39 91 32 65 31 35 Z';

  const vesselPath = isDrop ? dropPath : isPotion ? potionPath : isChalice ? chalicePath : isDragonade ? dragonadePath : rocksPath;
  const waterTop = isDrop
    ? 161 - 1.35 * fill
    : isPotion
      ? 151 - 0.82 * fill
      : isChalice
        ? 103 - 0.64 * fill
        : isDragonade
          ? 192 - 0.88 * fill
          : 153 - 1.05 * fill;
  const waterHeight = isDrop
    ? 1.35 * fill + 4
    : isPotion
      ? 0.82 * fill + 4
      : isChalice
        ? 0.64 * fill + 4
        : isDragonade
          ? 0.88 * fill + 4
          : 1.05 * fill + 4;

  return (
    <div
      className={`water-glass-wrap hydration-vessel hydration-vessel--${theme}`}
      aria-label={consumedMl + ' de ' + goalMl + ' mililitros'}
      role="img"
    >
      <svg className="hydration-vessel-art" viewBox="0 0 140 200" aria-hidden="true">
        <defs>
          <linearGradient id={`${clipId}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-water-start)" />
            <stop offset="55%" stopColor="var(--color-water-mid)" />
            <stop offset="100%" stopColor="var(--color-water-end)" />
          </linearGradient>
          <clipPath id={`${clipId}-shape`}>
            <path d={vesselPath} />
          </clipPath>
        </defs>
        <path className={isDragonade ? "vessel-outline dragonade-bottle" : "vessel-outline"} d={vesselPath} />
        <g clipPath={`url(#${clipId}-shape)`}>
          <rect className="vessel-water" x="18" y={waterTop} width="104" height={waterHeight} fill={`url(#${clipId}-water)`} />
          <path
            className="vessel-water-shine"
            d={isDrop ? 'M30 106 Q50 99 70 106 T110 106' : isPotion ? 'M25 112 Q70 103 115 112' : isChalice ? 'M34 65 Q70 59 106 65' : isDragonade ? 'M36 100 Q70 93 104 100' : 'M36 86 Q70 79 104 86'}
          />
        </g>
        {isDrop ? (
          <path className="vessel-highlight" d="M54 47 C42 69 35 88 35 105" />
        ) : isPotion ? (
          <>
            <path className="potion-neck" d="M55 18 H85 V57 C107 66 120 86 120 111 C120 140 98 162 70 162 C42 162 20 140 20 111 C20 86 33 66 55 57 Z" />
            <rect className="potion-cork" x="54" y="7" width="32" height="15" rx="4" />
            <path className="potion-highlight" d="M43 91 C35 107 35 129 40 141 Q43 148 50 149" />
            <circle className="potion-bubble" cx="91" cy="122" r="4" />
            <circle className="potion-bubble" cx="64" cy="137" r="2.8" />
            <circle className="potion-bubble" cx="78" cy="106" r="2" />
          </>
        ) : isChalice ? (
          <>
            <path className="vessel-rim" d="M29 35 H111" />
            <path className="vessel-highlight" d="M43 43 C46 70 53 88 64 98 M73 116 V149" />
            <path className="vessel-highlight" d="M57 108 L70 119 L83 108 M49 160 H91" />
            <path className="vessel-highlight" d="M38 42 H50 M90 42 H102" />
          </>
        ) : isDragonade ? (
          <>
            {/* Red screw cap and the small neck band/logo area. */}
            <rect className="dragonade-cap" x="44" y="3" width="52" height="24" rx="8" />
            <path className="dragonade-cap-ridge" d="M46 8 H94 M46 13 H94 M46 18 H94" />
            <path className="dragonade-neck-band" d="M48 43 H92 V66 H48 Z" />
            <path className="dragonade-neck-flame" d="M54 54 Q60 45 65 52 Q70 44 76 51 Q82 46 87 55 Q81 54 77 60 Q70 56 64 61 Q59 56 54 54 Z" />
            <path className="vessel-highlight" d="M39 83 L17 106 Q12 113 12 126 V171 Q12 183 25 186" />
            <path className="dragonade-label-edge" d="M20 98 Q29 94 36 98 Q48 94 58 98 Q70 94 82 98 Q94 94 105 98 L119 101 L120 177 Q109 181 99 178 Q87 182 75 178 Q62 182 50 178 Q37 182 25 178 Z" />
            <path className="dragonade-label" d="M24 102 Q32 98 39 102 Q50 98 60 102 Q72 98 83 102 Q95 98 106 102 L115 105 L116 173 Q106 177 96 174 Q84 178 73 174 Q61 178 49 174 Q37 178 27 174 Z" />
            <text className="dragonade-wordmark" x="70" y="117" textAnchor="middle" textLength="82" lengthAdjust="spacingAndGlyphs">FIREBALL</text>
            {/* Full-body running devil with flame trail, curled tail and fire breath. */}
            <path className="dragonade-flame" d="M35 128 Q27 119 20 121 Q26 126 20 131 Q29 130 34 136 L45 137 Q37 132 35 128 Z M48 130 Q41 123 37 125 L43 132 L51 135 Z" />
            <path className="dragonade-devil" d="M55 131 Q48 124 49 119 L43 114 L45 108 L53 113 L58 120 Q67 117 73 122 L80 119 L85 124 L77 130 L68 132 L65 140 L75 148 L89 150 L93 155 L83 158 L68 155 L56 148 L52 140 Z" />
            <path className="dragonade-devil" d="M58 137 L49 145 L42 153 L37 151 L43 141 L52 132 Z M67 141 L76 137 L84 139 L88 144 L82 147 L75 145 L69 149 Z" />
            <path className="dragonade-devil" d="M53 119 L49 110 L44 104 L48 102 L55 107 L60 115 Z M65 120 L70 111 L77 108 L82 111 L77 116 L72 123 Z" />
            <path className="dragonade-devil-horn" d="M51 114 L47 106 L54 110 M69 114 L76 106 L73 113" />
            <path className="dragonade-devil-face" d="M55 116 L60 118 L56 120 Z M66 118 L71 116 L68 121 Z M59 124 Q64 127 69 123" />
            <path className="dragonade-devil-tail" d="M44 151 Q33 151 34 160 Q35 168 43 164 Q47 161 43 158" />
            <path className="dragonade-devil" d="M57 146 L51 157 L58 162 L68 160 L73 155 L68 152 Z M75 151 L84 158 L82 164 L76 162 L70 157 Z" />
            <path className="dragonade-wordmark-small" d="M32 169 H108" />
            <text className="dragonade-small-copy" x="70" y="168" textAnchor="middle">CINNAMON WHISKY</text>
            <text className="dragonade-small-copy" x="70" y="176" textAnchor="middle">RED HOT</text>
          </>        ) : (
          <>
            <path className="vessel-rim" d="M28 34 H112" />
            <path className="vessel-highlight" d="M43 47 L40 139" />
            <path className="drink-garnish" d="M87 35 L103 20 M91 28 L99 32" />
            <circle className="drink-garnish" cx="103" cy="20" r="8" />
          </>
        )}
        <ellipse className="vessel-shadow" cx="70" cy="183" rx="42" ry="7" />
      </svg>
    </div>
  );
}
