import { requireUser } from './_lib/auth.js';
import { getSql } from './_lib/db.js';
import { json, methodNotAllowed } from './_lib/http.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  const user = await requireUser(request);
  if (!user) return json(response, 401, { error: 'Authentication required' });
  const sql = getSql();
  const payments = await sql`
    SELECT id, description, due_date, paid_at, payment_mode, amount, scholarship_amount, status
    FROM payments WHERE user_id = ${user.id} ORDER BY due_date DESC
  `;
  return json(response, 200, { payments });
}
