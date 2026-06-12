'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CronogramaScreen() {
  const router = useRouter();
  useEffect(() => { router.replace('/ava/painel'); }, [router]);
  return null;
}
