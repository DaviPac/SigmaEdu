'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, ChevronDown, Trophy, Clock, Loader2, MessageCircle, X, Send, Minus, Plus } from 'lucide-react';
import type { ActivitySet, ActivityQuestion } from '@/lib/mock/ava-data';
import { MiniMarkdown } from '@/components/ava/mini-markdown';

// ─── API types ────────────────────────────────────────────────────────────────

type GrupoInfo = {
  area: string;
  subarea: string | null;
  count: number;
};

type ApiAlternativa = {
  letra: string;
  texto: string | null;
  arquivo_base64: string | null;
};

type ApiQuestao = {
  id: number;
  ano: number;
  titulo: string;
  area: string;
  contexto: string | null;
  pergunta: string;
  arquivos: string[];
  alternativas: ApiAlternativa[];
  alternativa_correta: string;
  codigo_competencia: number | null;
  descricao_competencia: string | null;
  subarea: string | null;
};

type EnemArea = 'LC' | 'CN' | 'CH' | 'MT';
type SubareaInfo = { name: string; count: number };
type AreaGroup = { area: EnemArea; total: number; subareas: SubareaInfo[] };

type ConfigTarget =
  | { kind: 'simulado'; areas: AreaGroup[] }
  | { kind: 'area'; group: AreaGroup };

type QuizConfig =
  | { kind: 'simulado'; perArea: Partial<Record<EnemArea, number>> }
  | { kind: 'area'; area: EnemArea; total: number; perSubarea: Record<string, number> | null };

// ─── Constants ────────────────────────────────────────────────────────────────

const ENEM_AREAS: EnemArea[] = ['LC', 'CN', 'CH', 'MT'];

const AREA_LABELS: Record<string, string> = {
  LC: 'Linguagens e Códigos',
  CN: 'Ciências da Natureza',
  CH: 'Ciências Humanas',
  MT: 'Matemática',
};

const AREA_ICONS: Record<string, string> = {
  LC: '📝',
  CN: '🔬',
  CH: '🌎',
  MT: '📐',
};

const XP_PER_QUESTION = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Remove referências de imagem markdown do contexto (as imagens vêm em contextImages). */
function stripImageRefs(text: string) {
  return text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
}

function apiToActivity(q: ApiQuestao): ActivityQuestion {
  return {
    id: String(q.id),
    area: q.subarea ?? AREA_LABELS[q.area] ?? q.area,
    areaCode: q.area,
    subareaName: q.subarea,
    text: q.pergunta,
    context: q.contexto ? stripImageRefs(q.contexto) : undefined,
    contextImages: q.arquivos.length > 0 ? q.arquivos : undefined,
    options: q.alternativas.map((a) => ({
      key: a.letra.toLowerCase(),
      value: a.texto ?? '',
      image: a.arquivo_base64,
    })),
    correctKey: q.alternativa_correta.toLowerCase(),
    xpReward: XP_PER_QUESTION,
    hint: q.descricao_competencia ?? 'Revise o conteúdo desta competência.',
  };
}

function groupByArea(grupos: GrupoInfo[]): AreaGroup[] {
  const map = new Map<string, AreaGroup>();
  for (const g of grupos) {
    const area = g.area as EnemArea;
    if (!map.has(area)) map.set(area, { area, total: 0, subareas: [] });
    const entry = map.get(area)!;
    entry.total += g.count;
    if (g.subarea) entry.subareas.push({ name: g.subarea, count: g.count });
  }
  return Array.from(map.values());
}

