'use client';

import Link from 'next/link';
import { MOCK_STUDENT, PRIORITY_GAPS, AGENTS } from '@/lib/mock/ava-data';
import { Card, SectionLabel, ProgressBar, Tag } from '@/components/ava/ava-ui';

const NEXT_STEPS = [
  { icon: '▶', label: 'Aula: funções do 2º grau',          sub: '+80 XP ao concluir',  tag: 'red'    as const, tagLabel: 'Urgente',   href: '/ava/aula/enem-fn-01' },
  { icon: '✏', label: 'Simulado — ciências da natureza',    sub: '+120 XP ao concluir', tag: 'amber'  as const, tagLabel: 'Hoje',      href: '/ava/atividade' },
  { icon: '💬', label: 'Tutor: revisar redação',            sub: '+60 XP ao concluir',  tag: 'purple' as const, tagLabel: 'Sugerido',  href: '/ava/tutor'     },
];

const AGENT_LINKS = [
  { id: 'diagnostico', label: 'Diagnóstico', sub: 'Mapeia lacunas',   bg: '#E6F1FB', color: '#185FA5', href: '/ava/diagnostico' },
  { id: 'tutor',       label: 'Tutor',       sub: 'Tira dúvidas',     bg: '#FAEEDA', color: '#854F0B', href: '/ava/tutor'       },
  { id: 'avaliador',   label: 'Avaliador',   sub: 'Corrige atividades',bg: '#EAF3DE', color: '#3B6D11', href: '/ava/avaliador'   },
  { id: 'pedagogico',  label: 'Pedagógico',  sub: 'Cria sua trilha',  bg: '#EEEDFE', color: '#534AB7', href: '/ava/pedagogico'  },
];

export default function PainelScreen() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">Bom dia, {MOCK_STUDENT.name}!</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">ENEM 2025 · {MOCK_STUDENT.daysToEnem} dias restantes</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Sequência de estudos</p>
          <p className="text-[18px] font-medium" style={{ color: '#1D9E75' }}>🔥 {MOCK_STUDENT.streak} dias</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        {[
          { val: MOCK_STUDENT.xp.toLocaleString('pt-BR'), lbl: 'XP total',       color: '#1D9E75' },
          { val: String(MOCK_STUDENT.level),               lbl: 'Nível atual',    color: undefined },
          { val: '42%',                                    lbl: 'ENEM coberto',   color: '#185FA5' },
          { val: `#${MOCK_STUDENT.rankPosition}`,          lbl: 'Ranking escola', color: '#854F0B' },
        ].map(({ val, lbl, color }) => (
          <div key={lbl} className="bg-gray-50 dark:bg-gray-800 rounded-md p-2.5 text-center">
            <p className="text-[20px] font-medium text-gray-900 dark:text-gray-100" style={color ? { color } : undefined}>{val}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{lbl}</p>
          </div>
        ))}
      </div>

      {/* 2-col: gaps + next steps */}
      <div className="grid gap-3 mb-3.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card>
          <SectionLabel>Lacunas prioritárias — ENEM</SectionLabel>
          <div className="flex flex-col gap-2 mt-1.5">
            {PRIORITY_GAPS.map(({ name, percent, color, textColor }) => (
              <div key={name}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-500 dark:text-gray-400">{name}</span>
                  <span className="font-medium" style={{ color: textColor }}>{percent}%</span>
                </div>
                <ProgressBar pct={percent} color={color} />
              </div>
            ))}
          </div>
          <div className="mt-2.5">
            <Link
              href="/ava/mapa"
              className="inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[11px] text-white rounded-md font-medium hover:opacity-90 transition-opacity"
              style={{ background: '#1D9E75' }}
            >
              🗺 Ver mapa completo
            </Link>
          </div>
        </Card>

        <Card>
          <SectionLabel>Próximos passos recomendados</SectionLabel>
          <div className="flex flex-col gap-2 mt-1.5">
            {NEXT_STEPS.map(({ icon, label, sub, tag, tagLabel, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <span className="text-[13px] w-4 text-center flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-gray-900 dark:text-gray-100 truncate">{label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{sub}</p>
                </div>
                <Tag variant={tag}>{tagLabel}</Tag>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Agents */}
      <Card>
        <div className="flex items-center justify-between mb-2.5">
          <SectionLabel>Agentes disponíveis</SectionLabel>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">Todos ativos</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {AGENT_LINKS.map(({ label, sub, bg, color, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-white dark:hover:bg-gray-750 transition-colors"
            >
              <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <span className="text-[13px]" style={{ color }} aria-hidden>◈</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
