import { cookies } from 'next/headers';
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
    res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: body.username, password: body.password }),
    });
  } catch {
    return apiError('UPSTREAM_ERROR', 502, 'Não foi possível conectar ao servidor');
  }

  if (!res.ok) {
    return apiError('INVALID_REQUEST', 401, 'Usuário ou senha inválidos');
  }

  const data = await res.json();
  const token = data.access_token as string;

  const cookieStore = await cookies();
  cookieStore.set('sigmaedu_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  });

  return apiSuccess({ token_type: data.token_type ?? 'bearer' });
}
