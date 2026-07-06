import { NextResponse } from 'next/server';
import { apiError } from '@/lib/server/api-response';

const BACKEND_URL = process.env.SIGMAEDU_API_URL ?? 'http://localhost:8000';

export async function GET() {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/ava/questoes/grupos`, { cache: 'no-store' });
  } catch {
    return apiError('UPSTREAM_ERROR', 502, 'Não foi possível conectar ao servidor');
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
