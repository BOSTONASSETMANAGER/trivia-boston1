'use client';

import { motion } from 'motion/react';
import {
  Sparkles,
  Check,
  TrendingUp,
  FileText,
  Bell,
  BarChart3,
  Calculator,
  MessageCircle,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Plan {
  id: 'freemium' | 'premium' | 'premium-plus';
  name: string;
  tagline: string;
  priceMonthly: string;
  priceQuarterly?: string;
  icon: LucideIcon;
  features: string[];
  highlight?: boolean;
  ribbon?: string;
}

const PLANS: Plan[] = [
  {
    id: 'freemium',
    name: 'Freemium',
    tagline: 'Sin costo',
    priceMonthly: 'Gratis',
    icon: Sparkles,
    features: [
      'Acceso limitado a contenido exclusivo',
      'Registro sin compromiso',
      'Prueba de funcionalidades base',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Para inversores activos',
    priceMonthly: '$25.000',
    priceQuarterly: '$67.500',
    icon: TrendingUp,
    highlight: true,
    ribbon: 'Mas elegido',
    features: [
      'Instrumento del Dia',
      'Informes de Valor Razonable',
      'Informes macro, renta fija y variable',
      'Trade Ideas y alertas por email',
      'Carteras optimizadas por perfil',
      'Actualizacion diaria (dias habiles)',
    ],
  },
  {
    id: 'premium-plus',
    name: 'Premium +',
    tagline: 'Asesoramiento a medida',
    priceMonthly: '$35.000',
    priceQuarterly: '$94.500',
    icon: Star,
    features: [
      'Todo lo incluido en Premium',
      'Carteras personalizadas por objetivos',
      'Comentarios exclusivos de analistas',
      'Calculadoras de simulacion',
      'Asesoramiento estrategico de largo plazo',
    ],
  },
];

const BENEFITS: { icon: LucideIcon; label: string }[] = [
  { icon: BarChart3, label: 'Analisis diario' },
  { icon: FileText, label: 'Informes' },
  { icon: Bell, label: 'Alertas' },
  { icon: Calculator, label: 'Calculadoras' },
];

export default function BostonPlusScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5 pb-32"
      style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 3rem))' }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="boston-overline !text-[10px]">Boston+</span>
          </div>
          <h1 className="boston-title mb-1 text-3xl">Suscripciones</h1>
          <div className="divider-glow mx-auto mt-3 w-20" />
          <p className="mt-3 text-sm leading-relaxed text-outline/90">
            Analisis de mercado, informes financieros y alertas de oportunidades
            para decisiones de inversion informadas.
          </p>
        </motion.div>

        {/* Benefits strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-elevated mb-6 rounded-2xl p-4"
        >
          <div className="grid grid-cols-4 gap-2">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="boston-icon-box-sm">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-center text-[10px] font-medium leading-tight text-on-surface/80">
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Section title */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="boston-overline mb-3 text-center"
        >
          Elegi tu plan
        </motion.p>

        {/* Plan cards */}
        <div className="space-y-4">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} delay={0.35 + i * 0.1} />
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-6 rounded-2xl border border-outline-variant/40 bg-white/40 p-4 text-center"
        >
          <p className="mb-1 text-[11px] font-semibold text-on-surface">
            Planes trimestrales con 10% de descuento
          </p>
          <p className="text-[10px] text-outline">
            Pago con tarjeta (Mercado Pago) o transferencia bancaria.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const Icon = plan.icon;
  const isHighlight = plan.highlight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 22 }}
      className={`relative rounded-2xl p-5 ${
        isHighlight
          ? 'glass-card-elevated border-primary/40 shadow-[0_10px_35px_rgba(37,99,235,0.18)]'
          : 'glass-card'
      }`}
      style={
        isHighlight
          ? { borderWidth: '1.5px', borderColor: 'rgba(37,99,235,0.35)' }
          : undefined
      }
    >
      {/* Ribbon */}
      {plan.ribbon && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <div
            className="boston-cta px-3 py-1 text-[9px]"
            style={{ letterSpacing: '0.08em', borderRadius: '999px' }}
          >
            {plan.ribbon}
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="mb-4 flex items-start gap-3">
        <div
          className={isHighlight ? 'boston-icon-box' : 'boston-icon-box-sm'}
          style={
            isHighlight
              ? {
                  background:
                    'linear-gradient(135deg, rgba(29,57,105,0.15), rgba(37,99,235,0.18))',
                }
              : undefined
          }
        >
          <Icon
            className={isHighlight ? 'h-7 w-7' : 'h-5 w-5'}
            strokeWidth={1.8}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="boston-title text-lg">{plan.name}</h3>
          <p className="text-[11px] text-outline">{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4 flex items-baseline gap-1.5 border-b border-outline-variant/40 pb-4">
        <span
          className={`font-headline font-bold tabular-nums ${
            isHighlight ? 'text-primary' : 'text-on-surface'
          } ${plan.priceMonthly === 'Gratis' ? 'text-2xl' : 'text-3xl'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {plan.priceMonthly}
        </span>
        {plan.priceMonthly !== 'Gratis' && (
          <span className="text-xs text-outline">/mes</span>
        )}
        {plan.priceQuarterly && (
          <span className="ml-auto text-[10px] text-outline/80">
            {plan.priceQuarterly}/trim
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-5 space-y-2">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <div
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                isHighlight
                  ? 'bg-primary text-on-primary'
                  : 'bg-secondary/15 text-secondary'
              }`}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </div>
            <span className="text-[12px] leading-snug text-on-surface/85">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isHighlight ? (
        <button className="boston-cta btn-shine flex w-full items-center justify-center gap-2 px-4 py-3 text-xs touch-manipulation">
          <MessageCircle className="h-3.5 w-3.5" />
          Consultar plan
        </button>
      ) : (
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary/5 hover:border-primary/50 touch-manipulation">
          {plan.priceMonthly === 'Gratis' ? 'Comenzar gratis' : 'Consultar plan'}
        </button>
      )}
    </motion.div>
  );
}
