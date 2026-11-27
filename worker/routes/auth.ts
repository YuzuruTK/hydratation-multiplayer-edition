import { deleteCurrentSession, createSession, expiredSessionCookie, sessionCookie, type AuthenticatedUser } from '../lib/auth';
import { hashPassword, randomHex, sha256Hex, verifyPassword } from '../lib/crypto';
import { HttpError, json, readJson, requireInteger, requireString } from '../lib/http';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dummyPasswordHash =
  'scrypt$16384$8$5$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000';

function normalizeEmail(value: unknown): string {
  const email = requireString(value, 'email', 3, 254).toLowerCase();
  if (!emailPattern.test(email)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Informe um endereço de e-mail válido.');
  }
  return email;
}

function passwordValue(value: unknown, minimum: number): string {
  if (typeof value !== 'string' || value.length < minimum || value.length > 128) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'A senha deve ter entre ' + minimum + ' e 128 caracteres.',
    );
  }
  return value;
}

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

export async function register(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const name = requireString(body.name, 'name', 1, 60);
  const email = normalizeEmail(body.email);
  const password = passwordValue(body.password, 8);
  const weightKg = body.weightKg === undefined ? 70 : requireInteger(body.weightKg, 'weightKg', 30, 250);
  const heightCm = body.heightCm === undefined ? 170 : requireInteger(body.heightCm, 'heightCm', 100, 250);
  const dailyGoalMl = Math.min(6000, Math.round(weightKg * 35));
  const userId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const passwordHash = await hashPassword(password);

  try {
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO users (id, name, email, password_hash, weight_kg, height_cm, daily_goal_ml, created_at) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ).bind(userId, name, email, passwordHash, weightKg, heightCm, dailyGoalMl, now),
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
      env.DB.prepare(
        'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      ).bind(sessionId, userId, tokenHash, expiresAt, now),
      env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.toLowerCase().includes('unique')) {
      throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'Já existe uma conta com esse e-mail.');
    }
    throw error;
  }

  const user: AuthenticatedUser = { id: userId, name, email, weightKg, heightCm, dailyGoalMl };
  return json({ user: userResponse(user) }, 201, { 'Set-Cookie': sessionCookie(token) });
}

export async function login(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = passwordValue(body.password, 1);

  const record = await env.DB.prepare(
    'SELECT id, name, email, password_hash AS passwordHash, ' +
    'weight_kg AS weightKg, height_cm AS heightCm, daily_goal_ml AS dailyGoalMl ' +
    'FROM users WHERE email = ? LIMIT 1',
  ).bind(email).first<AuthenticatedUser & { passwordHash: string }>();

  const valid = await verifyPassword(password, record?.passwordHash ?? dummyPasswordHash);
  if (!record || !valid) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
  }

  const token = await createSession(env.DB, record.id);
  const user: AuthenticatedUser = {
    id: record.id,
    name: record.name,
    email: record.email,
    weightKg: record.weightKg,
    heightCm: record.heightCm,
    dailyGoalMl: record.dailyGoalMl,
  };
  return json({ user: userResponse(user) }, 200, { 'Set-Cookie': sessionCookie(token) });
}

export async function logout(request: Request, env: Env): Promise<Response> {
  await deleteCurrentSession(request, env.DB);
  return json({ success: true }, 200, { 'Set-Cookie': expiredSessionCookie() });
}
