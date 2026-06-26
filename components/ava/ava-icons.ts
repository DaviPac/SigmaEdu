import {
  Eye, Headphones, Hand, Smile,
  Activity, ClipboardList, GraduationCap, MessageSquare, Glasses,
  type LucideIcon,
} from 'lucide-react';
import type { LearningStyleIconName } from '@/lib/mock/ava-data';

export type AgentId = 'diagnostico' | 'avaliador' | 'pedagogico' | 'tutor' | 'acompanhamento';

export const AGENT_ICONS: Record<AgentId, LucideIcon> = {
  diagnostico: Activity,
  avaliador:   ClipboardList,
  pedagogico:  GraduationCap,
  tutor:       MessageSquare,
  acompanhamento: Glasses,
};

export const LEARNING_STYLE_ICONS: Record<LearningStyleIconName, LucideIcon> = {
  Eye,
  Headphones,
  Hand,
  Smile,
};
