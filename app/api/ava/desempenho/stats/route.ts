import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiError } from '@/lib/server/api-response';

const BACKEND_URL = process.env.SIGMAEDU_API_URL ?? 'http://localhost:8000';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sigmaedu_token')?.value;
  if (!token) return apiError('UNAUTHORIZED', 401, 'Não autenticado');

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/ava/desempenho/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return apiError('UPSTREAM_ERROR', 502, 'Não foi possível conectar ao servidor');
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
