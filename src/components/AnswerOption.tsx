'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const answerVariants = cva(
  'answer-accent relative w-full rounded-xl px-5 py-4 text-left font-body text-base transition-all duration-300 touch-manipulation select-none min-h-[56px] flex items-center',
  {
    variants: {
      state: {
        default:
          'glass-card text-on-surface cursor-pointer hover:border-primary/20',
        selected:
          'glass-card border-2 !border-primary text-on-surface glow-primary',
        correct:
          'answer-correct border-2 !border-secondary bg-secondary/10 text-on-surface glow-success',
        incorrect:
          'answer-incorrect border-2 !border-tertiary bg-tertiary/10 text-on-surface glow-error',
        dimmed: 'glass-card text-on-surface opacity-30 cursor-default',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

interface AnswerOptionProps extends VariantProps<typeof answerVariants> {
  label: string;
  text: string;
  index: number;
  onClick?: () => void;
  disabled?: boolean;
}

export default function AnswerOption({
  label,
  text,
  index,
  state,
  onClick,
  disabled,
}: AnswerOptionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 400, damping: 30 }}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      whileHover={!disabled ? { x: 4 } : undefined}
      className={cn(answerVariants({ state }))}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f8fafc] font-headline text-sm font-bold text-primary/80 border border-primary/10">
        {label}
      </span>
      <span className="leading-snug">{text}</span>
    </motion.button>
  );
}
