import { requireAccessIdentity } from '../lib/access';
import type { AuthenticatedUser } from '../lib/auth';
import { HttpError, json, readJson, requireInteger, requireString } from '../lib/http';

function userResponse(user: AuthenticatedUser): Record<string, unknown> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    dailyGoalMl: user.dailyGoalMl,
  };
}

export async function getAuthSession(request: Request, env: Env): Promise<Response> {
  const identity = await requireAccessIdentity(request, env);
  const user = await env.DB.prepare(
    'SELECT id, name, email, weight_kg AS weightKg, height_cm AS heightCm, ' +
    'daily_goal_ml AS dailyGoalMl FROM users WHERE access_sub = ? LIMIT 1',
  ).bind(identity.sub).first<AuthenticatedUser>();

  if (!user) {
    return json({
      authenticated: true,
      registered: false,
      identity: { email: identity.email },
      user: null,
    });
  }

  return json({
    authenticated: true,
    registered: true,
    identity: { email: identity.email },
    user: userResponse(user),
  });
}

export async function register(request: Request, env: Env): Promise<Response> {
  const identity = await requireAccessIdentity(request, env);
  const body = await readJson(request);
  const name = requireString(body.name, 'name', 1, 60);
  const weightKg = body.weightKg === undefined
    ? 70
    : requireInteger(body.weightKg, 'weightKg', 30, 250);
  const heightCm = body.heightCm === undefined
    ? 170
    : requireInteger(body.heightCm, 'heightCm', 100, 250);
  const dailyGoalMl = Math.min(6000, Math.round(weightKg * 35));
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  const existingBySubject = await env.DB.prepare(
    'SELECT id FROM users WHERE access_sub = ? LIMIT 1',
  ).bind(identity.sub).first<{ id: string }>();
  if (existingBySubject) {
    throw new HttpError(409, 'PROFILE_ALREADY_EXISTS', 'Seu perfil já está cadastrado.');
  }

  const existingByEmail = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
  ).bind(identity.email).first<{ id: string }>();
  if (existingByEmail) {
    throw new HttpError(
      409,
      'EMAIL_ALREADY_REGISTERED',
      'Este e-mail já está associado a outro perfil. Entre em contato com o administrador.',
    );
  }

  try {
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO users (id, access_sub, name, email, weight_kg, height_cm, daily_goal_ml, created_at) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ).bind(userId, identity.sub, name, identity.email, weightKg, heightCm, dailyGoalMl, now),
      env.DB.prepare(
        'INSERT INTO containers (id, user_id, name, volume_ml, kind, created_at) VALUES ' +
        "(?, ?, 'Copo', 200, 'glass', ?), " +
        "(?, ?, 'Garrafa', 500, 'bottle', ?), " +
        "(?, ?, 'Squeeze', 750, 'bottle', ?)",
      ).bind(
        crypto.randomUUID(), userId, now,
        crypto.randomUUID(), userId, now,
        crypto.randomUUID(), userId, now,
      ),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.toLowerCase().includes('unique')) {
      throw new HttpError(409, 'PROFILE_ALREADY_EXISTS', 'Não foi possível criar um segundo perfil para esta identidade.');
    }
    throw error;
  }

  const user: AuthenticatedUser = {
    id: userId,
    name,
    email: identity.email,
    weightKg,
    heightCm,
    dailyGoalMl,
  };
  return json({ user: userResponse(user) }, 201);
}

export function logout(): Response {
  return json({ logoutUrl: '/cdn-cgi/access/logout' });
}
