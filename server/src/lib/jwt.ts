import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in the environment');
}

const JWT_EXPIRES_IN = '7d';
export const AUTH_COOKIE_NAME = 'token';

const isProduction = process.env.NODE_ENV === 'production';

// Frontend (Vercel) and backend (SnapDeploy) live on different domains in
// production, which makes every API call a cross-site request from the
// browser's perspective. sameSite: 'lax' only rides along on top-level
// navigations cross-site -- it's silently dropped from fetch/XHR requests,
// which is exactly how the API is actually called, so the cookie never
// makes it back on the next request. sameSite: 'none' is required for that,
// and browsers reject 'none' without secure: true, so the two must move
// together. Locally (http, same-origin-ish via CORS) 'lax' + non-secure is
// what actually works, since 'none' cookies are rejected outright over
// plain http.
export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export interface AuthTokenPayload {
  userId: string;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
}
