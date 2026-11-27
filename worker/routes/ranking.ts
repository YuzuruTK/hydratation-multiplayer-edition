import type { AuthenticatedUser } from '../lib/auth';
import { getPeriodRange } from '../lib/time';
import { HttpError, json } from '../lib/http';

type RankingPeriod = 'day' | 'week' | 'month';
interface RankingRow {
  id: string;
  name: string;
  totalMl: number;
}

export async function getRanking(
  request: Request,
  env: Env,
  _user: AuthenticatedUser,
): Promise<Response> {
  const value = new URL(request.url).searchParams.get('period') ?? 'day';
  if (value !== 'day' && value !== 'week' && value !== 'month') {
    throw new HttpError(400, 'INVALID_PERIOD', 'Período inválido. Use day, week ou month.');
  }

  const period = value as RankingPeriod;
  const timeZone = env.APP_TIME_ZONE || 'America/Sao_Paulo';
  const range = getPeriodRange(period, new Date(), timeZone);
  const result = await env.DB.prepare(
    'SELECT u.id, u.name, COALESCE(SUM(w.amount_ml), 0) AS totalMl ' +
    'FROM users u LEFT JOIN water_logs w ON w.user_id = u.id ' +
    'AND w.consumed_at >= ? AND w.consumed_at < ? ' +
    'GROUP BY u.id, u.name ORDER BY totalMl DESC, u.name COLLATE NOCASE ASC LIMIT 100',
  ).bind(range.start, range.end).all<RankingRow>();

  return json({
    period,
    startsAt: range.start,
    endsAt: range.end,
    entries: result.results.map((entry, index) => ({
      position: index + 1,
      id: entry.id,
      name: entry.name,
      totalMl: entry.totalMl,
    })),
  });
}
