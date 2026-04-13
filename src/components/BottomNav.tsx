'use client';

import { motion, useReducedMotion } from 'motion/react';
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
  const prefersReducedMotion = useReducedMotion();

  const navInitial = prefersReducedMotion
    ? { y: 0, opacity: 0 }
    : { y: 80, opacity: 0 };
  const navExit = prefersReducedMotion
    ? { y: 0, opacity: 0 }
    : { y: 80, opacity: 0 };

  return (
    <motion.nav
      aria-label="Navegación principal"
      initial={navInitial}
      animate={{ y: 0, opacity: 1 }}
      exit={navExit}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 28,
        duration: prefersReducedMotion ? 0.15 : undefined,
      }}
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{
        // Lift above iOS home indicator. Base offset + safe-area inset.
        bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
        // Hint the compositor for smooth transforms on scroll.
        willChange: 'transform',
      }}
    >
      <div
        role="tablist"
        className="glass-panel flex items-center gap-1 rounded-full border px-2 py-2 shadow-[0_10px_40px_rgba(30,64,175,0.18)]"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
              onClick={() => onNavigate(tab.id)}
              className="relative flex min-h-[48px] min-w-[62px] flex-col items-center justify-center rounded-full px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 400, damping: 30 }
                  }
                  className="absolute inset-0 rounded-full bg-primary shadow-[0_4px_16px_rgba(37,99,235,0.4)]"
                />
              )}
              <Icon
                aria-hidden="true"
                focusable="false"
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
