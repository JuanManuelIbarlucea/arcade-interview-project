import { SignJWT, jwtVerify } from "jose";

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret());

  if (!payload.sub || !payload.email || !payload.name) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: payload.sub,
    email: payload.email as string,
    name: payload.name as string,
  };
}
