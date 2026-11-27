import { requireAccessIdentity } from './access';
import { HttpError } from './http';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  weightKg: number;
  heightCm: number;
  dailyGoalMl: number;
}

export async function requireAuthenticatedUser(
  request: Request,
  env: Env,
): Promise<AuthenticatedUser> {
  const identity = await requireAccessIdentity(request, env);
  const user = await env.DB.prepare(
    'SELECT id, name, email, weight_kg AS weightKg, height_cm AS heightCm, ' +
    'daily_goal_ml AS dailyGoalMl FROM users WHERE access_sub = ? LIMIT 1',
  ).bind(identity.sub).first<AuthenticatedUser>();

  if (!user) {
    throw new HttpError(
      403,
      'PROFILE_REQUIRED',
      'Complete seu cadastro para acessar os recursos do Hydratation.',
    );
  }
  return user;
}
