'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Trophy, Lightbulb, Clock } from 'lucide-react';
import { ACTIVITY_SETS, type ActivitySet, type ActivityQuestion } from '@/lib/mock/ava-data';

// ─── Utility ─────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Activity list ────────────────────────────────────────────────────────────

function ActivityList({ onSelect }: { onSelect: (set: ActivitySet) => void }) {
  return (
    <>
      <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 mb-3">Atividades</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {ACTIVITY_SETS.map((set) => {
          const totalXp = set.questions.reduce((s, q) => s + q.xpReward, 0);
          return (
            <button
              key={set.id}
              onClick={() => onSelect(set)}
              className={cn(
                'text-left p-3.5 rounded-lg border transition-all hover:shadow-sm',
                set.isSimulado
                  ? 'bg-[#FAEEDA] dark:bg-amber-950/30 border-[#F3C98A] dark:border-amber-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#9FE1CB] dark:hover:border-emerald-700',
              )}
            >
              <div className="text-[20px] mb-2">{set.icon}</div>
              <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100 leading-tight mb-0.5">
                {set.title}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">{set.area}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug mb-2">
                {set.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{set.questions.length} questões</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: '#E1F5EE', color: '#0F6E56' }}
                >
                  +{totalXp} XP
                </span>
              </div>
            </button>
          );
        })}
      </div>
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
  const correct = set.questions.filter((q) => answers[q.id] === q.correctKey).length;
  const xpEarned = set.questions
    .filter((q) => answers[q.id] === q.correctKey)
    .reduce((s, q) => s + q.xpReward, 0);
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
            style={{
              width: `${pct}%`,
              background: pct >= 60 ? '#1D9E75' : '#EF9F27',
            }}
          />
        </div>

        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${set.questions.length}, 1fr)` }}>
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

// ─── Quiz screen ────────────────────────────────────────────────────────────────

function QuizScreen({
  set,
  onBack,
}: {
  set: ActivitySet;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
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

  // Reset hint when question changes
  useEffect(() => { setShowHint(false); }, [idx]);

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
        onRetry={() => { setIdx(0); setAnswers({}); setElapsed(0); setDone(false); }}
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
          <p className="text-[11px] text-gray-400">
            {idx + 1}/{total}
          </p>
        )}
      </div>

      {/* Progress bar */}
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
        <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
          {question.text}
        </p>
        <div className="flex flex-col gap-1">
          {question.options.map(({ key, value }) => (
            <div
              key={key}
              onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: key }))}
              className={cn(
                'flex items-center gap-2.5 py-1.5 cursor-pointer text-[12px] text-gray-900 dark:text-gray-100',
              )}
            >
              <div
                className={cn(
                  'w-[15px] h-[15px] rounded-[3px] border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors',
                  selected === key
                    ? 'border-[#1D9E75]'
                    : 'border-gray-300 dark:border-gray-600',
                )}
                style={selected === key ? { background: '#1D9E75' } : undefined}
              >
                {selected === key && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              {key}) {value}
            </div>
          ))}
        </div>

        {/* Hint box */}
        {showHint && (
          <div
            className="mt-3 rounded-md px-3 py-2.5 text-[11px] leading-relaxed"
            style={{ background: '#E6F1FB', color: '#0C447C' }}
          >
            <p className="font-medium mb-0.5">💡 Dica</p>
            {question.hint}
          </div>
        )}
      </div>

      {/* Navigation */}
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
        <button
          onClick={() => setShowHint((h) => !h)}
          className={cn(
            'ml-auto flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-md border transition-colors',
            showHint
              ? 'border-[#7CB8EF] bg-[#E6F1FB] text-[#0C447C]'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
          )}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {showHint ? 'Ocultar dica' : 'Pedir dica'}
        </button>
      </div>
    </>
  );
}

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function AtividadeScreen() {
  const [activeSet, setActiveSet] = useState<ActivitySet | null>(null);

  if (activeSet) {
    return <QuizScreen set={activeSet} onBack={() => setActiveSet(null)} />;
  }

  return <ActivityList onSelect={setActiveSet} />;
}
