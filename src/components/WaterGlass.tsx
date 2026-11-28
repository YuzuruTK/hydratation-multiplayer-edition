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
  // Fireball-style whisky bottle: short neck, sloped shoulders, broad rounded body.
  const dragonadePath = 'M52 18 H88 V48 C88 54 94 59 101 65 Q112 74 112 88 V148 Q112 166 94 166 H46 Q28 166 28 148 V88 Q28 74 39 65 C46 59 52 54 52 48 Z';
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
          ? 154 - 0.84 * fill
          : 153 - 1.05 * fill;
  const waterHeight = isDrop
    ? 1.35 * fill + 4
    : isPotion
      ? 0.82 * fill + 4
      : isChalice
        ? 0.64 * fill + 4
        : isDragonade
          ? 0.84 * fill + 4
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
        <path className="vessel-outline" d={vesselPath} />
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
            <path className="vessel-rim" d="M52 18 H88 M52 48 H88" />
            <rect className="dragonade-cap" x="49" y="7" width="42" height="15" rx="3" />
            <path className="vessel-highlight" d="M40 82 L38 143 Q38 155 49 159" />
            <rect className="dragonade-label" x="36" y="78" width="68" height="66" rx="5" />
            <path className="dragonade-devil" d="M48 105 C40 96 40 88 42 83 C50 85 56 90 59 95 C66 92 74 92 81 95 C84 90 90 85 98 83 C100 88 100 96 92 105 C98 113 97 123 91 130 C85 136 77 140 70 140 C63 140 55 136 49 130 C43 123 42 113 48 105 Z" />
            <path className="dragonade-devil-face" d="M54 114 Q60 109 66 115 L63 120 Z M74 115 Q80 109 86 114 L77 120 Z M59 127 Q70 132 81 127 Q77 136 70 136 Q63 136 59 127 Z" />
            <path className="dragonade-devil-horn" d="M47 102 L40 95 L42 108 M93 102 L100 95 L98 108" />
          </>
        ) : (
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
