'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownReturn {
  timeLeft: number;
  progress: number;
  isRunning: boolean;
}

export function useCountdown(
  duration: number,
  onExpire: () => void,
  isActive: boolean
): UseCountdownReturn {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  onExpireRef.current = onExpire;

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, duration - elapsed);

    setTimeLeft(remaining);

    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpireRef.current();
      return;
    }

    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [duration]);

  useEffect(() => {
    if (isActive) {
      expiredRef.current = false;
      startTimeRef.current = performance.now();
      setTimeLeft(duration);
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, duration, tick]);

  const progress = timeLeft / duration;

  return { timeLeft, progress, isRunning: isActive && timeLeft > 0 };
}
