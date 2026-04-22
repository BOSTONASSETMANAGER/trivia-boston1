'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GamePhase, AnswerResult, PublicQuestion } from '@/types/game';
import { startAttempt, submitAttempt } from '@/app/actions/attempts';
import { weeks } from '@/data/questions';

export type StartError =
  | 'session_expired'
  | 'week_not_available'
  | 'daily_limit_reached';

export type SubmitError =
  | 'session_expired'
  | 'invalid_attempt'
  | 'already_submitted'
  | 'daily_limit_reached'
  | 'save_failed';

export interface WeekMeta {
  weekNumber: number;
  title: string;
  description?: string;
}

export interface GameStateV2 {
  phase: GamePhase;
  weekMeta: WeekMeta | null;
  questions: PublicQuestion[];
  attemptId: string | null;
  currentQuestionIndex: number;
  answers: { questionId: string; selectedIndex: number | null }[];
  selectedAnswer: number | null;
  timerActive: boolean;
  finalResults: AnswerResult[];
  finalScore: number;
  finalTotalTimeMs: number;
  startError: StartError | null;
  submitError: SubmitError | null;
  attemptsRemaining: number | null;
  isStarting: boolean;
  isSubmitting: boolean;
}

function createInitialState(phase: GamePhase = 'auth'): GameStateV2 {
  return {
    phase,
    weekMeta: null,
    questions: [],
    attemptId: null,
    currentQuestionIndex: 0,
    answers: [],
    selectedAnswer: null,
    timerActive: false,
    finalResults: [],
    finalScore: 0,
    finalTotalTimeMs: 0,
    startError: null,
    submitError: null,
    attemptsRemaining: null,
    isStarting: false,
    isSubmitting: false,
  };
}

/** Default week number used when starting a new attempt. Taken from the first
 *  week metadata exported from `@/data/questions` (client-safe). */
function getDefaultWeekNumber(): number {
  return weeks[0]?.weekNumber ?? 1;
}

export function useGameState() {
  const [state, setState] = useState<GameStateV2>(() =>
    createInitialState('auth')
  );

  // Guards against double-submit from StrictMode re-running effects.
  // Reset whenever a new attempt starts.
  const submittedAttemptRef = useRef<string | null>(null);

  const authenticate = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'start' }));
  }, []);

  const startGame = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isStarting: true,
      startError: null,
      submitError: null,
    }));

    const weekNumber = getDefaultWeekNumber();
    try {
      const res = await startAttempt(weekNumber);
      if (res.ok) {
        setState({
          ...createInitialState('playing'),
          weekMeta: {
            weekNumber: res.weekNumber,
            title: res.weekTitle,
            description: res.weekDescription,
          },
          questions: res.questions,
          attemptId: res.attemptId,
          timerActive: true,
          isStarting: false,
        });
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'start',
          startError: res.error,
          isStarting: false,
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        phase: 'start',
        startError: 'week_not_available',
        isStarting: false,
      }));
    }
  }, []);

  const submitFinal = useCallback(
    async (
      attemptId: string,
      answers: { questionId: string; selectedIndex: number | null }[]
    ) => {
      try {
        const res = await submitAttempt(attemptId, answers);
        if (res.ok) {
          setState((prev) => ({
            ...prev,
            phase: 'finished',
            finalResults: res.results,
            finalScore: res.score,
            finalTotalTimeMs: res.totalTimeMs,
            attemptsRemaining: res.attemptsRemaining,
            submitError: null,
            isSubmitting: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            phase: 'finished',
            submitError: res.error,
            isSubmitting: false,
          }));
        }
      } catch {
        setState((prev) => ({
          ...prev,
          phase: 'finished',
          submitError: 'save_failed',
          isSubmitting: false,
        }));
      }
    },
    []
  );

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex >= prev.questions.length - 1) {
        // Just flip to submitting; the useEffect below will fire submitFinal.
        return {
          ...prev,
          phase: 'finished',
          isSubmitting: true,
          selectedAnswer: null,
          timerActive: false,
        };
      }

      return {
        ...prev,
        phase: 'playing',
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        timerActive: true,
      };
    });
  }, []);

  // Trigger submit as a side-effect (never inside a setState updater).
  useEffect(() => {
    if (
      state.isSubmitting &&
      state.attemptId &&
      submittedAttemptRef.current !== state.attemptId
    ) {
      submittedAttemptRef.current = state.attemptId;
      void submitFinal(state.attemptId, state.answers);
    }
  }, [state.isSubmitting, state.attemptId, state.answers, submitFinal]);

  const selectAnswer = useCallback((index: number) => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;
      const question = prev.questions[prev.currentQuestionIndex];
      if (!question) return prev;
      return {
        ...prev,
        phase: 'revealing',
        selectedAnswer: index,
        timerActive: false,
        answers: [
          ...prev.answers,
          { questionId: question.id, selectedIndex: index },
        ],
      };
    });
  }, []);

  const handleTimeout = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;
      const question = prev.questions[prev.currentQuestionIndex];
      if (!question) return prev;
      return {
        ...prev,
        phase: 'revealing',
        selectedAnswer: null,
        timerActive: false,
        answers: [
          ...prev.answers,
          { questionId: question.id, selectedIndex: null },
        ],
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(() => createInitialState('start'));
  }, []);

  const backToStart = useCallback(() => {
    setState(() => createInitialState('start'));
  }, []);

  const logoutPhase = useCallback(() => {
    setState(() => createInitialState('auth'));
  }, []);

  const showLeaderboard = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'leaderboard' }));
  }, []);

  const showProfile = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'profile' }));
  }, []);

  const showBostonPlus = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'bostonplus' }));
  }, []);

  const currentQuestion =
    (state.phase === 'playing' || state.phase === 'revealing') &&
    state.questions.length > 0
      ? state.questions[state.currentQuestionIndex] ?? null
      : null;

  // While playing, `finalResults` is empty; `score` is derived from submitted
  // server results once the game is finished.
  const score = state.finalScore;

  return {
    state,
    currentQuestion,
    score,
    authenticate,
    startGame,
    selectAnswer,
    handleTimeout,
    nextQuestion,
    resetGame,
    showLeaderboard,
    backToStart,
    logoutPhase,
    showProfile,
    showBostonPlus,
  };
}
