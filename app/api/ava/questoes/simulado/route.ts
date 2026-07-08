import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/server/api-response';

const BACKEND_URL = process.env.SIGMAEDU_API_URL ?? 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const backendUrl = new URL(`${BACKEND_URL}/ava/questoes/simulado`);
  const n = searchParams.get('n') ?? '10';
  const ano = searchParams.get('ano');
  backendUrl.searchParams.set('n', n);
  if (ano) backendUrl.searchParams.set('ano', ano);

  let res: Response;
  try {
    res = await fetch(backendUrl.toString(), { cache: 'no-store' });
  } catch {
    return apiError('UPSTREAM_ERROR', 502, 'Não foi possível conectar ao servidor');
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
