import { requireAuthenticatedUser, type AuthenticatedUser } from './lib/auth';
import { assertSameOrigin, errorResponse, json, methodNotAllowed, notFound } from './lib/http';
import { getAuthSession, login, logout, register } from './routes/auth';
import { createContainer, listContainers, removeContainer, updateContainer } from './routes/containers';
import { getProfile, updateProfile } from './routes/profile';
import { getRanking } from './routes/ranking';
import { createWaterLog, getTodayWater, removeWaterLog } from './routes/water';
async function authenticated(request: Request, env: Env, handler: (user: AuthenticatedUser) => Promise<Response> | Response): Promise<Response> {
  const user = await requireAuthenticatedUser(request, env);
  return handler(user);
}
async function handleApi(request: Request, env: Env): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  assertSameOrigin(request, env);
  if (pathname === '/api/health') return request.method === 'GET' ? json({ status: 'ok', service: 'hydration-api' }) : methodNotAllowed(['GET']);
  if (pathname === '/api/auth/session') return request.method === 'GET' ? getAuthSession(request, env) : methodNotAllowed(['GET']);
  if (pathname === '/api/auth/register') return request.method === 'POST' ? register(request, env) : methodNotAllowed(['POST']);
  if (pathname === '/api/auth/login') return request.method === 'POST' ? login(request, env) : methodNotAllowed(['POST']);
  if (pathname === '/api/auth/logout') return request.method === 'POST' ? logout() : methodNotAllowed(['POST']);
  if (pathname === '/api/me') {
    if (request.method === 'GET') return authenticated(request, env, user => getProfile(user));
    if (request.method === 'PATCH') return authenticated(request, env, user => updateProfile(request, env, user));
    return methodNotAllowed(['GET', 'PATCH']);
  }
  if (pathname === '/api/containers') {
    if (request.method === 'GET') return authenticated(request, env, user => listContainers(env, user));
    if (request.method === 'POST') return authenticated(request, env, user => createContainer(request, env, user));
    return methodNotAllowed(['GET', 'POST']);
  }
  const containerMatch = pathname.match(/^\/api\/containers\/([^/]+)$/);
  if (containerMatch) {
    const id = decodeURIComponent(containerMatch[1]);
    if (request.method === 'PATCH') return authenticated(request, env, user => updateContainer(request, env, user, id));
    if (request.method === 'DELETE') return authenticated(request, env, user => removeContainer(env, user, id));
    return methodNotAllowed(['PATCH', 'DELETE']);
  }
  if (pathname === '/api/water/today') return request.method === 'GET' ? authenticated(request, env, user => getTodayWater(env, user)) : methodNotAllowed(['GET']);
  if (pathname === '/api/water') return request.method === 'POST' ? authenticated(request, env, user => createWaterLog(request, env, user)) : methodNotAllowed(['POST']);
  const logMatch = pathname.match(/^\/api\/water\/([^/]+)$/);
  if (logMatch) return request.method === 'DELETE' ? authenticated(request, env, user => removeWaterLog(env, user, decodeURIComponent(logMatch[1]))) : methodNotAllowed(['DELETE']);
  if (pathname === '/api/ranking') return request.method === 'GET' ? authenticated(request, env, user => getRanking(request, env, user)) : methodNotAllowed(['GET']);
  return notFound();
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try { return await handleApi(request, env); } catch (error) { return errorResponse(error); }
  },
};
