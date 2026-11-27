import type { WaterLog } from '../types';

interface HourlyWaterChartProps {
  logs: WaterLog[];
}

export default function HourlyWaterChart({ logs }: HourlyWaterChartProps) {
  const hourlyTotals = Array.from({ length: 24 }, () => 0);
  for (const log of logs) hourlyTotals[new Date(log.consumedAt).getHours()] += log.amountMl;

  const maxAmount = Math.max(...hourlyTotals, 1);
  const total = hourlyTotals.reduce((sum, amount) => sum + amount, 0);
  const peakHour = hourlyTotals.indexOf(Math.max(...hourlyTotals));
  const peakAmount = hourlyTotals[peakHour];

  return (
    <div className="hourly-chart-card">
      <div className="hourly-chart-summary">
        <strong>{total.toLocaleString('pt-BR')} <span>ml</span></strong>
        {total > 0 && <span className="hourly-chart-peak">Pico às {String(peakHour).padStart(2, '0')}h · {peakAmount.toLocaleString('pt-BR')} ml</span>}
      </div>
      <div className="hourly-chart" role="img" aria-label="Gráfico de consumo de água por hora, hoje">
        {hourlyTotals.map((amount, hour) => (
          <div className="hourly-chart-column" key={hour} title={String(hour).padStart(2, '0') + 'h: ' + amount.toLocaleString('pt-BR') + ' ml'}>
            <div className="hourly-chart-bar-track">
              <div className={amount > 0 ? 'hourly-chart-bar has-value' : 'hourly-chart-bar'} style={{ height: (amount / maxAmount * 100) + '%' }} />
            </div>
            <span className="hourly-chart-label">{hour % 3 === 0 ? String(hour).padStart(2, '0') : ''}</span>
          </div>
        ))}
      </div>
      {total === 0 && <p className="hourly-chart-empty">Seus registros de hoje aparecerão aqui por horário.</p>}
    </div>
  );
}
