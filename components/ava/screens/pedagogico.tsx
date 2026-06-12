'use client';

import Link from 'next/link';
import { AGENTS, MOCK_PEDAGOGICO, MOCK_STUDENT } from '@/lib/mock/ava-data';
import { Card, SectionLabel, ProgressBar, Tag } from '@/components/ava/ava-ui';

const agent = AGENTS.find(a => a.id === 'pedagogico')!;

export default function PedagogicoScreen() {
  return (
    <>
      {/* Agent header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: agent.bg }}>
          <span className="text-[16px]" style={{ color: agent.color }}>🎓</span>
        </div>
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{agent.label}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{agent.description}</p>
        </div>
      </div>

      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Weekly trail */}
        <Card>
          <SectionLabel>Trilha da semana</SectionLabel>
          <div className="flex flex-col gap-2 mt-1">
            {MOCK_PEDAGOGICO.trailSteps.map(({ text, day, tag, tagLabel, xp }, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-2.5 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                  style={{ background: '#E1F5EE', color: '#0F6E56' }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-900 dark:text-gray-100">{text}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{day} · +{xp} XP</p>
                </div>
                <Tag variant={tag}>{tagLabel}</Tag>
              </div>
            ))}
          </div>
        </Card>

        {/* Progress */}
        <Card>
          <SectionLabel>Progresso geral ENEM</SectionLabel>
          <div className="flex flex-col gap-2.5 mt-1">
            {MOCK_PEDAGOGICO.areaProgress.map(({ name, percent, color }) => (
              <div key={name}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-gray-500 dark:text-gray-400">{name}</span>
                  <span className="font-medium" style={{ color }}>{percent}%</span>
                </div>
                <ProgressBar pct={percent} color={color} />
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Previsão de nota ENEM com a trilha atual</p>
            <p className="text-[18px] font-medium mt-0.5" style={{ color: '#1D9E75' }}>
              {MOCK_PEDAGOGICO.projectedScore} pts{' '}
              <span className="text-[12px] text-gray-500 dark:text-gray-400 font-normal">
                → meta: {MOCK_PEDAGOGICO.targetScore}
              </span>
            </p>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Link
          href="/ava/atividade"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
          style={{ background: '#1D9E75' }}
        >
          ✏ Iniciar simulado semanal
        </Link>
        <Link
          href="/ava/mapa"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          🗺 Ver mapa de proficiência
        </Link>
      </div>
    </>
  );
}
