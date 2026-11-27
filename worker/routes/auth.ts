import { hashPassword, verifyPassword, signJwt } from "../lib/crypto";
import { HttpError, json, readJson, requireInteger, requireString } from "../lib/http";
import type { AuthenticatedUser } from "../lib/auth";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function emailValue(value: unknown): string {
  const email = requireString(value, "email", 3, 254).trim().toLowerCase();
  if (!EMAIL.test(email)) throw new HttpError(400, "INVALID_EMAIL", "Informe um e-mail válido.");
  return email;
}
function passwordValue(value: unknown): string {
  if (typeof value !== "string" || value.length < 8 || value.length > 128) {
    throw new HttpError(400, "INVALID_PASSWORD", "A senha deve ter entre 8 e 128 caracteres.");
  }
  return value;
}
function responseUser(user: AuthenticatedUser) {
  return { id: user.id, name: user.name, email: user.email, weightKg: user.weightKg, heightCm: user.heightCm, dailyGoalMl: user.dailyGoalMl };
}
export async function register(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const name = requireString(body.name, "name", 1, 60);
  const email = emailValue(body.email);
  const password = passwordValue(body.password);
  const weightKg = body.weightKg === undefined ? 70 : requireInteger(body.weightKg, "weightKg", 30, 250);
  const heightCm = body.heightCm === undefined ? 170 : requireInteger(body.heightCm, "heightCm", 100, 250);
  const goal = Math.min(6000, Math.round(weightKg * 35));
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  try {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO users (id, name, email, password_hash, weight_kg, height_cm, daily_goal_ml, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, name, email, passwordHash, weightKg, heightCm, goal, createdAt),
      env.DB.prepare("INSERT INTO containers (id, user_id, name, volume_ml, kind, created_at) VALUES (?, ?, 'Copo', 200, 'glass', ?), (?, ?, 'Garrafa', 500, 'bottle', ?), (?, ?, 'Squeeze', 750, 'bottle', ?)")
        .bind(crypto.randomUUID(), id, createdAt, crypto.randomUUID(), id, createdAt, crypto.randomUUID(), id, createdAt),
    ]);
  } catch (error) {
    if ((error instanceof Error ? error.message : "").toLowerCase().includes("unique")) {
      throw new HttpError(409, "EMAIL_EXISTS", "Este e-mail já está cadastrado.");
    }
    throw error;
  }
  return json({ user: { id, name, email, weightKg, heightCm, dailyGoalMl: goal } }, 201);
}
export async function login(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = emailValue(body.email);
  const password = passwordValue(body.password);
  const user = await env.DB.prepare("SELECT id, name, email, password_hash AS passwordHash, weight_kg AS weightKg, height_cm AS heightCm, daily_goal_ml AS dailyGoalMl FROM users WHERE email = ? LIMIT 1")
    .bind(email).first<AuthenticatedUser & { passwordHash: string }>();
  const dummy = "pbkdf2:100000:AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  const valid = await verifyPassword(password, user?.passwordHash ?? dummy);
  if (!user || !valid) throw new HttpError(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
  const token = await signJwt(env.JWT_SECRET, user.id);
  return json({ token, tokenType: "Bearer", user: responseUser(user) });
}
export async function getAuthSession(request: Request, env: Env): Promise<Response> {
  try {
    const user = await (await import("../lib/auth")).requireAuthenticatedUser(request, env);
    return json({ authenticated: true, user: responseUser(user) });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return json({ authenticated: false, user: null });
    throw error;
  }
}
export function logout(): Response { return json({ success: true }); }
