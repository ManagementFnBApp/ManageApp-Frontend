/** Decode JWT payload without verification (client-side only). */
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    // Handle base64url encoding
    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof window !== 'undefined'
      ? atob(normalized)
      : Buffer.from(normalized, 'base64').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export interface UserJwtPayload {
  sub: number;
  username: string;
  role: string | null;
  ownerManagerId?: number | null;
  iat?: number;
  exp?: number;
}
