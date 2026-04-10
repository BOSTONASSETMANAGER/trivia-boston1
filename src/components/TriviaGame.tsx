'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import StadiumBackground from './StadiumBackground';
import AuthScreen from './AuthScreen';
import StartScreen from './StartScreen';
import QuestionCard from './QuestionCard';
import ResultsScreen from './ResultsScreen';
import LeaderboardScreen from './LeaderboardScreen';
import ProfileScreen from './ProfileScreen';
import BostonPlusScreen from './BostonPlusScreen';
import BottomNav, { type NavTab } from './BottomNav';

export default function TriviaGame() {
  const { user, hydrated, setAuthenticated, logout } = useAuth();
  const {
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
  } = useGameState();

  // Sync stored user → game phase on hydrate
  useEffect(() => {
    if (!hydrated) return;
    if (user && state.phase === 'auth') {
      authenticate();
    }
  }, [hydrated, user, state.phase, authenticate]);

  function handleAuthenticated(authUser: {
    id: string;
    name: string;
    email: string;
  }) {
    setAuthenticated(authUser);
    authenticate();
  }

  function handleLogout() {
    logout();
    logoutPhase();
  }

  function handleNav(tab: NavTab) {
    switch (tab) {
      case 'home':
        backToStart();
        break;
      case 'bostonplus':
        showBostonPlus();
        break;
      case 'ranking':
        showLeaderboard();
        break;
      case 'profile':
        showProfile();
        break;
    }
  }

  // Which tab should appear active in BottomNav
  function getActiveTab(): NavTab {
    switch (state.phase) {
      case 'bostonplus':
        return 'bostonplus';
      case 'leaderboard':
        return 'ranking';
      case 'profile':
        return 'profile';
      default:
        return 'home';
    }
  }

  // BottomNav visible only on non-gameplay phases + when authenticated
  const showNav =
    user !== null &&
    (state.phase === 'start' ||
      state.phase === 'leaderboard' ||
      state.phase === 'profile' ||
      state.phase === 'bostonplus' ||
      state.phase === 'finished');

  return (
    <>
      <StadiumBackground />
      <AnimatePresence mode="wait">
        {state.phase === 'auth' && (
          <AuthScreen key="auth" onAuthenticated={handleAuthenticated} />
        )}

        {state.phase === 'start' && user && (
          <StartScreen
            key="start"
            userName={user.name}
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

        {state.phase === 'finished' && user && (
          <ResultsScreen
            key="results"
            results={state.results}
            week={state.currentWeek}
            score={score}
            totalTimeMs={state.totalTimeMs ?? 0}
            userId={user.id}
            onRestart={resetGame}
            onShowLeaderboard={showLeaderboard}
          />
        )}

        {state.phase === 'leaderboard' && (
          <LeaderboardScreen
            key="leaderboard"
            weekNumber={state.currentWeek.weekNumber}
            weekTitle={state.currentWeek.title}
            currentUserId={user?.id ?? null}
            onBack={backToStart}
          />
        )}

        {state.phase === 'profile' && user && (
          <ProfileScreen
            key="profile"
            userId={user.id}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
          />
        )}

        {state.phase === 'bostonplus' && (
          <BostonPlusScreen key="bostonplus" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNav && (
          <BottomNav
            key="bottom-nav"
            active={getActiveTab()}
            onNavigate={handleNav}
          />
        )}
      </AnimatePresence>
    </>
  );
}
