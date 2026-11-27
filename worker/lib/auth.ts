import { verifyJwt } from "./crypto";
import { HttpError } from "./http";
export interface AuthenticatedUser {
  id: string; name: string; email: string; weightKg: number; heightCm: number; dailyGoalMl: number;
}
export async function requireAuthenticatedUser(request: Request, env: Env): Promise<AuthenticatedUser> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "AUTH_REQUIRED", "Entre na sua conta para continuar.");
  const payload = await verifyJwt(env.JWT_SECRET, header.slice(7).trim());
  if (!payload) throw new HttpError(401, "INVALID_TOKEN", "Sua sessão expirou. Entre novamente.");
  const user = await env.DB.prepare(
    "SELECT id, name, email, weight_kg AS weightKg, height_cm AS heightCm, daily_goal_ml AS dailyGoalMl FROM users WHERE id = ? LIMIT 1"
  ).bind(payload.sub).first<AuthenticatedUser>();
  if (!user) throw new HttpError(401, "USER_NOT_FOUND", "Conta não encontrada.");
  return user;
}
