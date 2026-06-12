'use client';

import Link from 'next/link';
import { AGENTS, MOCK_EVALUATION } from '@/lib/mock/ava-data';
import { Card, SectionLabel, ProgressBar } from '@/components/ava/ava-ui';
import { useTheme } from '@/lib/hooks/use-theme';

const agent = AGENTS.find(a => a.id === 'avaliador')!;

export default function AvaliadorScreen() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const STATS = [
    { val: MOCK_EVALUATION.hits,     lbl: 'Acertos',          color: '#3B6D11' },
    { val: MOCK_EVALUATION.misses,   lbl: 'Erros',            color: '#A32D2D' },
    { val: MOCK_EVALUATION.triScore, lbl: 'Nota TRI estimada', color: undefined },
  ];

  return (
    <>
      {/* Agent header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: agent.bg }}>
          <span className="text-[16px]" style={{ color: agent.color }}>☑</span>
        </div>
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{agent.label}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{agent.description}</p>
        </div>
        <div
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: '#FAEEDA', color: '#633806' }}
        >
          ⚡ +{agent.xpReward} XP conquistados!
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {STATS.map(({ val, lbl, color }) => (
          <div key={lbl} className="bg-gray-50 dark:bg-gray-800 rounded-md p-2.5 text-center">
            <p
              className="text-[20px] font-medium"
              style={{ color: color ?? (isDark ? '#e5e7eb' : '#111827') }}
            >
              {val}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{lbl}</p>
          </div>
        ))}
      </div>

      {/* Performance + gaps */}
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card>
          <SectionLabel>Desempenho por competência ENEM</SectionLabel>
          <div className="flex flex-col gap-2.5 mt-1">
            {MOCK_EVALUATION.topics.map(({ name, percent, color }) => (
              <div key={name}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-gray-500 dark:text-gray-400">{name}</span>
                  <span className="font-medium" style={{ color }}>{percent}%</span>
                </div>
                <ProgressBar pct={percent} color={color} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel>Lacunas detectadas</SectionLabel>
          <div className="flex flex-col gap-1.5 mt-1">
            {MOCK_EVALUATION.gaps.map(g => (
              <div
                key={g}
                className="text-[12px] px-2.5 py-2 rounded-md"
                style={{ background: '#FAEEDA', color: '#633806' }}
              >
                {g}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Link
          href="/ava/aulas"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
          style={{ background: '#1D9E75' }}
        >
          ▶ Estudar lacunas agora
        </Link>
        <Link
          href="/ava/tutor"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          💬 Perguntar ao tutor
        </Link>
        <Link
          href="/ava/ranking"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          🏆 Ver ranking
        </Link>
      </div>
    </>
  );
}
