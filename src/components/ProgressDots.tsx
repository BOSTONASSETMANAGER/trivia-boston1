'use client';

import { cn } from '@/lib/utils';
import { AnswerResult } from '@/types/game';

interface ProgressDotsProps {
  currentIndex: number;
  results: AnswerResult[];
  total: number;
}

export default function ProgressDots({
  currentIndex,
  results,
  total,
}: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const result = results[i];
        const isCurrent = i === currentIndex;

        let dotColor = 'bg-surface-variant';
        if (result) {
          dotColor = result.isCorrect ? 'bg-secondary' : 'bg-tertiary';
        } else if (isCurrent) {
          dotColor = 'bg-primary';
        }

        return (
          <div
            key={i}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300',
              dotColor,
              isCurrent ? 'w-8' : 'w-2.5'
            )}
          />
        );
      })}
    </div>
  );
}
