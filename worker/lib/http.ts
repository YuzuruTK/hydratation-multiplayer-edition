export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  responseHeaders.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return json({ error: { code: error.code, message: error.message } }, error.status);
  }

  console.error('Unhandled API error:', error);
  return json(
    { error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro inesperado.' } },
    500,
  );
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Envie o conteúdo como application/json.');
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? 0);
  if (declaredLength > 16_384) {
    throw new HttpError(413, 'PAYLOAD_TOO_LARGE', 'A requisição é muito grande.');
  }

  let value: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 16_384) {
      throw new HttpError(413, 'PAYLOAD_TOO_LARGE', 'A requisição é muito grande.');
    }
    value = JSON.parse(raw);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'INVALID_JSON', 'O corpo da requisição não contém JSON válido.');
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'INVALID_BODY', 'O corpo da requisição deve ser um objeto JSON.');
  }
  return value as Record<string, unknown>;
}

export function requireString(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
): string {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'VALIDATION_ERROR', 'O campo ' + field + ' é obrigatório.');
  }
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'O campo ' + field + ' deve ter entre ' + minLength + ' e ' + maxLength + ' caracteres.',
    );
  }
  return normalized;
}

export function requireInteger(
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'O campo ' + field + ' deve ser um número inteiro entre ' + minimum + ' e ' + maximum + '.',
    );
  }
  return parsed;
}

export function assertSameOrigin(request: Request, env: Env): void {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;

  const origin = request.headers.get('Origin');
  if (!origin) return;

  const requestOrigin = new URL(request.url).origin;
  const allowedOrigins = [requestOrigin, env.APP_ORIGIN].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  if (!allowedOrigins.includes(origin)) {
    throw new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Origem da requisição não permitida.');
  }
}

export function notFound(): Response {
  return json({ error: { code: 'NOT_FOUND', message: 'Endpoint não encontrado.' } }, 404);
}

export function methodNotAllowed(allowed: string[]): Response {
  return json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Método HTTP não permitido.' } },
    405,
    { Allow: allowed.join(', ') },
  );
}
