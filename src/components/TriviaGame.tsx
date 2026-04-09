'use client';

import { AnimatePresence } from 'motion/react';
import { useGameState } from '@/hooks/useGameState';
import StartScreen from './StartScreen';
import QuestionCard from './QuestionCard';
import ResultsScreen from './ResultsScreen';

export default function TriviaGame() {
  const {
    state,
    currentQuestion,
    score,
    startGame,
    selectAnswer,
    handleTimeout,
    nextQuestion,
    resetGame,
  } = useGameState();

  return (
    <AnimatePresence mode="wait">
      {state.phase === 'start' && (
        <StartScreen
          key="start"
          weekTitle={state.currentWeek.title}
          weekDescription={state.currentWeek.description}
          onStart={startGame}
        />
      )}

      {(state.phase === 'playing' || state.phase === 'revealing') &&
        currentQuestion && (
          <QuestionCard
            key={`q-${state.currentQuestionIndex}`}
            question={currentQuestion}
            questionIndex={state.currentQuestionIndex}
            results={state.results}
            isRevealing={state.phase === 'revealing'}
            selectedAnswer={state.selectedAnswer}
            onSelectAnswer={selectAnswer}
            onTimeout={handleTimeout}
            onNextQuestion={nextQuestion}
            timerActive={state.timerActive}
          />
        )}

      {state.phase === 'finished' && (
        <ResultsScreen
          key="results"
          results={state.results}
          week={state.currentWeek}
          score={score}
          onRestart={resetGame}
        />
      )}
    </AnimatePresence>
  );
}
