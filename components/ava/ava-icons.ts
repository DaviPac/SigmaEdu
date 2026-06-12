import {
  Eye, Headphones, Hand, Smile,
  Activity, ClipboardList, GraduationCap, MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import type { LearningStyleIconName } from '@/lib/mock/ava-data';

export type AgentId = 'diagnostico' | 'avaliador' | 'pedagogico' | 'tutor';

export const AGENT_ICONS: Record<AgentId, LucideIcon> = {
  diagnostico: Activity,
  avaliador:   ClipboardList,
  pedagogico:  GraduationCap,
  tutor:       MessageSquare,
};

export const LEARNING_STYLE_ICONS: Record<LearningStyleIconName, LucideIcon> = {
  Eye,
  Headphones,
  Hand,
  Smile,
};
