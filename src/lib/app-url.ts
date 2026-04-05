const DEFAULT = "http://localhost:3000";

export function getAppUrl(): string {
  const raw = process.env.VERCEL_URL ?? DEFAULT;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}
