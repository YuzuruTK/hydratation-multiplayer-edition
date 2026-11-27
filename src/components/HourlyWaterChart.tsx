import type { WaterLog } from '../types';

interface HourlyWaterChartProps {
  logs: WaterLog[];
}

const WIDTH = 720;
const HEIGHT = 220;
const LEFT = 42;
const RIGHT = 14;
const TOP = 18;
const BOTTOM = 38;
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

function smoothLine(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const deltaY = point.y - previous.y;
    // Keep each cubic segment inside its endpoints so the cumulative curve never dips.
    const control1 = { x: previous.x + (point.x - previous.x) / 3, y: previous.y + deltaY / 3 };
    const control2 = { x: point.x - (point.x - previous.x) / 3, y: point.y - deltaY / 3 };
    return `${path} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${point.x} ${point.y}`;
  }, '');
}

export default function HourlyWaterChart({ logs }: HourlyWaterChartProps) {
  const hourlyTotals = Array.from({ length: 24 }, () => 0);
  for (const log of logs) hourlyTotals[new Date(log.consumedAt).getHours()] += log.amountMl;

  const cumulativeTotals = hourlyTotals.map((amount, hour) =>
    hourlyTotals.slice(0, hour + 1).reduce((sum, value) => sum + value, 0),
  );
  const total = cumulativeTotals[cumulativeTotals.length - 1];
  const scaleMax = Math.max(250, Math.ceil(total / 250) * 250);
  const points = cumulativeTotals.map((amount, hour) => ({
    x: LEFT + (hour / 23) * PLOT_WIDTH,
    y: TOP + PLOT_HEIGHT - (amount / scaleMax) * PLOT_HEIGHT,
  }));
  const linePath = smoothLine(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${TOP + PLOT_HEIGHT} L ${points[0].x} ${TOP + PLOT_HEIGHT} Z`;
  const gridValues = [scaleMax, scaleMax / 2, 0];

  return (
    <div className="hourly-chart-card">
      <div className="hourly-chart-summary">
        <strong>{total.toLocaleString('pt-BR')} <span>ml</span></strong>
        <span className="hourly-chart-peak">Acumulado ao longo do dia</span>
      </div>
      <div className="hourly-chart-visual">
        <svg className="hourly-line-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Água ingerida acumulada ao longo do dia, hoje">
          <defs>
            <linearGradient id="hourly-chart-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity=".24" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridValues.map((value) => {
            const y = TOP + PLOT_HEIGHT - (value / scaleMax) * PLOT_HEIGHT;
            return (
              <g key={value}>
                <line x1={LEFT} x2={WIDTH - RIGHT} y1={y} y2={y} className="hourly-chart-gridline" />
                <text x={LEFT - 10} y={y + 4} textAnchor="end" className="hourly-chart-y-label">{value === 0 ? '0' : value.toLocaleString('pt-BR')}</text>
              </g>
            );
          })}
          <path d={areaPath} fill="url(#hourly-chart-area)" />
          <path d={linePath} className="hourly-chart-line" />
          {points.map((point, hour) => cumulativeTotals[hour] > 0 ? (
            <circle key={hour} cx={point.x} cy={point.y} r="4" className="hourly-chart-point">
              <title>{String(hour).padStart(2, '0')}h · {cumulativeTotals[hour].toLocaleString('pt-BR')} ml acumulados</title>
            </circle>
          ) : null)}
          {[0, 4, 8, 12, 16, 20, 23].map((hour) => (
            <text key={hour} x={points[hour].x} y={HEIGHT - 10} textAnchor={hour === 0 ? 'start' : hour === 23 ? 'end' : 'middle'} className="hourly-chart-x-label">{String(hour).padStart(2, '0')}h</text>
          ))}
        </svg>
      </div>
      {total === 0 && <p className="hourly-chart-empty">Seus registros de hoje aparecerão aqui por horário.</p>}
    </div>
  );
}
