'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_STUDENT } from '@/lib/mock/ava-data';
import { useTheme } from '@/lib/hooks/use-theme';

const TABS = [
  { label: 'Início',          href: '/ava/painel',  match: (p: string) => p === '/ava/painel' || p === '/ava' },
  { label: 'Preparação ENEM', href: '/ava/mapa',    match: (p: string) => ['/ava/mapa', '/ava/aulas', '/ava/atividade'].includes(p) },
  { label: 'Ranking',         href: '/ava/ranking', match: (p: string) => p === '/ava/ranking' },
] as const;

export default function AvaTopbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        <div
          className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-xs font-medium"
          style={{ background: '#1D9E75', color: '#E1F5EE' }}
        >
          S
        </div>
        SigmaEdu
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1">
        {TABS.map(({ label, href, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all',
                active
                  ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#9FE1CB] font-medium'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right: XP + Level + Theme + Avatar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: '#FAEEDA', color: '#633806' }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          {MOCK_STUDENT.xp.toLocaleString('pt-BR')} XP
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: '#EEEDFE', color: '#3C3489' }}>
          <span style={{ fontSize: 12 }}>🏆</span>
          Nível {MOCK_STUDENT.level}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium"
          style={{ background: '#E6F1FB', color: '#0C447C' }}
        >
          {MOCK_STUDENT.initials}
        </div>
      </div>
    </header>
  );
}
