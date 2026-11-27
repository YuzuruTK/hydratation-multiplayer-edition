import type { AuthenticatedUser } from '../lib/auth';
import { HttpError, json, readJson, requireInteger, requireString } from '../lib/http';

type ContainerKind = 'glass' | 'bottle' | 'cup';
interface ContainerRow {
  id: string;
  name: string;
  amountMl: number;
  kind: ContainerKind;
}
const validKinds = new Set<ContainerKind>(['glass', 'bottle', 'cup']);

function parseKind(value: unknown): ContainerKind {
  if (typeof value !== 'string' || !validKinds.has(value as ContainerKind)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Tipo de recipiente inválido.');
  }
  return value as ContainerKind;
}

export async function listContainers(env: Env, user: AuthenticatedUser): Promise<Response> {
  const result = await env.DB.prepare(
    'SELECT id, name, volume_ml AS amountMl, kind ' +
    'FROM containers WHERE user_id = ? ORDER BY created_at ASC, name COLLATE NOCASE ASC',
  ).bind(user.id).all<ContainerRow>();
  return json({ containers: result.results });
}

export async function createContainer(
  request: Request,
  env: Env,
  user: AuthenticatedUser,
): Promise<Response> {
  const body = await readJson(request);
  const name = requireString(body.name, 'name', 1, 32);
  const amountMl = requireInteger(body.amountMl, 'amountMl', 1, 5000);
  const kind = parseKind(body.kind);
  const id = crypto.randomUUID();

  await env.DB.prepare(
    'INSERT INTO containers (id, user_id, name, volume_ml, kind, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(id, user.id, name, amountMl, kind, new Date().toISOString()).run();

  return json({ container: { id, name, amountMl, kind } }, 201);
}

export async function updateContainer(
  request: Request,
  env: Env,
  user: AuthenticatedUser,
  containerId: string,
): Promise<Response> {
  const body = await readJson(request);
  if (Object.keys(body).length === 0) {
    throw new HttpError(400, 'EMPTY_UPDATE', 'Informe ao menos um campo para atualizar.');
  }

  const current = await env.DB.prepare(
    'SELECT id, name, volume_ml AS amountMl, kind FROM containers ' +
    'WHERE id = ? AND user_id = ? LIMIT 1',
  ).bind(containerId, user.id).first<ContainerRow>();
  if (!current) throw new HttpError(404, 'CONTAINER_NOT_FOUND', 'Recipiente não encontrado.');

  const name = body.name === undefined ? current.name : requireString(body.name, 'name', 1, 32);
  const amountMl = body.amountMl === undefined
    ? current.amountMl
    : requireInteger(body.amountMl, 'amountMl', 1, 5000);
  const kind = body.kind === undefined ? current.kind : parseKind(body.kind);

  await env.DB.prepare(
    'UPDATE containers SET name = ?, volume_ml = ?, kind = ? WHERE id = ? AND user_id = ?',
  ).bind(name, amountMl, kind, containerId, user.id).run();

  return json({ container: { id: containerId, name, amountMl, kind } });
}

export async function removeContainer(
  env: Env,
  user: AuthenticatedUser,
  containerId: string,
): Promise<Response> {
  const result = await env.DB.prepare(
    'DELETE FROM containers WHERE id = ? AND user_id = ?',
  ).bind(containerId, user.id).run();
  if (result.meta.changes === 0) {
    throw new HttpError(404, 'CONTAINER_NOT_FOUND', 'Recipiente não encontrado.');
  }
  return json({ success: true });
}
