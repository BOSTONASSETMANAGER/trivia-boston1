'use client';

import { useCallback, useState } from 'react';
import { GameState, GamePhase, AnswerResult } from '@/types/game';
import { getCurrentWeek } from '@/data/questions';

function createInitialState(phase: GamePhase = 'auth'): GameState {
  return {
    phase,
    currentWeek: getCurrentWeek(),
    currentQuestionIndex: 0,
    results: [],
    selectedAnswer: null,
    timerActive: false,
    startTimestamp: null,
    totalTimeMs: null,
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => createInitialState('auth'));

  const authenticate = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'start' as GamePhase }));
  }, []);

  const startGame = useCallback(() => {
    const week = getCurrentWeek();
    setState({
      phase: 'playing',
      currentWeek: week,
      currentQuestionIndex: 0,
      results: [],
      selectedAnswer: null,
      timerActive: true,
      startTimestamp: Date.now(),
      totalTimeMs: null,
    });
  }, []);

  const selectAnswer = useCallback(
    (index: number, timeRemaining: number) => {
      setState((prev) => {
        if (prev.phase !== 'playing') return prev;

        const question = prev.currentWeek.questions[prev.currentQuestionIndex];
        const result: AnswerResult = {
          questionId: question.id,
          selectedIndex: index,
          correctIndex: question.correctIndex,
          isCorrect: index === question.correctIndex,
          timeRemaining,
        };

        return {
          ...prev,
          phase: 'revealing' as GamePhase,
          selectedAnswer: index,
          timerActive: false,
          results: [...prev.results, result],
        };
      });
    },
    []
  );

  const handleTimeout = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;

      const question = prev.currentWeek.questions[prev.currentQuestionIndex];
      const result: AnswerResult = {
        questionId: question.id,
        selectedIndex: null,
        correctIndex: question.correctIndex,
        isCorrect: false,
        timeRemaining: 0,
      };

      return {
        ...prev,
        phase: 'revealing' as GamePhase,
        selectedAnswer: null,
        timerActive: false,
        results: [...prev.results, result],
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex >= 2) {
        const totalTimeMs = prev.startTimestamp
          ? Date.now() - prev.startTimestamp
          : 0;
        return {
          ...prev,
          phase: 'finished' as GamePhase,
          totalTimeMs,
        };
      }

      return {
        ...prev,
        phase: 'playing' as GamePhase,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        timerActive: true,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      ...createInitialState('start'),
      currentWeek: prev.currentWeek,
    }));
  }, []);

  const showLeaderboard = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'leaderboard' as GamePhase }));
  }, []);

  const backToStart = useCallback(() => {
    setState((prev) => ({
      ...createInitialState('start'),
      currentWeek: prev.currentWeek,
    }));
  }, []);

  const logoutPhase = useCallback(() => {
    setState(() => createInitialState('auth'));
  }, []);

  const showProfile = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'profile' as GamePhase }));
  }, []);

  const showBostonPlus = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'bostonplus' as GamePhase }));
  }, []);

  const currentQuestion =
    state.phase === 'playing' || state.phase === 'revealing'
      ? state.currentWeek.questions[state.currentQuestionIndex]
      : null;

  const score = state.results.filter((r) => r.isCorrect).length;

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
