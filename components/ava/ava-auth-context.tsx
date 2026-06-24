'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AvaUser {
  id: number;
  username: string;
}

interface AvaAuthContextValue {
  user: AvaUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AvaAuthContext = createContext<AvaAuthContextValue | null>(null);

export function AvaAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AvaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/ava/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user as AvaUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== '/ava/login') {
      router.replace('/ava/login');
    } else if (user && pathname === '/ava/login') {
      router.replace('/ava/painel');
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch('/api/ava/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Usuário ou senha inválidos');
      }
      await fetchMe();
    },
    [fetchMe],
  );

  const register = useCallback(
    async (username: string, password: string) => {
      const res = await fetch('/api/ava/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Falha no registro');
      }
      await login(username, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await fetch('/api/ava/auth/logout', { method: 'POST' });
    setUser(null);
    router.replace('/ava/login');
  }, [router]);

  return (
    <AvaAuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AvaAuthContext.Provider>
  );
}

export function useAvaAuth() {
  const ctx = useContext(AvaAuthContext);
  if (!ctx) throw new Error('useAvaAuth must be used within AvaAuthProvider');
  return ctx;
}
