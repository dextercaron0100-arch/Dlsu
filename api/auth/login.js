import bcrypt from 'bcryptjs';
import { getSql } from '../_lib/db.js';
import { createSession, sessionCookie } from '../_lib/auth.js';
import { getClientIp, json, methodNotAllowed } from '../_lib/http.js';
import { verifyTurnstile } from '../_lib/turnstile.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const username = String(request.body?.username || '').trim().toLowerCase();
    const password = String(request.body?.password || '');
    const ip = getClientIp(request);

    if (!username || !password || username.length > 254 || password.length > 200) {
      return json(response, 400, { error: 'Username and password are required' });
    }
    if (!(await verifyTurnstile(request.body?.turnstileToken, ip))) {
      return json(response, 400, { error: 'Security verification failed' });
    }

    const sql = getSql();
    const attempts = await sql`
      SELECT attempt_count, blocked_until
      FROM login_attempts
      WHERE identifier = ${username} AND ip_address = ${ip}
      LIMIT 1
    `;
    if (attempts[0]?.blocked_until && new Date(attempts[0].blocked_until) > new Date()) {
      return json(response, 429, { error: 'Too many attempts. Please try again later.' });
    }

    const rows = await sql`
      SELECT id, student_number, email, full_name, role, status, password_hash, token_version
      FROM users
      WHERE lower(email) = ${username} OR lower(student_number) = ${username}
      LIMIT 1
    `;
    const user = rows[0];
    const valid = user?.status === 'active' && await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      await sql`
        INSERT INTO login_attempts (identifier, ip_address, attempt_count, last_attempt_at, blocked_until)
        VALUES (${username}, ${ip}, 1, now(), NULL)
        ON CONFLICT (identifier, ip_address) DO UPDATE SET
          attempt_count = CASE WHEN login_attempts.last_attempt_at < now() - interval '15 minutes' THEN 1 ELSE login_attempts.attempt_count + 1 END,
          last_attempt_at = now(),
          blocked_until = CASE WHEN login_attempts.attempt_count + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END
      `;
      return json(response, 401, { error: 'Invalid username or password' });
    }

    await sql`DELETE FROM login_attempts WHERE identifier = ${username} AND ip_address = ${ip}`;
    await sql`UPDATE users SET last_login_at = now() WHERE id = ${user.id}`;
    const token = await createSession(user);
    response.setHeader('Set-Cookie', sessionCookie(token));
    return json(response, 200, {
      user: { studentNumber: user.student_number, email: user.email, fullName: user.full_name, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return json(response, 503, { error: 'The login service is temporarily unavailable' });
  }
}
