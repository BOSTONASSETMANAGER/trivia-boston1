'use client';

import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  timeLeft: number;
  progress: number;
  duration: number;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownTimer({
  timeLeft,
  progress,
  duration,
}: CountdownTimerProps) {
  const isUrgent = timeLeft <= 3 && timeLeft > 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  const displayTime = Math.ceil(timeLeft);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        isUrgent && 'animate-pulse'
      )}
    >
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        className="rotate-[-90deg]"
      >
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-surface-variant opacity-30"
        />
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn(
            'transition-colors duration-300',
            isUrgent ? 'text-tertiary' : 'text-primary'
          )}
          stroke="currentColor"
          style={{
            transition: 'stroke-dashoffset 0.1s linear, color 0.3s',
          }}
        />
      </svg>
      <span
        className={cn(
          'absolute font-headline text-2xl font-bold tabular-nums',
          isUrgent ? 'text-tertiary' : 'text-on-surface'
        )}
      >
        {displayTime}
      </span>
    </div>
  );
}
