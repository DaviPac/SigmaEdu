'use client';

import { ACHIEVEMENTS } from '@/lib/mock/ava-data';
import { Card } from '@/components/ava/ava-ui';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, string> = {
  flame:       '🔥',
  map:         '🗺️',
  trophy:      '🏆',
  pencil:      '✏️',
  'chart-line':'📈',
  star:        '⭐',
};

export default function ConquistasScreen() {
  return (
    <>
      <div className="mb-3.5">
        <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-0.5">Conquistas</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">Desbloqueadas conforme você avança nas lacunas do ENEM</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map(({ id, icon, iconColor, title, description, xp, unlocked, progress }) => (
          <Card
            key={id}
            className={cn('text-center', !unlocked && 'opacity-45')}
          >
            <div className="text-[26px] mb-1.5">{ICON_MAP[icon] ?? '🎖️'}</div>
            <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100 mb-0.5">{title}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            {unlocked && xp > 0 && (
              <div
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium mt-2"
                style={{ background: '#FAEEDA', color: '#633806' }}
              >
                ⚡ +{xp} XP
              </div>
            )}
            {!unlocked && progress && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{progress}</p>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
