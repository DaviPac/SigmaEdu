import { cookies } from 'next/headers';
import { apiSuccess } from '@/lib/server/api-response';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('sigmaedu_token');
  return apiSuccess({});
}
