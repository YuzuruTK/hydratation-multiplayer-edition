interface WaterGlassProps {
  progress: number;
  consumedMl: number;
  goalMl: number;
}

export default function WaterGlass({ progress, consumedMl, goalMl }: WaterGlassProps) {
  const fill = Math.max(0, Math.min(progress, 100));

  return (
    <div className="water-glass-wrap" aria-label={consumedMl + ' de ' + goalMl + ' mililitros'}>
      <div className="glass-sparkle sparkle-one" />
      <div className="glass-sparkle sparkle-two" />
      <div className="water-glass">
        <div className="glass-water" style={{ height: fill + '%' }}>
          <span className="water-wave wave-back" />
          <span className="water-wave wave-front" />
          <span className="water-bubble bubble-one" />
          <span className="water-bubble bubble-two" />
        </div>
        <span className="glass-highlight" />
        <span className="glass-rim" />
      </div>
      <div className="glass-shadow" />
    </div>
  );
}
