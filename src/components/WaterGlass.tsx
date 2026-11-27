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

  const dropPath = 'M70 8 C60 27 23 66 23 105 C23 139 43 161 70 161 C97 161 117 139 117 105 C117 66 80 27 70 8 Z';
  const rocksPath = 'M28 34 H112 L106 153 Q105 164 94 164 H46 Q35 164 34 153 Z';
  // Round, classic RPG potion flask with a narrow neck and bulbous glass body.
  const potionPath = 'M57 18 H83 V49 L96 62 C111 77 119 94 119 116 V137 C119 153 107 163 91 163 H49 C33 163 21 153 21 137 V116 C21 94 29 77 44 62 L57 49 Z';
  // Elegant fantasy chalice: wide bowl, narrow stem, and a broad foot.
  const chalicePath = 'M31 35 H109 C108 65 101 91 83 107 L77 112 V151 H91 Q101 151 101 161 V166 H39 V161 Q39 151 49 151 H63 V112 L57 107 C39 91 32 65 31 35 Z';

  const vesselPath = isDrop ? dropPath : isPotion ? potionPath : isChalice ? chalicePath : rocksPath;
  const waterTop = isDrop
    ? 161 - 1.35 * fill
    : isPotion
      ? 151 - 0.82 * fill
      : isChalice
        ? 103 - 0.64 * fill
        : 153 - 1.05 * fill;
  const waterHeight = isDrop
    ? 1.35 * fill + 4
    : isPotion
      ? 0.82 * fill + 4
      : isChalice
        ? 0.64 * fill + 4
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
            d={isDrop ? 'M30 106 Q50 99 70 106 T110 106' : isPotion ? 'M25 112 Q70 103 115 112' : isChalice ? 'M34 65 Q70 59 106 65' : 'M36 86 Q70 79 104 86'}
          />
        </g>
        {isDrop ? (
          <path className="vessel-highlight" d="M54 47 C42 69 35 88 35 105" />
        ) : isPotion ? (
          <>
            <path className="potion-neck" d="M57 18 H83 V49 L96 62 C111 77 119 94 119 116 V137 C119 153 107 163 91 163 H49 C33 163 21 153 21 137 V116 C21 94 29 77 44 62 L57 49 Z" />
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
