'use client';

import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronRight, Target, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const AREA_ICONS: Record<string, string> = {
  LC: '📝',
  CN: '🔬',
  CH: '🌎',
  MT: '📐',
};

const ALL_AREAS = [
  { area: 'LC', label: 'Linguagens e Códigos' },
  { area: 'CN', label: 'Ciências da Natureza' },
  { area: 'CH', label: 'Ciências Humanas' },
  { area: 'MT', label: 'Matemática' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function perfColor(pct: number) {
  if (pct >= 70) return '#1D9E75';
  if (pct >= 50) return '#EF9F27';
  return '#EF4444';
}

function perfBg(pct: number) {
  if (pct >= 70) return '#E1F5EE';
  if (pct >= 50) return '#FEF3C7';
  return '#FEE2E2';
}

function perfTextColor(pct: number) {
  if (pct >= 70) return '#0F6E56';
  if (pct >= 50) return '#92400E';
  return '#991B1B';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PerfBar({ pct, bg = '#e5e7eb' }: { pct: number; bg?: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, background: perfColor(pct) }}
      />
    </div>
  );
}

function AreaCard({ area, data }: { area: { area: string; label: string }; data?: AreaStats }) {
  const [open, setOpen] = useState(false);
  const hasData = !!data && data.total > 0;
  const pct = hasData ? data.percentual : 0;
  const canExpand = hasData && data.subareas.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => canExpand && setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 p-3.5 text-left transition-colors',
          canExpand && 'hover:bg-gray-50 dark:hover:bg-gray-750',
        )}
      >
        <span className="text-[22px] flex-shrink-0">{AREA_ICONS[area.area] ?? '📚'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">
              {area.label}
            </p>
            {hasData ? (
              <span
                className="text-[12px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums"
                style={{ background: perfBg(pct), color: perfTextColor(pct) }}
              >
                {pct.toFixed(0)}%
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 flex-shrink-0">Sem dados</span>
            )}
          </div>
          {hasData ? (
            <div className="flex items-center gap-2">
              <PerfBar pct={pct} />
              <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0">
                {data.corretas}/{data.total}q
              </span>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400">Pratique para ver seu desempenho</p>
          )}
        </div>
        {canExpand && (
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform',
              open && 'rotate-180',
            )}
          />
        )}
      </button>

      {open && data && data.subareas.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-3 pt-2.5 space-y-2.5">
          {data.subareas.map((s) => (
            <div key={s.subarea}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate flex-1 min-w-0 pr-2">
                  {s.subarea}
                </p>
                <span className="text-[11px] tabular-nums flex-shrink-0">
                  <span style={{ color: perfColor(s.percentual) }} className="font-medium">
                    {s.percentual.toFixed(0)}%
                  </span>
                  <span className="text-gray-400 ml-1">
                    ({s.corretas}/{s.total})
                  </span>
                </span>
              </div>
              <PerfBar pct={s.percentual} bg="#f3f4f6" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MapaScreen() {
  const [stats, setStats] = useState<DesempenhoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/ava/desempenho/stats')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#1D9E75]" />
        <p className="text-[12px] text-gray-400">Carregando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[12px] text-red-500 py-8 text-center">
        Não foi possível carregar o mapa. Verifique se o servidor está rodando.
      </p>
    );
  }

  const noData = !stats || stats.total_geral === 0;

  // Lacunas: subareas ou áreas com pior % (mín. 3 questões respondidas)
  const gaps: { label: string; areaCode: string; pct: number }[] = [];
  if (stats) {
    for (const a of stats.areas) {
      if (a.subareas.length > 0) {
        for (const s of a.subareas) {
          if (s.total >= 3) gaps.push({ label: s.subarea, areaCode: a.area, pct: s.percentual });
        }
      } else if (a.total >= 3) {
        gaps.push({ label: a.label, areaCode: a.area, pct: a.percentual });
      }
    }
    gaps.sort((a, b) => a.pct - b.pct);
  }
  const topGaps = gaps.slice(0, 3).filter((g) => g.pct < 70);

  const areaMap = new Map(stats?.areas.map((a) => [a.area, a]) ?? []);

  return (
    <>
      <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 mb-3">Mapa ENEM</p>

      {/* Resumo geral */}
      {!noData && stats && (
        <div
          className="rounded-lg p-3.5 mb-3 flex items-center gap-3"
          style={{ background: '#E1F5EE' }}
        >
          <Target className="w-5 h-5 flex-shrink-0" style={{ color: '#0F6E56' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[12px] font-medium" style={{ color: '#0F6E56' }}>
                Desempenho geral
              </p>
              <span className="text-[13px] font-bold tabular-nums" style={{ color: '#0F6E56' }}>
                {stats.percentual_geral.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#9FE1CB' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${stats.percentual_geral}%`, background: '#1D9E75' }}
              />
            </div>
            <p className="text-[10px] mt-1" style={{ color: '#0F6E56' }}>
              {stats.corretas_geral} acertos em {stats.total_geral} questões respondidas
            </p>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {noData && (
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-6 mb-3 text-center">
          <TrendingUp className="w-7 h-7 mx-auto mb-2 text-gray-300" />
          <p className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1">
            Nenhuma atividade concluída ainda
          </p>
          <p className="text-[11px] text-gray-400 mb-3">
            Complete atividades para ver seu desempenho e identificar lacunas.
          </p>
          <Link
            href="/ava/atividade"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-white rounded-md transition-opacity hover:opacity-90"
            style={{ background: '#1D9E75' }}
          >
            Ir para Atividades
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Cards das 4 áreas */}
      <div className="space-y-2 mb-3">
        {ALL_AREAS.map((a) => (
          <AreaCard key={a.area} area={a} data={areaMap.get(a.area)} />
        ))}
      </div>

      {/* Lacunas identificadas */}
      {topGaps.length > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 p-3.5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">
              Pontos de atenção
            </p>
          </div>
          <div className="space-y-2 mb-3">
            {topGaps.map((g) => (
              <div key={g.label} className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate">
                  {AREA_ICONS[g.areaCode] ?? ''} {g.label}
                </span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums"
                  style={{ background: perfBg(g.pct), color: perfTextColor(g.pct) }}
                >
                  {g.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/ava/atividade"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-[12px] font-medium text-white rounded-md transition-opacity hover:opacity-90"
            style={{ background: '#1D9E75' }}
          >
            Praticar pontos fracos
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </>
  );
}
