'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Shield, Mail, Lock, User } from 'lucide-react';
import { registerUser, loginUser } from '@/app/actions/auth';
import { getFingerprint } from '@/lib/auth/fingerprint';
import type { TriviaUser } from '@/types/game';

interface AuthScreenProps {
  onAuthenticated: (user: TriviaUser) => void;
}

type Tab = 'login' | 'register';

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fingerprint = await getFingerprint();

    startTransition(async () => {
      const result =
        tab === 'register'
          ? await registerUser(name, email, password, fingerprint)
          : await loginUser(email, password, fingerprint);

      if (result.ok) {
        onAuthenticated(result.user);
      } else {
        setError(result.error);
      }
    });
  }

  const isRegister = tab === 'register';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        className="divider-glow mb-10 w-32"
      />

      <div className="glass-card-elevated w-full max-w-sm rounded-2xl p-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-6"
        >
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl border border-primary/20" />
            <div className="absolute inset-2 rounded-xl bg-primary/5" />
            <Shield className="relative h-9 w-9 text-primary" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 h-3 w-3 border-t border-r border-primary/30 rounded-tr-md" />
            <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-primary/30 rounded-bl-md" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 text-center"
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/60">
            Acceso
          </p>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Trivia Boston
          </h1>
          <div className="divider-glow mx-auto mt-3 w-14" />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mb-6 grid grid-cols-2 rounded-xl border border-outline-variant/30 bg-surface-variant/20 p-1"
        >
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className="relative z-10 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition-colors touch-manipulation"
            >
              {t === 'login' ? (
                <LogIn className="h-3.5 w-3.5" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              <span className={tab === t ? 'text-on-primary' : 'text-outline'}>
                {t === 'login' ? 'Entrar' : 'Crear'}
              </span>
            </button>
          ))}
          <motion.div
            layoutId="auth-tab-pill"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute inset-y-1 rounded-lg bg-primary shadow-[0_2px_12px_rgba(37,99,235,0.4)]"
            style={{
              width: 'calc(50% - 0.25rem)',
              left: tab === 'login' ? '0.25rem' : 'calc(50% + 0rem)',
            }}
          />
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="wait" initial={false}>
            {isRegister && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="relative block">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline/60" />
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={pending}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-variant/20 px-4 py-3.5 pl-10 text-sm text-on-surface placeholder:text-outline/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    autoComplete="name"
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <label className="relative block">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline/60" />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-variant/20 px-4 py-3.5 pl-10 text-sm text-on-surface placeholder:text-outline/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              autoComplete="email"
            />
          </label>

          <label className="relative block">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline/60" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-variant/20 px-4 py-3.5 pl-10 text-sm text-on-surface placeholder:text-outline/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-tertiary/30 bg-tertiary/10 px-3 py-2 text-center text-xs font-medium text-tertiary"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            type="submit"
            disabled={pending}
            className="boston-cta btn-shine mt-2 flex w-full items-center justify-center gap-2.5 px-6 py-4 text-sm touch-manipulation disabled:opacity-60"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                Verificando
              </span>
            ) : (
              <>
                {isRegister ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isRegister ? 'Crear cuenta' : 'Entrar'}
              </>
            )}
          </motion.button>
        </form>

        {/* Security note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 text-center text-[10px] leading-relaxed text-outline/50"
        >
          Para prevenir abuso, limitamos 1 cuenta por dispositivo.
        </motion.p>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-[11px] tracking-wider text-outline/50"
      >
        BOSTON ASSET MANAGER SA
      </motion.p>
    </motion.div>
  );
}
