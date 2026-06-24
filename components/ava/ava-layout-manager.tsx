'use client';

import { usePathname } from 'next/navigation';
import { useAvaAuth } from './ava-auth-context';
import AvaShell from './ava-shell';
import { LoaderCircle } from 'lucide-react';

export function AvaLayoutManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAvaAuth();

  if (pathname === '/ava/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <LoaderCircle className="w-6 h-6 animate-spin text-[#1D9E75]" />
      </div>
    );
  }

  if (!user) return null;

  return <AvaShell>{children}</AvaShell>;
}
