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
  // Dragonade Fireball-inspired bottle with a narrow neck and rounded shoulders.
  const dragonadePath = 'M48 12 H92 V52 L108 70 V150 Q108 164 94 164 H46 Q32 164 32 150 V70 L48 52 Z';
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
            <path className="vessel-rim" d="M47 12 H93 M48 52 H92" />
            <path className="vessel-highlight" d="M43 75 L40 143 Q40 153 49 157" />
            <path className="dragonade-devil" d="M48 91 C39 81 38 70 40 64 C49 66 56 72 59 78 C66 75 74 75 81 78 C84 72 91 66 100 64 C102 70 101 81 92 91 C99 101 99 115 92 125 C86 134 77 139 70 139 C63 139 54 134 48 125 C41 115 41 101 48 91 Z" />
            <path className="dragonade-devil-face" d="M53 104 Q60 99 66 105 L63 111 Z M74 105 Q80 99 87 104 L77 111 Z M59 121 Q70 126 81 121 Q77 132 70 132 Q63 132 59 121 Z" />
            <path className="dragonade-devil-horn" d="M47 87 L37 78 L39 96 M93 87 L103 78 L101 96" />
            <path className="dragonade-lime" d="M88 45 L105 27 Q113 34 109 43 L97 51 Z" />
            <path className="dragonade-lime-detail" d="M97 34 L103 44" />
            <circle className="dragonade-sprite-bubble" cx="58" cy="146" r="2.5" />
            <circle className="dragonade-sprite-bubble" cx="83" cy="148" r="2" />
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
