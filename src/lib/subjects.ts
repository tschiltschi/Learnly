import { BookOpen, Calculator, Languages, type LucideIcon } from 'lucide-react';
import type { SubjectKey } from '@/types';

export interface SubjectMeta {
  key: SubjectKey;
  name: string;
  route: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind class fragments, written out in full so the JIT picks them up. */
  text: string;
  bg: string;
  soft: string;
  ring: string;
  gradient: string;
  hex: string;
}

export const SUBJECTS: Record<SubjectKey, SubjectMeta> = {
  languages: {
    key: 'languages',
    name: 'Languages',
    route: 'languages',
    description: 'Learn vocabulary, grammar and languages.',
    icon: Languages,
    text: 'text-violet-300',
    bg: 'bg-violet-500',
    soft: 'bg-violet-500/10',
    ring: 'ring-violet-400/30',
    gradient: 'from-violet-500/25 via-violet-500/5 to-transparent',
    hex: '#8b5cf6',
  },
  math: {
    key: 'math',
    name: 'Mathematics',
    route: 'math',
    description: 'Understand formulas and practice calculations.',
    icon: Calculator,
    text: 'text-sky-300',
    bg: 'bg-sky-500',
    soft: 'bg-sky-500/10',
    ring: 'ring-sky-400/30',
    gradient: 'from-sky-500/25 via-sky-500/5 to-transparent',
    hex: '#3b82f6',
  },
  theory: {
    key: 'theory',
    name: 'Theory',
    route: 'theory',
    description: 'Learn biology, history, computer science and more.',
    icon: BookOpen,
    text: 'text-emerald-300',
    bg: 'bg-emerald-500',
    soft: 'bg-emerald-500/10',
    ring: 'ring-emerald-400/30',
    gradient: 'from-emerald-500/25 via-emerald-500/5 to-transparent',
    hex: '#10b981',
  },
};
