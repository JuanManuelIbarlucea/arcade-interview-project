export interface UserPublic {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  createdAt: string;
}

export interface ReferralStats {
  clicks: number;
  conversions: number;
  conversionRate: number;
}

export interface ReferredUser {
  id: string;
  name: string;
  email: string; // masked on the client side
  createdAt: string;
}

export interface ApiError {
  error: string;
  field?: string;
}

export interface MeResponse {
  user: UserPublic;
  stats: ReferralStats;
}

// ── Request body types ──────────────────────────────────────────────

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  name: string;
  password: string;
  refCode?: string;
}

// ── API response discriminated unions ───────────────────────────────

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; field?: string };

// ── Referrals list response ─────────────────────────────────────────

export interface ReferralsResponse {
  referrals: ReferredUser[];
  total: number;
}

// ── Auth response (signin / signup) ─────────────────────────────────

export interface AuthSuccessResponse {
  user: UserPublic;
}
