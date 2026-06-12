'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Map, Play, PenLine,
  Activity, MessageSquare, CheckSquare2, GraduationCap,
  Trophy, Star,
} from 'lucide-react';

type SidebarItem = { icon: React.ElementType; label: string; href: string };

const STUDY_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Painel',     href: '/ava/painel'    },
  { icon: Map,             label: 'Mapa ENEM',  href: '/ava/mapa'      },
  { icon: Play,            label: 'Aulas',      href: '/ava/aulas'     },
  { icon: PenLine,         label: 'Atividades', href: '/ava/atividade' },
];

const AGENT_ITEMS: SidebarItem[] = [
  { icon: Activity,     label: 'Diagnóstico', href: '/ava/diagnostico' },
  { icon: MessageSquare, label: 'Tutor',      href: '/ava/tutor'       },
  { icon: CheckSquare2, label: 'Avaliador',   href: '/ava/avaliador'   },
  { icon: GraduationCap, label: 'Pedagógico', href: '/ava/pedagogico'  },
];

const EXTRA_ITEMS: SidebarItem[] = [
  { icon: Trophy, label: 'Ranking',    href: '/ava/ranking'    },
  { icon: Star,   label: 'Conquistas', href: '/ava/conquistas' },
];

function Item({ icon: Icon, label, href, active }: SidebarItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3.5 py-[7px] text-xs border-l-2 transition-all',
        active
          ? 'font-medium border-l-[#1D9E75] bg-[#E1F5EE] dark:bg-[rgba(29,158,117,0.12)] text-[#0F6E56]'
          : 'border-l-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
      )}
    >
      <Icon className="w-[14px] h-[14px] flex-shrink-0" aria-hidden />
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase px-3.5 mt-2.5 mb-1.5"
      style={{ letterSpacing: '.08em' }}
    >
      {children}
    </p>
  );
}

export default function AvaSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto py-3 flex flex-col">
      <SectionLabel>Estudo</SectionLabel>
      {STUDY_ITEMS.map(item => (
        <Item key={item.href} {...item} active={pathname === item.href} />
      ))}

      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-3.5 my-2" />

      <SectionLabel>Agentes IA</SectionLabel>
      {AGENT_ITEMS.map(item => (
        <Item key={item.href} {...item} active={pathname === item.href} />
      ))}

      <div className="h-px bg-gray-200 dark:bg-gray-800 mx-3.5 my-2" />

      {EXTRA_ITEMS.map(item => (
        <Item key={item.href} {...item} active={pathname === item.href} />
      ))}
    </aside>
  );
}
