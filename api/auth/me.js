import { requireUser } from '../_lib/auth.js';
import { json, methodNotAllowed } from '../_lib/http.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  const user = await requireUser(request);
  if (!user) return json(response, 401, { error: 'Authentication required' });
  return json(response, 200, {
    user: { studentNumber: user.student_number, email: user.email, fullName: user.full_name, role: user.role },
  });
}
