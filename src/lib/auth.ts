/**
 * Server-side auth utilities.
 * All functions run only in API routes — never in browser.
 */
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createHmac, randomBytes, timingSafeEqual, createHash } from "crypto";

const SESSION_COOKIE = "sp_session";
const SESSION_TTL_HOURS = 12;

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET env var must be at least 16 chars");
  return s;
}

/** Hash a password with SHA-256 + salt */
export function hashPassword(password: string, salt?: string): string {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(s + password).digest("hex");
  return `${s}:${hash}`;
}

/** Verify a plaintext password against a stored hash */
export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const attempt = createHash("sha256").update(salt + plain).digest("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
  } catch {
    return false;
  }
}

interface SessionPayload {
  userId: string;
  role: string;
  displayName: string;
  exp: number;
}

function sign(payload: SessionPayload): string {
  const secret = getSecret();
  const data = JSON.stringify(payload);
  const b64 = Buffer.from(data).toString("base64url");
  const sig = createHmac("sha256", secret).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  try {
    const [b64, sig] = token.split(".");
    const secret = getSecret();
    const expected = createHmac("sha256", secret).update(b64).digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload: SessionPayload = JSON.parse(Buffer.from(b64, "base64url").toString());
    if (Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, "exp">): Promise<void> {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_HOURS * 3600,
  };
  const token = sign(full);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_HOURS * 3600,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verify(token);
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** For API route middleware — reads from request header */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

export type { SessionPayload };