function distributeProportionally(subareas: SubareaInfo[], total: number): Record<string, number> {
  if (!subareas.length) return {};
  const totalAvail = subareas.reduce((s, a) => s + a.count, 0);
  let assigned = 0;
  const result: Record<string, number> = {};
  subareas.forEach((s, i) => {
    if (i === subareas.length - 1) {
      result[s.name] = Math.max(0, total - assigned);
    } else {
      const n = Math.max(0, Math.round((s.count / totalAvail) * total));
      result[s.name] = n;
      assigned += n;
    }
  });
  return result;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchSet(config: QuizConfig): Promise<ActivitySet> {
  if (config.kind === 'simulado') {
    const entries = (Object.entries(config.perArea) as [EnemArea, number][]).filter(([, n]) => n > 0);
    const results = await Promise.all(
      entries.map(([area, limit]) =>
        fetch(`/api/ava/questoes?area=${area}&limit=${limit}`).then(
          (r) => r.json() as Promise<ApiQuestao[]>,
        ),
      ),
    );
    return {
      id: 'simulado-enem',
      title: 'Simulado ENEM',
      area: 'Multidisciplinar',
      icon: '🏆',
      description: '',
      isSimulado: true,
      questions: shuffleArray(results.flat()).map(apiToActivity),
    };
  } else {
    let questoes: ApiQuestao[];
    if (config.perSubarea) {
      const entries = Object.entries(config.perSubarea).filter(([, n]) => n > 0);
      const results = await Promise.all(
        entries.map(([subarea, limit]) =>
          fetch(
            `/api/ava/questoes?area=${config.area}&subarea=${encodeURIComponent(subarea)}&limit=${limit}`,
          ).then((r) => r.json() as Promise<ApiQuestao[]>),
        ),
      );
      questoes = shuffleArray(results.flat());
    } else {
      const r = await fetch(`/api/ava/questoes?area=${config.area}&limit=${config.total}`);
      if (!r.ok) throw new Error('Falha ao carregar questões');
      questoes = await r.json();
    }
    const label = AREA_LABELS[config.area] ?? config.area;
    return {
      id: `${config.area}-${Date.now()}`,
      title: label,
      area: label,
      icon: AREA_ICONS[config.area] ?? '📚',
      description: '',
      isSimulado: false,
      questions: questoes.map(apiToActivity),
    };
  }
}

// ─── Activity list ────────────────────────────────────────────────────────────

function ActivityList({ onSelect }: { onSelect: (target: ConfigTarget) => void }) {
  const [areaGroups, setAreaGroups] = useState<AreaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/ava/questoes/grupos')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((grupos: GrupoInfo[]) => setAreaGroups(groupByArea(grupos)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <p className="text-[12px] text-gray-400">Carregando atividades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[12px] text-red-500 py-8 text-center">
        Não foi possível carregar as atividades. Verifique se o servidor está rodando.
      </p>
    );
  }

  const totalDisponivel = areaGroups.reduce((s, g) => s + g.total, 0);

  return (
    <>
      <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 mb-3">Atividades</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {/* Card do simulado */}
        <button
          onClick={() => onSelect({ kind: 'simulado', areas: areaGroups })}
          className="text-left p-3.5 rounded-lg border transition-all hover:shadow-sm bg-[#FAEEDA] dark:bg-amber-950/30 border-[#F3C98A] dark:border-amber-700"
        >
          <div className="text-[20px] mb-2">🏆</div>
          <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100 leading-tight mb-0.5">
            Simulado ENEM
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">Multidisciplinar</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug mb-2">
            Questões de todas as áreas
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">{totalDisponivel} disponíveis</span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: '#E1F5EE', color: '#0F6E56' }}
            >
              Personalizar
            </span>
          </div>
        </button>

        {/* Cards por área */}
        {areaGroups.map((g) => (
          <button
            key={g.area}
            onClick={() => onSelect({ kind: 'area', group: g })}
            className="text-left p-3.5 rounded-lg border transition-all hover:shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#9FE1CB] dark:hover:border-emerald-700"
          >
            <div className="text-[20px] mb-2">{AREA_ICONS[g.area] ?? '📚'}</div>
            <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100 leading-tight mb-0.5">
              {AREA_LABELS[g.area] ?? g.area}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">{g.area}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug mb-2">
              {g.subareas.length > 0 ? `${g.subareas.length} subtemas` : 'Questões variadas'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{g.total} disponíveis</span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: '#E1F5EE', color: '#0F6E56' }}
              >
                Personalizar
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Config screen ────────────────────────────────────────────────────────────

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-7 text-center text-[13px] font-medium tabular-nums select-none">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

function ConfigScreen({
  target,
  onBack,
  onStart,
}: {
  target: ConfigTarget;
  onBack: () => void;
  onStart: (config: QuizConfig) => void;
}) {
  const group = target.kind === 'area' ? target.group : null;

  const [perArea, setPerArea] = useState<Record<EnemArea, number>>(() => {
    const result = { LC: 0, CN: 0, CH: 0, MT: 0 } as Record<EnemArea, number>;
    if (target.kind === 'simulado') {
      ENEM_AREAS.forEach((a) => {
        const ag = target.areas.find((g) => g.area === a);
        result[a] = ag ? Math.min(5, ag.total) : 0;
      });
    }
    return result;
  });

  const defaultTotal = group ? Math.min(5, group.total) : 5;
  const [areaTotal, setAreaTotal] = useState(defaultTotal);
  const [showSubareas, setShowSubareas] = useState(false);
  const [perSubarea, setPerSubarea] = useState<Record<string, number>>(() =>
    group?.subareas.length ? distributeProportionally(group.subareas, defaultTotal) : {},
  );

  const subareaTotal = Object.values(perSubarea).reduce((s, n) => s + n, 0);
  const effectiveTotal =
    target.kind === 'simulado'
      ? Object.values(perArea).reduce((s, n) => s + n, 0)
      : showSubareas
        ? subareaTotal
        : areaTotal;

  const handleToggleSubareas = () => {
    if (!showSubareas && group) {
      setPerSubarea(distributeProportionally(group.subareas, areaTotal));
    }
    setShowSubareas((v) => !v);
  };

  const handleStart = () => {
    if (target.kind === 'simulado') {
      onStart({ kind: 'simulado', perArea });
    } else {
      onStart({
        kind: 'area',
        area: group!.area,
        total: effectiveTotal,
        perSubarea: showSubareas ? perSubarea : null,
      });
    }
  };

  const isSimulado = target.kind === 'simulado';
  const title = isSimulado ? 'Simulado ENEM' : (AREA_LABELS[group!.area] ?? group!.area);
  const icon = isSimulado ? '🏆' : (AREA_ICONS[group!.area] ?? '📚');

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Atividades
      </button>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[22px]">{icon}</span>
        <div>
          <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {isSimulado ? 'Multidisciplinar' : group!.area}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
        {isSimulado ? (
          <>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Questões por área
            </p>
            <div className="space-y-2.5">
              {ENEM_AREAS.map((area) => {
                const ag = target.areas.find((g) => g.area === area);
                if (!ag) return null;
                return (
                  <div key={area} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[14px] flex-shrink-0">{AREA_ICONS[area]}</span>
                      <span className="text-[12px] text-gray-700 dark:text-gray-300 truncate">
                        {AREA_LABELS[area]}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">({ag.total})</span>
                    </div>
                    <Stepper
                      value={perArea[area]}
                      min={0}
                      max={Math.min(ag.total, 25)}
                      onChange={(n) => setPerArea((prev) => ({ ...prev, [area]: n }))}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-gray-700 dark:text-gray-200">
                {showSubareas ? 'Total (soma dos subtemas)' : 'Quantidade de questões'}
              </p>
              {showSubareas ? (
                <span className="text-[13px] font-semibold tabular-nums text-gray-800 dark:text-gray-200">
                  {subareaTotal}
                </span>
              ) : (
                <Stepper
                  value={areaTotal}
                  min={1}
                  max={Math.min(group!.total, 20)}
                  onChange={setAreaTotal}
                />
              )}
            </div>

            {group!.subareas.length > 0 && (
              <>
                <button
                  onClick={handleToggleSubareas}
                  className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-2"
                >
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform',
                      showSubareas && 'rotate-180',
                    )}
                  />
                  {showSubareas ? 'Ocultar subtemas' : 'Personalizar por subtema'}
                </button>

                {showSubareas && (
                  <div className="space-y-2 pl-2 border-l-2 border-gray-100 dark:border-gray-700">
                    {group!.subareas.map((s) => (
                      <div key={s.name} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-600 dark:text-gray-400 flex-1 min-w-0 truncate">
                          {s.name}
                          <span className="text-gray-400 ml-1">({s.count})</span>
                        </span>
                        <Stepper
                          value={perSubarea[s.name] ?? 0}
                          min={0}
                          max={Math.min(s.count, 10)}
                          onChange={(n) => setPerSubarea((prev) => ({ ...prev, [s.name]: n }))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg mb-3"
        style={{ background: '#E1F5EE' }}
      >
        <span className="text-[12px] font-medium" style={{ color: '#0F6E56' }}>
          {effectiveTotal} questões
        </span>
        <span className="text-[12px] font-medium" style={{ color: '#0F6E56' }}>
          ⚡ +{effectiveTotal * XP_PER_QUESTION} XP
        </span>
      </div>

      <button
        onClick={handleStart}
        disabled={effectiveTotal === 0}
        className={cn(
          'w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-white rounded-md font-medium transition-opacity',
          effectiveTotal === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90',
        )}
        style={{ background: '#1D9E75' }}
      >
        Iniciar atividade
        <ChevronRight className="w-4 h-4" />
      </button>
    </>
  );
}

// ─── Results screen ────────────────────────────────────────────────────────────

function ResultsScreen({
  set,
  answers,
  onRetry,
  onBack,
}: {
  set: ActivitySet;
  answers: Record<string, string>;
  onRetry: () => void;
  onBack: () => void;
}) {
  // Grava desempenho no backend uma única vez ao exibir resultados
  useEffect(() => {
    const resultados = set.questions.map((q) => ({
      questao_id: parseInt(q.id, 10),
      acertou: answers[q.id] === q.correctKey,
      area: q.areaCode ?? null,
      subarea: q.subareaName ?? null,
    }));
    fetch('/api/ava/desempenho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultados }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const correct = set.questions.filter((q) => answers[q.id] === q.correctKey).length;
  const xpEarned = correct * XP_PER_QUESTION;
  const pct = Math.round((correct / set.questions.length) * 100);

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Voltar às atividades
      </button>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-3 text-center">
        <div className="text-[28px] mb-1">{set.icon}</div>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-3">{set.title}</p>
        <Trophy
          className="w-9 h-9 mx-auto mb-2"
          style={{ color: pct >= 60 ? '#1D9E75' : '#EF9F27' }}
        />
        <p className="text-[28px] font-bold text-gray-900 dark:text-gray-100">
          {correct}/{set.questions.length}
        </p>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">
          {pct}% de aproveitamento
        </p>
        <div
          className="flex items-center justify-center gap-1 text-[11px] font-medium mb-4"
          style={{ color: '#0F6E56' }}
        >
          ⚡ +{xpEarned} XP ganhos
        </div>

        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: '#e5e7eb' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: pct >= 60 ? '#1D9E75' : '#EF9F27' }}
          />
        </div>

        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${set.questions.length}, 1fr)` }}
        >
          {set.questions.map((q, i) => {
            const ans = answers[q.id];
            const ok = ans === q.correctKey;
            return (
              <div
                key={q.id}
                className="rounded-md py-1.5 text-center text-[11px] font-medium"
                style={
                  !ans
                    ? { background: '#f3f4f6', color: '#9ca3af' }
                    : ok
                      ? { background: '#E1F5EE', color: '#0F6E56' }
                      : { background: '#FEE2E2', color: '#991B1B' }
                }
              >
                {i + 1} {ok ? '✓' : ans ? '✗' : '—'}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Refazer
        </button>
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
          style={{ background: '#1D9E75' }}
        >
          Escolher outra atividade
        </button>
      </div>
    </>
  );
}

// ─── Floating chat ────────────────────────────────────────────────────────────

type ChatMsg = { role: 'user' | 'agent'; text: string };

function buildQuestionContext(question: ActivityQuestion): string {
  const lines = ['Estou resolvendo a seguinte questão do ENEM:'];
  if (question.context) {
    lines.push('--- Contexto ---');
    lines.push(question.context);
  }
  lines.push('--- Pergunta ---');
  lines.push(question.text);
  const opts = question.options
    .map(({ key, value, image }) => `${key.toUpperCase()}) ${image ? '[imagem]' : value}`)
    .join('\n');
  lines.push('--- Alternativas ---');
  lines.push(opts);
  return lines.join('\n');
}

function FloatingChat({ question }: { question: ActivityQuestion }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const prevIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Limpa o chat quando a questão muda
  useEffect(() => {
    if (prevIdRef.current !== null && prevIdRef.current !== question.id) {
      setMessages([]);
      setInput('');
    }
    prevIdRef.current = question.id;
  }, [question.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const isFirst = messages.length === 0;
    const userText = isFirst ? buildQuestionContext(question) + '\n\n' + msg : msg;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch('/api/ava/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText, history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: data.text ?? 'Não foi possível gerar uma resposta.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: 'Não foi possível conectar ao assistente.' },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-105 active:scale-95"
        style={{ background: '#1D9E75' }}
        title="Assistente"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Painel do chat */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          style={{ width: 320, maxHeight: 440 }}
        >
          {/* Cabeçalho */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#E1F5EE' }}
            >
              <MessageCircle className="w-3.5 h-3.5" style={{ color: '#0F6E56' }} />
            </div>
            <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 flex-1">
              Assistente
            </p>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center gap-2.5 pt-4">
                <p className="text-[11px] text-gray-400 text-center">
                  Tire dúvidas ou peça uma dica sobre a questão atual.
                </p>
                <button
                  onClick={() => send('Me dê uma dica para resolver essa questão sem revelar a resposta.')}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  💡 Pedir dica
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'user' ? (
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-[12px] text-white leading-relaxed"
                    style={{ background: '#1D9E75' }}
                  >
                    {m.text}
                  </div>
                ) : (
                  <div className="text-[12px] text-gray-800 dark:text-gray-200 leading-relaxed">
                    <MiniMarkdown text={m.text} bulletColor="#1D9E75" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Pensando...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Pergunte algo..."
              rows={1}
              className="flex-1 resize-none text-[12px] bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 py-1 leading-relaxed"
              style={{ maxHeight: 80 }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="p-1.5 rounded-lg flex-shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: '#1D9E75' }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Quiz screen ────────────────────────────────────────────────────────────────

function QuizScreen({ set, onBack }: { set: ActivitySet; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const question: ActivityQuestion = set.questions[idx];
  const selected = answers[question.id] ?? null;
  const total = set.questions.length;
  const isLast = idx === total - 1;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  const handleNext = () => {
    if (!isLast) {
      setIdx((i) => i + 1);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <ResultsScreen
        set={set}
        answers={answers}
        onBack={onBack}
        onRetry={() => {
          setIdx(0);
          setAnswers({});
          setElapsed(0);
          setDone(false);
        }}
      />
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Atividades
        </button>
        <p className="text-[12px] font-medium text-gray-700 dark:text-gray-200">
          {set.icon} {set.title}
        </p>
        {set.isSimulado ? (
          <div className="flex items-center gap-1 text-[12px] font-medium text-gray-700 dark:text-gray-200 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {formatTime(elapsed)}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">{idx + 1}/{total}</p>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-3">
        {set.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setIdx(i)}
            className="h-1.5 flex-1 rounded-full transition-all"
            style={{
              background: i === idx ? '#1D9E75' : answers[q.id] ? '#9FE1CB' : '#e5e7eb',
            }}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-[14px_16px] mb-3">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">
          Questão {idx + 1} · {question.area}
        </p>

        {/* Contexto */}
        {(question.context || question.contextImages?.length) && (
          <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
            {question.context && (
              <p
                className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed"
                style={{ whiteSpace: 'pre-line' }}
              >
                {question.context}
              </p>
            )}
            {question.contextImages?.map((b64, i) => (
              <img key={i} src={`data:image/png;base64,${b64}`} alt="" className="max-w-full mt-2 rounded" />
            ))}
          </div>
        )}

        {/* Pergunta */}
        <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
          {question.text}
        </p>

        {/* Alternativas */}
        <div className="flex flex-col gap-1.5">
          {question.options.map(({ key, value, image }) => (
            <div
              key={key}
              onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: key }))}
              className="flex items-start gap-2.5 py-1 cursor-pointer"
            >
              <div
                className={cn(
                  'mt-0.5 w-[15px] h-[15px] flex-shrink-0 rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors',
                  selected === key ? 'border-[#1D9E75]' : 'border-gray-300 dark:border-gray-600',
                )}
                style={selected === key ? { background: '#1D9E75' } : undefined}
              >
                {selected === key && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              {image ? (
                <img
                  src={`data:image/png;base64,${image}`}
                  alt={`Opção ${key.toUpperCase()}`}
                  className="max-h-28 rounded"
                />
              ) : (
                <span className="text-[12px] text-gray-900 dark:text-gray-100">
                  {key.toUpperCase()}) {value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navegação */}
      <div className="flex gap-2">
        {idx > 0 && (
          <button
            onClick={() => setIdx((i) => i - 1)}
            className="flex items-center gap-1 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!selected}
          className={cn(
            'flex items-center gap-1 px-4 py-2 text-sm text-white rounded-md font-medium transition-opacity',
            !selected ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90',
          )}
          style={{ background: '#1D9E75' }}
        >
          {isLast ? 'Ver resultado' : 'Próxima'}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat flutuante — sempre presente enquanto o quiz está ativo */}
      <FloatingChat question={question} />
    </>
  );
}

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function AtividadeScreen() {
  const [screen, setScreen] = useState<'list' | 'config' | 'quiz'>('list');
  const [configTarget, setConfigTarget] = useState<ConfigTarget | null>(null);
  const [activeSet, setActiveSet] = useState<ActivitySet | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleSelectTarget = useCallback((target: ConfigTarget) => {
    setConfigTarget(target);
    setScreen('config');
    setFetchError(null);
  }, []);

  const handleStart = useCallback(async (config: QuizConfig) => {
    setLoading(true);
    setFetchError(null);
    try {
      const set = await fetchSet(config);
      if (set.questions.length === 0) {
        setFetchError('Nenhuma questão encontrada para esta seleção.');
        setScreen('config');
        return;
      }
      setActiveSet(set);
      setScreen('quiz');
    } catch {
      setFetchError('Não foi possível carregar as questões. Tente novamente.');
      setScreen('config');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setScreen('list');
    setActiveSet(null);
    setConfigTarget(null);
    setFetchError(null);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#1D9E75]" />
        <p className="text-[12px] text-gray-500 dark:text-gray-400">Preparando questões...</p>
      </div>
    );
  }

  if (screen === 'quiz' && activeSet) {
    return <QuizScreen set={activeSet} onBack={handleBack} />;
  }

  if (screen === 'config' && configTarget) {
    return (
      <>
        {fetchError && (
          <p className="text-[11px] text-red-500 mb-2 text-center">{fetchError}</p>
        )}
        <ConfigScreen target={configTarget} onBack={handleBack} onStart={handleStart} />
      </>
    );
  }

  return <ActivityList onSelect={handleSelectTarget} />;
}
