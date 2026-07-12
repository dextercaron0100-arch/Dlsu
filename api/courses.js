import { requireUser } from './_lib/auth.js';
import { getSql } from './_lib/db.js';
import { json, methodNotAllowed } from './_lib/http.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  const user = await requireUser(request);
  if (!user) return json(response, 401, { error: 'Authentication required' });
  const sql = getSql();
  const courses = await sql`
    SELECT c.course_code, c.course_name, c.units, e.term, e.school_year, e.schedule, e.room, e.status
    FROM enrollments e JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = ${user.id}
    ORDER BY c.course_code
  `;
  return json(response, 200, { courses });
}
