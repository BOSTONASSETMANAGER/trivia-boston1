'use client';

import { useCallback, useState } from 'react';
import { GameState, GamePhase, AnswerResult, WeeklyTrivia } from '@/types/game';
import { getCurrentWeek } from '@/data/questions';

function createInitialState(): GameState {
  return {
    phase: 'start',
    currentWeek: getCurrentWeek(),
    currentQuestionIndex: 0,
    results: [],
    selectedAnswer: null,
    timerActive: false,
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);

  const startGame = useCallback(() => {
    const week = getCurrentWeek();
    setState({
      phase: 'playing',
      currentWeek: week,
      currentQuestionIndex: 0,
      results: [],
      selectedAnswer: null,
      timerActive: true,
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
        return { ...prev, phase: 'finished' as GamePhase };
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
    setState(createInitialState());
  }, []);

  const currentQuestion =
    state.phase !== 'start'
      ? state.currentWeek.questions[state.currentQuestionIndex]
      : null;

  const score = state.results.filter((r) => r.isCorrect).length;

  return {
    state,
    currentQuestion,
    score,
    startGame,
    selectAnswer,
    handleTimeout,
    nextQuestion,
    resetGame,
  };
}
