'use client';

import Link from 'next/link';
import { CheckCircle2, Lock, PlayCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { ENEM_LESSONS, type EnemLesson } from '@/lib/mock/ava-data';

type LessonStatus = EnemLesson['status'];

function groupByArea(lessons: EnemLesson[]): { area: string; lessons: EnemLesson[] }[] {
  const map = new Map<string, EnemLesson[]>();
  for (const l of lessons) {
    const arr = map.get(l.area) ?? [];
    arr.push(l);
    map.set(l.area, arr);
  }
  return Array.from(map.entries()).map(([area, ls]) => ({ area, lessons: ls }));
}

function proficiencyColor(pct: number) {
  if (pct >= 70) return '#1D9E75';
  if (pct >= 50) return '#EF9F27';
  return '#E24B4A';
}

function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === 'completed')
    return <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#1D9E75' }} />;
  if (status === 'available')
    return <PlayCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#185FA5' }} />;
  return <Lock className="w-4 h-4 flex-shrink-0 text-gray-300 dark:text-gray-600" />;
}

function LessonRow({ lesson }: { lesson: EnemLesson }) {
  const isLocked = lesson.status === 'locked';
  const isDone = lesson.status === 'completed';

  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <StatusIcon status={lesson.status} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-medium truncate"
          style={{ color: isLocked ? '#9ca3af' : '#111827' }}
        >
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-gray-400">
            {lesson.durationMin} min · +{lesson.xpReward} XP
          </span>
          <div className="flex items-center gap-1">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ width: 48, background: '#e5e7eb' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${lesson.proficiencyPct}%`,
                  background: proficiencyColor(lesson.proficiencyPct),
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{lesson.proficiencyPct}%</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      {isLocked ? (
        <span className="flex-shrink-0 text-[11px] text-gray-300 dark:text-gray-600 px-2">
          Bloqueada
        </span>
      ) : (
        <Link
          href={`/ava/aula/${lesson.id}`}
          className="flex-shrink-0 flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-opacity hover:opacity-80"
          style={
            isDone
              ? { background: '#F3F4F6', color: '#374151' }
              : { background: '#1D9E75', color: '#fff' }
          }
        >
          {isDone ? (
            <>
              <RotateCcw className="w-3 h-3" />
              Rever
            </>
          ) : (
            <>
              Iniciar
              <ChevronRight className="w-3 h-3" />
            </>
          )}
        </Link>
      )}
    </div>
  );
}

export default function AulasScreen() {
  const completed = ENEM_LESSONS.filter((l) => l.status === 'completed').length;
  const total = ENEM_LESSONS.length;
  const groups = groupByArea(ENEM_LESSONS);

  return (
    <>
      {/* Progress header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">Aulas ENEM</p>
        <p className="text-[11px] text-gray-400">
          {completed}/{total} concluídas
        </p>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden mb-5"
        style={{ background: '#e5e7eb' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(completed / total) * 100}%`, background: '#1D9E75' }}
        />
      </div>

      {/* Area groups */}
      <div className="space-y-4">
        {groups.map(({ area, lessons }) => (
          <div key={area}>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#9ca3af', letterSpacing: '.08em' }}
            >
              {area}
            </p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
              {lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
