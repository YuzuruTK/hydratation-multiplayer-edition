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

  const dropPath = 'M70 8 C60 27 23 66 23 105 C23 139 43 161 70 161 C97 161 117 139 117 105 C117 66 80 27 70 8 Z';
  const rocksPath = 'M28 34 H112 L106 153 Q105 164 94 164 H46 Q35 164 34 153 Z';
  const potionPath = 'M53 18 H87 V42 L102 57 Q112 67 112 83 V143 Q112 157 98 157 H42 Q28 157 28 143 V83 Q28 67 38 57 L53 42 Z';

  const vesselPath = isDrop ? dropPath : isPotion ? potionPath : rocksPath;
  const waterTop = isDrop ? 161 - 1.35 * fill : isPotion ? 143 - 1.1 * fill : 153 - 1.05 * fill;
  const waterHeight = isDrop ? 1.35 * fill + 4 : isPotion ? 1.1 * fill + 4 : 1.05 * fill + 4;

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
          <rect className="vessel-water" x="20" y={waterTop} width="100" height={waterHeight} fill={`url(#${clipId}-water)`} />
          <path className="vessel-water-shine" d={isDrop ? 'M30 106 Q50 99 70 106 T110 106' : isPotion ? 'M32 88 Q70 81 108 88' : 'M36 86 Q70 79 104 86'} />
        </g>
        {isDrop ? (
          <path className="vessel-highlight" d="M54 47 C42 69 35 88 35 105" />
        ) : isPotion ? (
          <>
            <path className="potion-neck" d="M53 18 H87 V42 L102 57 Q112 67 112 83 V143 Q112 157 98 157 H42 Q28 157 28 143 V83 Q28 67 38 57 L53 42 Z" />
            <rect className="potion-cork" x="51" y="7" width="38" height="16" rx="4" />
            <path className="potion-highlight" d="M42 76 V133 Q42 140 48 140" />
            <circle className="potion-bubble" cx="86" cy="115" r="4" />
            <circle className="potion-bubble" cx="59" cy="128" r="2.5" />
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
