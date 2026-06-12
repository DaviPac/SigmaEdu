'use client';

import Link from 'next/link';
import { ENEM_PROFICIENCY } from '@/lib/mock/ava-data';
import { Card, SectionLabel, ProgressBar } from '@/components/ava/ava-ui';

export default function MapaScreen() {
  return (
    <>
      <div className="mb-3.5">
        <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-0.5">Mapa de proficiência — ENEM</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">Baseado no seu histórico e nas competências cobradas pela banca</p>
      </div>

      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {ENEM_PROFICIENCY.map(({ area, items }) => (
          <Card key={area}>
            <SectionLabel>{area}</SectionLabel>
            <div className="flex flex-col gap-2 mt-1">
              {items.map(({ name, percent, color }) => (
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
        ))}
      </div>

      <div className="flex gap-2">
        <Link
          href="/ava/diagnostico"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
          style={{ background: '#1D9E75' }}
        >
          Refazer diagnóstico
        </Link>
        <Link
          href="/ava/pedagogico"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Ver trilha sugerida
        </Link>
      </div>
    </>
  );
}
