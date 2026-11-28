import { useId } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface WaterGlassProps {
  progress: number;
  consumedMl: number;
  goalMl: number;
}

export default function WaterGlass({ progress, consumedMl, goalMl }: WaterGlassProps) {
  const { theme, config: themeConfig } = useTheme();
  const fill = Math.max(0, Math.min(progress, 100));
  const clipId = useId();
  const isDrop = themeConfig.vessel === 'droplet';
  const isPotion = themeConfig.vessel === 'potion';
  const isChalice = themeConfig.vessel === 'chalice';
  const isDragonade = themeConfig.vessel === 'fireball-bottle';

  const dropPath = 'M70 8 C60 27 23 66 23 105 C23 139 43 161 70 161 C97 161 117 139 117 105 C117 66 80 27 70 8 Z';
  const rocksPath = 'M28 34 H112 L106 153 Q105 164 94 164 H46 Q35 164 34 153 Z';
  // Same tall Fireball-inspired silhouette used by the standalone bottle artwork.
  const dragonadePath = 'M292 165 H476 L471 350 Q470 392 495 421 L535 466 Q556 488 582 507 L665 568 Q735 620 744 700 V1847 Q744 1940 660 1952 Q384 1985 108 1952 Q24 1940 24 1847 V700 Q33 620 103 568 L186 507 Q212 488 233 466 L273 421 Q298 392 297 350 Z';
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
          ? 1952 - 12.52 * fill
          : 153 - 1.05 * fill;
  const waterHeight = isDrop
    ? 1.35 * fill + 4
    : isPotion
      ? 0.82 * fill + 4
      : isChalice
        ? 0.64 * fill + 4
        : isDragonade
          ? 12.52 * fill + 4
          : 1.05 * fill + 4;

  return (
    <div
      className={`water-glass-wrap hydration-vessel hydration-vessel--${theme}`}
      aria-label={consumedMl + ' de ' + goalMl + ' mililitros'}
      role="img"
    >
      <svg className="hydration-vessel-art" viewBox={isDragonade ? "-32 -85 832 2218" : "0 0 140 200"} aria-hidden="true">
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
        {!isDragonade && <path className="vessel-outline" d={vesselPath} />}
        <g clipPath={`url(#${clipId}-shape)`}>
          <rect className="vessel-water" x={isDragonade ? 24 : 18} y={waterTop} width={isDragonade ? 720 : 104} height={waterHeight} fill={`url(#${clipId}-water)`} />
          {!isDragonade && <path className="vessel-water-shine" d={isDrop ? 'M30 106 Q50 99 70 106 T110 106' : isPotion ? 'M25 112 Q70 103 115 112' : isChalice ? 'M34 65 Q70 59 106 65' : 'M36 86 Q70 79 104 86'} />}
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
            {/* Garrafa transparente: apenas contornos pretos; o líquido indica o progresso. */}
            {themeConfig.artwork?.vesselAsset && (
              <image href={themeConfig.artwork.vesselAsset} x="0" y="0" width="768" height="2048" />
            )}
            {/* Mascote preto e transparente, posicionado pela configuração do tema. */}
            {themeConfig.artwork?.mascotAsset && themeConfig.artwork.mascotPlacement && (
              <image
                href={themeConfig.artwork.mascotAsset}
                x={themeConfig.artwork.mascotPlacement.x}
                y={themeConfig.artwork.mascotPlacement.y}
                width={themeConfig.artwork.mascotPlacement.width}
                height={themeConfig.artwork.mascotPlacement.height}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          </>
        ) : (
          <>
            <path className="vessel-rim" d="M28 34 H112" />
            <path className="vessel-highlight" d="M43 47 L40 139" />
            <path className="drink-garnish" d="M87 35 L103 20 M91 28 L99 32" />
            <circle className="drink-garnish" cx="103" cy="20" r="8" />
          </>
        )}
        {!isDragonade && <ellipse className="vessel-shadow" cx="70" cy="183" rx="42" ry="7" />}
      </svg>
    </div>
  );
}
