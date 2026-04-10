import type { LucideIcon } from 'lucide-react';
import {
  Trophy,
  Award,
  Crown,
  Flame,
  Zap,
  Target,
  Medal,
  Star,
} from 'lucide-react';

export type MedalTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type MedalCategory =
  | 'performance'
  | 'streaks'
  | 'speed'
  | 'persistence'
  | 'milestones'
  | 'ranking';

export interface Medal {
  id: string;
  name: string;
  description: string;
  hint: string;
  tier: MedalTier;
  category: MedalCategory;
  icon: LucideIcon;
}

export const MEDAL_CATALOG: Medal[] = [
  // Performance
  {
    id: 'perfect-game',
    name: 'Partida Perfecta',
    description: 'Contesta las 3 preguntas sin errar.',
    hint: 'Conseguí 3/3 en cualquier semana.',
    tier: 'silver',
    category: 'performance',
    icon: Trophy,
  },
  {
    id: 'perfect-trio',
    name: 'Triple Perfecto',
    description: '3 partidas perfectas en semanas distintas.',
    hint: 'Acumulá 3 partidas de 3/3 en semanas diferentes.',
    tier: 'gold',
    category: 'performance',
    icon: Award,
  },
  {
    id: 'flawless-decade',
    name: 'Decada Impecable',
    description: '10 partidas perfectas en total.',
    hint: 'Llegá a 10 partidas de 3/3 totales.',
    tier: 'platinum',
    category: 'performance',
    icon: Crown,
  },
  // Streaks
  {
    id: 'week-streak-3',
    name: 'Racha de Fuego',
    description: '3 semanas consecutivas jugadas.',
    hint: 'Jugá 3 semanas seguidas sin saltear ninguna.',
    tier: 'silver',
    category: 'streaks',
    icon: Flame,
  },
  {
    id: 'week-streak-win-3',
    name: 'Racha Invicta',
    description: 'Gana 3 semanas seguidas con 3/3.',
    hint: 'Perfect game 3 semanas consecutivas.',
    tier: 'gold',
    category: 'streaks',
    icon: Flame,
  },
  // Speed
  {
    id: 'speedrun',
    name: 'Velocista',
    description: 'Completá una partida en menos de 15 segundos.',
    hint: 'Responde las 3 preguntas rapido.',
    tier: 'silver',
    category: 'speed',
    icon: Zap,
  },
  {
    id: 'perfect-speedrun',
    name: 'Rayo Perfecto',
    description: 'Partida perfecta en menos de 12 segundos.',
    hint: '3/3 en menos de 12 segundos.',
    tier: 'platinum',
    category: 'speed',
    icon: Zap,
  },
  // Persistence
  {
    id: 'try-harder',
    name: 'Insistente',
    description: 'Jugá 5 veces la misma semana.',
    hint: 'Volvé a intentar la misma semana 5 veces.',
    tier: 'bronze',
    category: 'persistence',
    icon: Target,
  },
  {
    id: 'veteran-50',
    name: 'Veterano',
    description: '50 partidas jugadas en total.',
    hint: 'Acumulá 50 partidas completadas.',
    tier: 'gold',
    category: 'persistence',
    icon: Medal,
  },
  // Milestones
  {
    id: 'first-blood',
    name: 'Primera Sangre',
    description: 'Completá tu primera partida.',
    hint: 'Jugá una vez para desbloquearla.',
    tier: 'bronze',
    category: 'milestones',
    icon: Star,
  },
  {
    id: 'decimo-jugador',
    name: 'Decimo Jugador',
    description: '10 partidas completadas.',
    hint: 'Llegá a 10 partidas.',
    tier: 'silver',
    category: 'milestones',
    icon: Star,
  },
  // Ranking
  {
    id: 'podium',
    name: 'En el Podio',
    description: 'Terminá en el top 3 del leaderboard semanal.',
    hint: 'Posicionate en el top 3 de alguna semana.',
    tier: 'gold',
    category: 'ranking',
    icon: Trophy,
  },
  {
    id: 'king-of-the-week',
    name: 'Rey de la Semana',
    description: 'Sé #1 del leaderboard una semana completa.',
    hint: 'Liderá una semana hasta que termine.',
    tier: 'platinum',
    category: 'ranking',
    icon: Crown,
  },
];

export const CATEGORY_LABELS: Record<MedalCategory, string> = {
  performance: 'Performance',
  streaks: 'Rachas',
  speed: 'Velocidad',
  persistence: 'Persistencia',
  milestones: 'Hitos',
  ranking: 'Ranking',
};

export const TIER_COLORS: Record<MedalTier, { text: string; bg: string; border: string; glow: string }> = {
  bronze: {
    text: 'text-amber-700',
    bg: 'bg-amber-100/60',
    border: 'border-amber-600/40',
    glow: 'rgba(180, 83, 9, 0.25)',
  },
  silver: {
    text: 'text-slate-500',
    bg: 'bg-slate-100/60',
    border: 'border-slate-400/50',
    glow: 'rgba(100, 116, 139, 0.25)',
  },
  gold: {
    text: 'text-amber-500',
    bg: 'bg-amber-50/70',
    border: 'border-amber-400/50',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  platinum: {
    text: 'text-sky-600',
    bg: 'bg-sky-50/70',
    border: 'border-sky-400/50',
    glow: 'rgba(14, 165, 233, 0.3)',
  },
};
