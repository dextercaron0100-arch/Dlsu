export function json(response, status, body) {
  response.status(status);
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  return response.json(body);
}

export function methodNotAllowed(response, methods) {
  response.setHeader('Allow', methods.join(', '));
  return json(response, 405, { error: 'Method not allowed' });
}

export function getClientIp(request) {
  return String(request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
    .slice(0, 64);
}
