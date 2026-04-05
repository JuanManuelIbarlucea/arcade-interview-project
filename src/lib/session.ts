import { cookies } from "next/headers";
import { type JWTPayload, signToken, verifyToken } from "./auth";

export const SESSION_COOKIE = "session";
export const REF_COOKIE = "ref_code";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSession(payload: JWTPayload): Promise<void> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getRefCode(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REF_COOKIE)?.value ?? null;
}

export async function clearRefCode(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REF_COOKIE);
}
