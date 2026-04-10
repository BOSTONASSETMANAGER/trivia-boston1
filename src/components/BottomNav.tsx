'use client';

import { motion } from 'motion/react';
import { Home, Sparkles, Trophy, User } from 'lucide-react';

export type NavTab = 'home' | 'bostonplus' | 'ranking' | 'profile';

interface BottomNavProps {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

const TABS: Array<{
  id: NavTab;
  label: string;
  icon: typeof Home;
}> = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'bostonplus', label: 'Boston+', icon: Sparkles },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'profile', label: 'Perfil', icon: User },
];

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="glass-panel flex items-center gap-1 rounded-full border px-2 py-2 shadow-[0_10px_40px_rgba(30,64,175,0.18)] backdrop-blur-2xl">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex min-w-[62px] touch-manipulation flex-col items-center justify-center rounded-full px-3 py-2 transition-colors"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-primary shadow-[0_4px_16px_rgba(37,99,235,0.4)]"
                />
              )}
              <Icon
                className={`relative z-10 h-[18px] w-[18px] ${
                  isActive ? 'text-on-primary' : 'text-on-surface/70'
                }`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={`relative z-10 mt-0.5 text-[10px] font-semibold tracking-wide ${
                  isActive ? 'text-on-primary' : 'text-on-surface/70'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
