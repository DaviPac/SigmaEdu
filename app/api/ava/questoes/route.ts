import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/server/api-response';

const BACKEND_URL = process.env.SIGMAEDU_API_URL ?? 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const backendUrl = new URL(`${BACKEND_URL}/ava/questoes`);
  searchParams.forEach((value, key) => backendUrl.searchParams.set(key, value));

  let res: Response;
  try {
    res = await fetch(backendUrl.toString(), { cache: 'no-store' });
  } catch {
    return apiError('UPSTREAM_ERROR', 502, 'Não foi possível conectar ao servidor');
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
