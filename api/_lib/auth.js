import { SignJWT, jwtVerify } from 'jose';
import { getSql } from './db.js';

const COOKIE_NAME = 'dlsu_session';
const encoder = new TextEncoder();

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must contain at least 32 characters');
  return encoder.encode(value);
}

function cookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
      const index = part.indexOf('=');
      return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
    }),
  );
}

export async function createSession(user) {
  return new SignJWT({ role: user.role, tokenVersion: user.token_version })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('8h')
    .setIssuer('dlsu-portal')
    .setAudience('dlsu-student')
    .sign(secret());
}

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function requireUser(request) {
  const token = cookies(request)[COOKIE_NAME];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: 'dlsu-portal',
      audience: 'dlsu-student',
    });
    const sql = getSql();
    const rows = await sql`
      SELECT id, student_number, email, full_name, role, status, token_version
      FROM users
      WHERE id = ${payload.sub} AND status = 'active'
      LIMIT 1
    `;
    const user = rows[0];
    if (!user || user.token_version !== payload.tokenVersion) return null;
    return user;
  } catch {
    return null;
  }
}
