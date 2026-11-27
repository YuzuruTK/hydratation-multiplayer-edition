const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const encoder = new TextEncoder();

function base64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function unbase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function base64url(bytes: Uint8Array): string {
  return base64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unbase64url(value: string): Uint8Array {
  const raw = value.replace(/-/g, "+").replace(/_/g, "/");
  return unbase64(raw + "=".repeat((4 - raw.length % 4) % 4));
}
async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    KEY_LENGTH * 8,
  );
  return new Uint8Array(bits);
}
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2:${ITERATIONS}:${base64(salt)}:${base64(hash)}`;
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 300_000) return false;
  try {
    const salt = unbase64(parts[2]);
    const expected = unbase64(parts[3]);
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const actual = await derive(password, salt, iterations);
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
  } catch { return false; }
}

export interface JwtPayload { sub: string; iat: number; exp: number; }
async function signingKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function signJwt(secret: string, userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const head = base64url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64url(encoder.encode(JSON.stringify({ sub: userId, iat: now, exp: now + 86400 })));
  const input = head + "." + body;
  const sig = await crypto.subtle.sign("HMAC", await signingKey(secret), encoder.encode(input));
  return input + "." + base64url(new Uint8Array(sig));
}
export async function verifyJwt(secret: string, token: string): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(new TextDecoder().decode(unbase64url(parts[0]))) as { alg?: string };
    if (header.alg !== "HS256") return null;
    const valid = await crypto.subtle.verify("HMAC", await signingKey(secret), unbase64url(parts[2]), encoder.encode(parts[0] + "." + parts[1]));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(unbase64url(parts[1]))) as JwtPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}
