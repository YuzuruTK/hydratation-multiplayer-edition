import type { AuthenticatedUser } from '../lib/auth';
import { HttpError, json, readJson, requireInteger, requireString } from '../lib/http';

export function getProfile(user: AuthenticatedUser): Response {
  return json({ user });
}

export async function updateProfile(
  request: Request,
  env: Env,
  user: AuthenticatedUser,
): Promise<Response> {
  const body = await readJson(request);
  if (Object.keys(body).length === 0) {
    throw new HttpError(400, 'EMPTY_UPDATE', 'Informe ao menos um campo para atualizar.');
  }

  const name = body.name === undefined ? user.name : requireString(body.name, 'name', 1, 60);
  const weightKg = body.weightKg === undefined
    ? user.weightKg
    : requireInteger(body.weightKg, 'weightKg', 30, 250);
  const heightCm = body.heightCm === undefined
    ? user.heightCm
    : requireInteger(body.heightCm, 'heightCm', 100, 250);
  const dailyGoalMl = body.dailyGoalMl === undefined
    ? user.dailyGoalMl
    : requireInteger(body.dailyGoalMl, 'dailyGoalMl', 300, 6000);

  await env.DB.prepare(
    'UPDATE users SET name = ?, weight_kg = ?, height_cm = ?, daily_goal_ml = ? WHERE id = ?',
  ).bind(name, weightKg, heightCm, dailyGoalMl, user.id).run();

  const updated = await env.DB.prepare(
    'SELECT id, name, email, weight_kg AS weightKg, height_cm AS heightCm, ' +
    'daily_goal_ml AS dailyGoalMl FROM users WHERE id = ? LIMIT 1',
  ).bind(user.id).first<AuthenticatedUser>();

  if (!updated) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
  return json({ user: updated });
}
