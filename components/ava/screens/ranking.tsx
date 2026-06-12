'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_STUDENT, MOCK_RANKING } from '@/lib/mock/ava-data';
import { Card, SectionLabel } from '@/components/ava/ava-ui';
import { cn } from '@/lib/utils';

const TABS = ['Minha escola', 'Recife', 'Nacional'] as const;
type Tab = typeof TABS[number];

const MEDAL_STYLES: Record<number, { bg: string; color: string }> = {
  1: { bg: '#FAEEDA', color: '#633806' },
  2: { bg: '#F1EFE8', color: '#5F5E5A' },
  3: { bg: '#FAECE7', color: '#712B13' },
};

export default function RankingScreen() {
  const [tab, setTab] = useState<Tab>('Minha escola');

  return (
    <>
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">Ranking</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Escola Est. João Pessoa — Recife, PE</p>
        </div>
        <div className="flex gap-1.5">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'text-[11px] px-2.5 py-1.5 rounded-full border transition-all',
                tab === t
                  ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {[
          { val: `#${MOCK_STUDENT.rankPosition}`, lbl: 'Sua posição',         color: '#854F0B' },
          { val: MOCK_STUDENT.xp.toLocaleString('pt-BR'), lbl: 'Seu XP',       color: undefined },
          { val: '+3', lbl: 'Posições essa semana',                             color: '#1D9E75' },
        ].map(({ val, lbl, color }) => (
          <div key={lbl} className="bg-gray-50 dark:bg-gray-800 rounded-md p-2.5 text-center">
            <p className="text-[20px] font-medium text-gray-900 dark:text-gray-100" style={color ? { color } : undefined}>{val}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{lbl}</p>
          </div>
        ))}
      </div>

      <Card className="mb-3">
        <SectionLabel>Top alunos — semana</SectionLabel>
        <div className="flex flex-col gap-1.5 mt-1">
          {MOCK_RANKING.filter(p => !p.isMe).map(player => {
            const medal = MEDAL_STYLES[player.position] ?? { bg: 'rgb(243 244 246)', color: 'rgb(107 114 128)' };
            return (
              <div key={player.position} className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0" style={medal}>
                  {player.position}
                </div>
                <div
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                  style={{ background: '#E6F1FB', color: '#0C447C' }}
                >
                  {player.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-gray-900 dark:text-gray-100">{player.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Nível {player.level}</p>
                </div>
                <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100">
                  {player.xp.toLocaleString('pt-BR')} XP
                </p>
              </div>
            );
          })}

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

          {/* Me */}
          {MOCK_RANKING.filter(p => p.isMe).map(player => (
            <div
              key="me"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md border"
              style={{ background: '#E1F5EE', borderColor: '#9FE1CB' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                style={{ background: '#E1F5EE', color: '#085041' }}
              >
                {player.position}
              </div>
              <div
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                style={{ background: '#E1F5EE', color: '#0C447C' }}
              >
                {player.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium" style={{ color: '#085041' }}>{player.name}</p>
                <p className="text-[10px]" style={{ color: '#0F6E56' }}>
                  Nível {player.level} · +{player.weekGain} essa semana
                </p>
              </div>
              <p className="text-[12px] font-medium" style={{ color: '#085041' }}>
                {player.xp.toLocaleString('pt-BR')} XP
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Link
        href="/ava/atividade"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
        style={{ background: '#1D9E75' }}
      >
        ⚡ Fazer simulado e ganhar XP
      </Link>
    </>
  );
}
