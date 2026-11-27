import { randomHex, sha256Hex } from './crypto';
import { HttpError } from './http';

const COOKIE_NAME = 'hydratation_session';
const SESSION_DAYS = 30;

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  weightKg: number;
  heightCm: number;
  dailyGoalMl: number;
}

export async function createSession(db: D1Database, userId: string): Promise<string> {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await db.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
  ).bind(crypto.randomUUID(), userId, tokenHash, expiresAt, now.toISOString()).run();

  return token;
}

export function sessionCookie(token: string): string {
  return [
    COOKIE_NAME + '=' + token,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=' + (SESSION_DAYS * 24 * 60 * 60),
  ].join('; ');
}

export function expiredSessionCookie(): string {
  return [
    COOKIE_NAME + '=',
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ');
}

function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    if (name === COOKIE_NAME) return part.slice(separator + 1).trim() || null;
  }
  return null;
}

export async function getAuthenticatedUser(
  request: Request,
  db: D1Database,
): Promise<AuthenticatedUser | null> {
  const token = getSessionToken(request);
  if (!token || token.length > 128) return null;

  const tokenHash = await sha256Hex(token);
  return db.prepare(
    'SELECT u.id, u.name, u.email, ' +
    'u.weight_kg AS weightKg, u.height_cm AS heightCm, ' +
    'u.daily_goal_ml AS dailyGoalMl ' +
    'FROM sessions s INNER JOIN users u ON u.id = s.user_id ' +
    'WHERE s.token_hash = ? AND s.expires_at > ? LIMIT 1',
  ).bind(tokenHash, new Date().toISOString()).first<AuthenticatedUser>();
}

export async function requireAuthenticatedUser(
  request: Request,
  db: D1Database,
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request, db);
  if (!user) throw new HttpError(401, 'UNAUTHORIZED', 'Faça login para continuar.');
  return user;
}

export async function deleteCurrentSession(request: Request, db: D1Database): Promise<void> {
  const token = getSessionToken(request);
  if (!token || token.length > 128) return;
  const tokenHash = await sha256Hex(token);
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
}
