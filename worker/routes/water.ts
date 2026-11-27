import type { AuthenticatedUser } from '../lib/auth';
import { getTodayRange } from '../lib/time';
import { HttpError, json, readJson, requireString } from '../lib/http';

interface WaterLogRow {
  id: string;
  containerId: string | null;
  containerName: string;
  amountMl: number;
  consumedAt: string;
}

export async function getTodayWater(env: Env, user: AuthenticatedUser): Promise<Response> {
  const timeZone = env.APP_TIME_ZONE || 'America/Sao_Paulo';
  const range = getTodayRange(new Date(), timeZone);
  const result = await env.DB.prepare(
    'SELECT id, container_id AS containerId, container_name_snapshot AS containerName, ' +
    'amount_ml AS amountMl, consumed_at AS consumedAt FROM water_logs ' +
    'WHERE user_id = ? AND consumed_at >= ? AND consumed_at < ? ORDER BY consumed_at DESC',
  ).bind(user.id, range.start, range.end).all<WaterLogRow>();

  const logs = result.results;
  const consumedMl = logs.reduce((total, log) => total + log.amountMl, 0);
  return json({
    date: range.start.slice(0, 10),
    goalMl: user.dailyGoalMl,
    consumedMl,
    remainingMl: Math.max(user.dailyGoalMl - consumedMl, 0),
    progressPercent: user.dailyGoalMl > 0 ? Math.round((consumedMl / user.dailyGoalMl) * 100) : 0,
    logs,
  });
}

export async function createWaterLog(
  request: Request,
  env: Env,
  user: AuthenticatedUser,
): Promise<Response> {
  const body = await readJson(request);
  const containerId = requireString(body.containerId, 'containerId', 1, 80);
  const container = await env.DB.prepare(
    'SELECT id, name, volume_ml AS amountMl FROM containers ' +
    'WHERE id = ? AND user_id = ? LIMIT 1',
  ).bind(containerId, user.id).first<{ id: string; name: string; amountMl: number }>();

  if (!container) throw new HttpError(404, 'CONTAINER_NOT_FOUND', 'Recipiente não encontrado.');

  const log: WaterLogRow = {
    id: crypto.randomUUID(),
    containerId: container.id,
    containerName: container.name,
    amountMl: container.amountMl,
    consumedAt: new Date().toISOString(),
  };

  await env.DB.prepare(
    'INSERT INTO water_logs (id, user_id, container_id, container_name_snapshot, amount_ml, consumed_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(log.id, user.id, log.containerId, log.containerName, log.amountMl, log.consumedAt).run();

  return json({ log }, 201);
}

export async function removeWaterLog(
  env: Env,
  user: AuthenticatedUser,
  logId: string,
): Promise<Response> {
  const result = await env.DB.prepare(
    'DELETE FROM water_logs WHERE id = ? AND user_id = ?',
  ).bind(logId, user.id).run();

  if (result.meta.changes === 0) {
    throw new HttpError(404, 'WATER_LOG_NOT_FOUND', 'Registro de consumo não encontrado.');
  }
  return json({ success: true });
}
