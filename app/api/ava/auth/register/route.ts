import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const BACKEND_URL = process.env.SIGMAEDU_API_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('INVALID_REQUEST', 400, 'Invalid JSON body');
  }

  if (!body.username?.trim() || !body.password) {
    return apiError('MISSING_REQUIRED_FIELD', 400, 'username e password são obrigatórios');
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: body.username, password: body.password }),
    });
  } catch {
    return apiError('UPSTREAM_ERROR', 502, 'Não foi possível conectar ao servidor');
  }

  if (!res.ok) {
    return apiError('INVALID_REQUEST', res.status, 'Falha no registro — usuário já pode existir');
  }

  return apiSuccess({}, 201);
}
