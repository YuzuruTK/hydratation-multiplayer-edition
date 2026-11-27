import { HttpError } from './http';

interface AccessJwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

interface AccessJwtClaims {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  name?: string;
}

interface AccessJwk extends JsonWebKey {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
}

interface AccessJwksResponse {
  keys?: AccessJwk[];
}

export interface AccessIdentity {
  sub: string;
  email: string;
  name?: string;
}

let cachedKeys: {
  teamDomain: string;
  expiresAt: number;
  keys: AccessJwk[];
} | null = null;

const encoder = new TextEncoder();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY_CACHE_MS = 5 * 60 * 1000;
const MAX_TOKEN_LENGTH = 16_384;

function normalizeTeamDomain(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const result = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    result[index] = binary.charCodeAt(index);
  }
  return result;
}

function decodeJsonPart<T>(value: string): T {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
  } catch {
    throw new HttpError(401, 'INVALID_ACCESS_TOKEN', 'Token de acesso inválido.');
  }
}

async function fetchAccessKeys(teamDomain: string, forceRefresh = false): Promise<AccessJwk[]> {
  if (
    !forceRefresh &&
    cachedKeys &&
    cachedKeys.teamDomain === teamDomain &&
    cachedKeys.expiresAt > Date.now()
  ) {
    return cachedKeys.keys;
  }

  const response = await fetch(
    'https://' + teamDomain + '/cdn-cgi/access/certs',
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) {
    throw new HttpError(
      503,
      'ACCESS_KEYS_UNAVAILABLE',
      'Não foi possível validar a identidade com o Cloudflare Access.',
    );
  }

  const payload = await response.json() as AccessJwksResponse;
  if (!Array.isArray(payload.keys) || payload.keys.length === 0) {
    throw new HttpError(
      503,
      'ACCESS_KEYS_UNAVAILABLE',
      'O endpoint de chaves do Cloudflare Access não retornou chaves válidas.',
    );
  }

  cachedKeys = {
    teamDomain,
    expiresAt: Date.now() + KEY_CACHE_MS,
    keys: payload.keys,
  };
  return payload.keys;
}

async function findSigningKey(teamDomain: string, keyId: string): Promise<AccessJwk> {
  let keys = await fetchAccessKeys(teamDomain);
  let key = keys.find((candidate) => candidate.kid === keyId);

  if (!key) {
    keys = await fetchAccessKeys(teamDomain, true);
    key = keys.find((candidate) => candidate.kid === keyId);
  }

  if (!key || key.kty !== 'RSA' || (key.use && key.use !== 'sig')) {
    throw new HttpError(401, 'INVALID_ACCESS_TOKEN', 'Assinatura do Cloudflare Access desconhecida.');
  }
  return key;
}

export async function requireAccessIdentity(request: Request, env: Env): Promise<AccessIdentity> {
  const teamDomain = normalizeTeamDomain(env.ACCESS_TEAM_DOMAIN ?? '');
  const audience = env.ACCESS_AUD?.trim();

  if (!teamDomain || !audience) {
    throw new HttpError(
      503,
      'ACCESS_NOT_CONFIGURED',
      'Configure ACCESS_TEAM_DOMAIN e ACCESS_AUD antes de usar a API.',
    );
  }

  if (!/^[a-z0-9.-]+$/i.test(teamDomain)) {
    throw new HttpError(500, 'INVALID_ACCESS_CONFIG', 'ACCESS_TEAM_DOMAIN está inválido.');
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > MAX_TOKEN_LENGTH) {
    throw new HttpError(401, 'ACCESS_AUTH_REQUIRED', 'Autentique-se pelo Cloudflare Access para continuar.');
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new HttpError(401, 'INVALID_ACCESS_TOKEN', 'Token de acesso inválido.');
  }

  const header = decodeJsonPart<AccessJwtHeader>(segments[0]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    throw new HttpError(401, 'INVALID_ACCESS_TOKEN', 'Algoritmo ou chave do token inválidos.');
  }

  const signingKey = await findSigningKey(teamDomain, header.kid);
  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      'jwk',
      signingKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
  } catch {
    throw new HttpError(401, 'INVALID_ACCESS_TOKEN', 'Não foi possível importar a chave do Cloudflare Access.');
  }

  let signatureValid = false;
  try {
    signatureValid = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      cryptoKey,
      decodeBase64Url(segments[2]),
      encoder.encode(segments[0] + '.' + segments[1]),
    );
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    throw new HttpError(401, 'INVALID_ACCESS_TOKEN', 'A assinatura do token não é válida.');
  }

  const claims = decodeJsonPart<AccessJwtClaims>(segments[1]);
  const now = Math.floor(Date.now() / 1000);
  const issuer = 'https://' + teamDomain;
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];

  if (
    claims.iss !== issuer ||
    !audiences.includes(audience) ||
    typeof claims.exp !== 'number' ||
    claims.exp <= now ||
    (typeof claims.nbf === 'number' && claims.nbf > now + 30) ||
    (typeof claims.iat === 'number' && claims.iat > now + 60) ||
    typeof claims.sub !== 'string' ||
    claims.sub.length < 1 ||
    claims.sub.length > 255 ||
    typeof claims.email !== 'string' ||
    claims.email.length > 254 ||
    !EMAIL_PATTERN.test(claims.email)
  ) {
    throw new HttpError(401, 'INVALID_ACCESS_TOKEN', 'O token não pertence a esta aplicação ou expirou.');
  }

  return {
    sub: claims.sub,
    email: claims.email.trim().toLowerCase(),
    ...(typeof claims.name === 'string' && claims.name.length <= 120 ? { name: claims.name } : {}),
  };
}
