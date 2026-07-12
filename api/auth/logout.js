import { clearSessionCookie } from '../_lib/auth.js';
import { json, methodNotAllowed } from '../_lib/http.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  response.setHeader('Set-Cookie', clearSessionCookie());
  return json(response, 200, { success: true });
}
