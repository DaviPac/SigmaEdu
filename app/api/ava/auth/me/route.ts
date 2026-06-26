import { cookies } from 'next/headers';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const BACKEND_URL = process.env.SIGMAEDU_API_URL ?? 'http://localhost:8000';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sigmaedu_token')?.value;

  if (!token) {
    return apiError('INVALID_REQUEST', 401, 'Não autenticado');
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return apiError('UPSTREAM_ERROR', 502, 'Não foi possível conectar ao servidor');
  }

  if (!res.ok) {
    return apiError('INVALID_REQUEST', 401, 'Sessão inválida ou expirada');
  }

  const user = await res.json();
  return apiSuccess({ user });
}
