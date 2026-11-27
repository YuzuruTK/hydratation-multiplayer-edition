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
            {theme === 'ocean' ? (
              <path d="M70 8 C60 27 23 66 23 105 C23 139 43 161 70 161 C97 161 117 139 117 105 C117 66 80 27 70 8 Z" />
            ) : (
              <path d="M22 28 H118 L77 94 V157 H63 V94 Z" />
            )}
          </clipPath>
        </defs>
        {theme === 'ocean' ? (
          <>
            <path className="vessel-outline" d="M70 8 C60 27 23 66 23 105 C23 139 43 161 70 161 C97 161 117 139 117 105 C117 66 80 27 70 8 Z" />
            <g clipPath={`url(#${clipId}-shape)`}>
              <rect className="vessel-water" x="20" y={161 - 1.35 * fill} width="100" height={1.35 * fill + 4} fill={`url(#${clipId}-water)`} />
              <path className="vessel-water-shine" d="M30 106 Q50 99 70 106 T110 106" />
            </g>
            <path className="vessel-highlight" d="M54 47 C42 69 35 88 35 105" />
          </>
        ) : (
          <>
            <path className="vessel-outline" d="M22 28 H118 L77 94 V157 H63 V94 Z" />
            <g clipPath={`url(#${clipId}-shape)`}>
              <rect className="vessel-water" x="20" y={157 - 1.25 * fill} width="100" height={1.25 * fill + 4} fill={`url(#${clipId}-water)`} />
              <path className="vessel-water-shine" d="M35 70 Q70 63 105 70" />
            </g>
            <path className="vessel-stem" d="M70 94 V157 M48 169 H92" />
            <path className="vessel-highlight" d="M35 36 H53" />
          </>
        )}
        <ellipse className="vessel-shadow" cx="70" cy="183" rx="42" ry="7" />
      </svg>
    </div>
  );
}
