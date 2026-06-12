'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AGENTS, DIAGNOSTICO_CONFIG } from '@/lib/mock/ava-data';
import { Card, SectionLabel, ChoiceBtn } from '@/components/ava/ava-ui';

const agent = AGENTS.find(a => a.id === 'diagnostico')!;

export default function DiagnosticoScreen() {
  const router = useRouter();
  const [estilo,  setEstilo]  = useState<string | null>(null);
  const [conf,    setConf]    = useState<string | null>('Baixo');
  const [areas,   setAreas]   = useState<Set<string>>(new Set(['Matemática', 'Redação']));
  const [horas,   setHoras]   = useState<string | null>('5h a 10h');

  const toggleArea = (v: string) =>
    setAreas(prev => { const s = new Set(prev); s.has(v) ? s.delete(v) : s.add(v); return s; });

  return (
    <>
      {/* Agent header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: agent.bg }}>
          <span className="text-[16px]" style={{ color: agent.color }}>⚕</span>
        </div>
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{agent.label}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{agent.description}</p>
        </div>
        <div
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: '#FAEEDA', color: '#633806' }}
        >
          ⚡ +{agent.xpReward} XP ao concluir
        </div>
      </div>

      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card>
          <SectionLabel>Estilo de aprendizado</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {DIAGNOSTICO_CONFIG.learningStyles.map(({ label }) => (
              <ChoiceBtn key={label} label={label} selected={estilo === label} onClick={() => setEstilo(label)} />
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel>Nível de confiança no ENEM</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {DIAGNOSTICO_CONFIG.confidenceLevels.map(l => (
              <ChoiceBtn key={l} label={l} selected={conf === l} onClick={() => setConf(l)} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="mb-3">
        <SectionLabel>Sondagem rápida — ENEM</SectionLabel>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-2 mt-1">
          <span className="font-medium text-gray-900 dark:text-gray-100">1.</span> Quais áreas você se sente menos preparado?
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {DIAGNOSTICO_CONFIG.weakAreas.map(a => (
            <ChoiceBtn key={a} label={a} selected={areas.has(a)} onClick={() => toggleArea(a)} />
          ))}
        </div>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">2.</span> Quantas horas por semana você consegue estudar?
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DIAGNOSTICO_CONFIG.studyHours.map(h => (
            <ChoiceBtn key={h} label={h} selected={horas === h} onClick={() => setHoras(h)} />
          ))}
        </div>
      </Card>

      <button
        onClick={() => router.push('/ava/mapa')}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
        style={{ background: '#1D9E75' }}
      >
        ✓ Gerar mapa de proficiência (+{agent.xpReward} XP)
      </button>
    </>
  );
}
