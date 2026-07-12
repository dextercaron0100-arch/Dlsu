import { requireUser } from './_lib/auth.js';
import { getSql } from './_lib/db.js';
import { json, methodNotAllowed } from './_lib/http.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  const user = await requireUser(request);
  if (!user) return json(response, 401, { error: 'Authentication required' });

  try {
    const sql = getSql();
    const [dates, totals] = await Promise.all([
      sql`SELECT id, title, event_date, description FROM important_dates WHERE event_date >= current_date ORDER BY event_date LIMIT 10`,
      sql`
        SELECT
          COALESCE(sum(amount), 0)::numeric AS total_receivable,
          COALESCE(sum(amount) FILTER (WHERE status = 'paid'), 0)::numeric AS paid_amount,
          COALESCE(sum(scholarship_amount), 0)::numeric AS scholarship_amount,
          COALESCE(sum(amount) FILTER (WHERE status IN ('pending', 'overdue')), 0)::numeric AS balance_amount
        FROM payments WHERE user_id = ${user.id}
      `,
    ]);
    return json(response, 200, { dates, paymentSummary: totals[0] });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    return json(response, 500, { error: 'Unable to load dashboard data' });
  }
}
