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
