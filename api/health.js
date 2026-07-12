import { getSql } from './_lib/db.js';
import { json, methodNotAllowed } from './_lib/http.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  try {
    const sql = getSql();
    await sql`SELECT 1`;
    return json(response, 200, { status: 'ok', database: 'connected' });
  } catch {
    return json(response, 503, { status: 'error', database: 'disconnected' });
  }
}
