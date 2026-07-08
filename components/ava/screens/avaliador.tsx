'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AGENTS } from '@/lib/mock/ava-data';
import { Card, SectionLabel, ProgressBar } from '@/components/ava/ava-ui';
import { useTheme } from '@/lib/hooks/use-theme';

const agent = AGENTS.find((a) => a.id === 'avaliador')!;

type SubareaStats = { subarea: string; total: number; corretas: number; percentual: number };
type AreaStats = {
  area: string;
  label: string;
  total: number;
  corretas: number;
  percentual: number;
  subareas: SubareaStats[];
};
type DesempenhoStats = {
  areas: AreaStats[];
  total_geral: number;
  corretas_geral: number;
  percentual_geral: number;
};

function colorForPct(pct: number): string {
  if (pct >= 65) return '#1D9E75';
  if (pct >= 45) return '#EF9F27';
  return '#E24B4A';
}

function estimateTRI(pct: number): number {
  return Math.round(400 + (pct / 100) * 600);
}

export default function AvaliadorScreen() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [stats, setStats] = useState<DesempenhoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ava/desempenho/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Erro ao carregar desempenho');
        return r.json() as Promise<DesempenhoStats>;
      })
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1D9E75' }} />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 dark:text-red-400 py-4">⚠ {error}</p>;
  }

  const isEmpty = !stats || stats.total_geral === 0;
  const hits = stats?.corretas_geral ?? 0;
  const misses = (stats?.total_geral ?? 0) - hits;
  const triScore = stats ? estimateTRI(stats.percentual_geral) : 0;

  const topics = (stats?.areas ?? []).map(({ label, percentual }) => ({
    name: label,
    percent: percentual,
    color: colorForPct(percentual),
  }));

  const gaps = (stats?.areas ?? [])
    .flatMap((a) => a.subareas.map((s) => ({ areaLabel: a.label, ...s })))
    .filter((s) => s.percentual < 50 && s.total >= 2)
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, 4)
    .map((s) => `${s.areaLabel} — ${s.subarea}`);

  const STATS_ROW = [
    { val: hits, lbl: 'Acertos', color: '#3B6D11' },
    { val: misses, lbl: 'Erros', color: '#A32D2D' },
    { val: triScore, lbl: 'Nota TRI estimada', color: undefined },
  ];

  return (
    <>
      {/* Agent header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
          style={{ background: agent.bg }}
        >
          <span className="text-[16px]" style={{ color: agent.color }}>
            ☑
          </span>
        </div>
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{agent.label}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {isEmpty
              ? 'Aguardando seus primeiros resultados'
              : `${stats!.total_geral} questões respondidas`}
          </p>
        </div>
        {!isEmpty && (
          <div
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: '#FAEEDA', color: '#633806' }}
          >
            ⚡ +{agent.xpReward} XP conquistados!
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: agent.bg }}
          >
            <span className="text-[22px]">☑</span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nenhum resultado ainda
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 max-w-xs">
            Realize um simulado ou atividade para ver seu desempenho detalhado aqui.
          </p>
          <Link
            href="/ava/atividade"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            style={{ background: '#1D9E75' }}
          >
            ✏ Iniciar atividade
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {STATS_ROW.map(({ val, lbl, color }) => (
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
              <SectionLabel>Desempenho por área ENEM</SectionLabel>
              <div className="flex flex-col gap-2.5 mt-1">
                {topics.map(({ name, percent, color }) => (
                  <div key={name}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-gray-500 dark:text-gray-400">{name}</span>
                      <span className="font-medium" style={{ color }}>
                        {percent}%
                      </span>
                    </div>
                    <ProgressBar pct={percent} color={color} />
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionLabel>Lacunas detectadas</SectionLabel>
              <div className="flex flex-col gap-1.5 mt-1">
                {gaps.length === 0 ? (
                  <p className="text-[12px] text-gray-400 dark:text-gray-500">
                    Nenhuma lacuna crítica detectada ainda.
                  </p>
                ) : (
                  gaps.map((g) => (
                    <div
                      key={g}
                      className="text-[12px] px-2.5 py-2 rounded-md"
                      style={{ background: '#FAEEDA', color: '#633806' }}
                    >
                      {g}
                    </div>
                  ))
                )}
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
              href="/ava/acompanhamento"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              💬 Analisar com IA
            </Link>
            <Link
              href="/ava/ranking"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              🏆 Ver ranking
            </Link>
          </div>
        </>
      )}
    </>
  );
}
