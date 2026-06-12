import { cn } from '@/lib/utils';
import type { TagVariant } from '@/lib/mock/ava-data';
import type { LucideIcon } from 'lucide-react';

export function Tag({ children, variant = 'teal' }: { children: React.ReactNode; variant?: TagVariant }) {
  const styles: Record<TagVariant, string> = {
    teal:   'bg-[#E1F5EE] text-[#0F6E56]',
    blue:   'bg-[#E6F1FB] text-[#185FA5]',
    amber:  'bg-[#FAEEDA] text-[#633806]',
    red:    'bg-[#FCEBEB] text-[#A32D2D]',
    purple: 'bg-[#EEEDFE] text-[#534AB7]',
    green:  'bg-[#EAF3DE] text-[#3B6D11]',
  };
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full inline-block', styles[variant])}>
      {children}
    </span>
  );
}

export function ProgressBar({ pct, color = '#1D9E75' }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase mb-2.5" style={{ letterSpacing: '.08em' }}>
      {children}
    </p>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-[14px_16px]', className)}>
      {children}
    </div>
  );
}

export function ChoiceBtn({ label, selected, onClick, icon: Icon }: {
  label: string; selected: boolean; onClick: () => void; icon?: LucideIcon;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-[7px] text-xs rounded-full border transition-all',
        selected
          ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#0F6E56]'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-750',
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </button>
  );
}

export function AgentRow({ icon: Icon, label, subtitle, bg, color, onClick, dot = true }: {
  icon: LucideIcon; label: string; subtitle: string;
  bg: string; color: string; onClick?: () => void; dot?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 p-[10px_12px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-white dark:hover:bg-gray-750 transition-colors"
    >
      <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-[14px] h-[14px]" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      {dot && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1D9E75' }} />}
    </div>
  );
}
