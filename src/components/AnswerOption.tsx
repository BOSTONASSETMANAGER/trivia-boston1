'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const answerVariants = cva(
  'relative w-full rounded-xl px-5 py-4 text-left font-body text-base transition-all duration-300 touch-manipulation select-none min-h-[56px] flex items-center',
  {
    variants: {
      state: {
        default:
          'glass-card text-on-surface hover:border-primary/30 active:scale-[0.98] cursor-pointer',
        selected:
          'glass-card border-2 !border-primary text-on-surface glow-primary',
        correct:
          'border-2 !border-secondary bg-secondary/10 text-on-surface glow-success',
        incorrect:
          'border-2 !border-tertiary bg-tertiary/10 text-on-surface glow-error',
        dimmed: 'glass-card text-on-surface opacity-40 cursor-default',
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
  onClick?: () => void;
  disabled?: boolean;
}

const labels = ['A', 'B', 'C', 'D'];

export default function AnswerOption({
  label,
  text,
  state,
  onClick,
  disabled,
}: AnswerOptionProps) {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={cn(answerVariants({ state }))}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-variant/50 font-headline text-sm font-semibold text-primary">
        {label}
      </span>
      <span className="leading-snug">{text}</span>
    </motion.button>
  );
}
