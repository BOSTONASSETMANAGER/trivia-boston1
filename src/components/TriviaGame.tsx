'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentWeekAvailability, weeks } from '@/data/questions';
import { getDailyAttempts } from '@/app/actions/sessions';
import StadiumBackground from './StadiumBackground';
import AuthScreen from './AuthScreen';
import StartScreen from './StartScreen';
import QuestionCard from './QuestionCard';
import ResultsScreen from './ResultsScreen';
import LeaderboardScreen from './LeaderboardScreen';
import ProfileScreen from './ProfileScreen';
import BostonPlusScreen from './BostonPlusScreen';
import BottomNav, { type NavTab } from './BottomNav';

function startErrorMessage(
  err: 'session_expired' | 'week_not_available' | 'daily_limit_reached' | null
): string | null {
  if (!err) return null;
  switch (err) {
    case 'week_not_available':
      return 'La trivia no está disponible en este momento.';
    case 'daily_limit_reached':
      return 'Ya usaste tus 3 intentos de hoy. Volvé mañana.';
    case 'session_expired':
      return 'Se cerró tu sesión. Volvé a iniciar sesión.';
    default:
      return null;
  }
}

export default function TriviaGame() {
  const { user, hydrated, setAuthenticated, logout, handleSessionExpired } =
    useAuth();
  const {
    state,
    currentQuestion,
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

  const [weekAvailability, setWeekAvailability] = useState(() =>
    getCurrentWeekAvailability()
  );
  const [attempts, setAttempts] = useState<{
    remaining: number;
    limit: number;
  } | null>(null);

  // Re-check availability every 30s so lock/unlock happens without reload
  useEffect(() => {
    const id = setInterval(() => {
      setWeekAvailability(getCurrentWeekAvailability());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const refreshAttempts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getDailyAttempts();
      setAttempts({ remaining: res.remaining, limit: res.limit });
    } catch {
      /* silent */
    }
  }, [user]);

  // Refresh attempts when returning to start screen or when auth changes
  useEffect(() => {
    if (user && state.phase === 'start') {
      refreshAttempts();
    }
  }, [user, state.phase, refreshAttempts]);

  // Sync stored user → game phase on hydrate
  useEffect(() => {
    if (!hydrated) return;
    if (user && state.phase === 'auth') {
      authenticate();
    }
  }, [hydrated, user, state.phase, authenticate]);

  const handleSessionDisplaced = useCallback(() => {
    handleSessionExpired();
    logoutPhase();
    if (typeof window !== 'undefined') {
      window.alert(
        'Se inició sesión desde otro dispositivo. Volvé a iniciar sesión.'
      );
    }
  }, [handleSessionExpired, logoutPhase]);

  // Propagate session_expired errors from start/submit into the shared handler.
  useEffect(() => {
    if (state.startError === 'session_expired') {
      handleSessionDisplaced();
    }
  }, [state.startError, handleSessionDisplaced]);

  useEffect(() => {
    if (state.submitError === 'session_expired') {
      handleSessionDisplaced();
    }
  }, [state.submitError, handleSessionDisplaced]);

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

  const showNav =
    user !== null &&
    (state.phase === 'start' ||
      state.phase === 'leaderboard' ||
      state.phase === 'profile' ||
      state.phase === 'bostonplus' ||
      state.phase === 'finished');

  // Attempts remaining displayed on StartScreen: prefer the server-reported
  // number from the most recent submit (state.attemptsRemaining), else the
  // getDailyAttempts fetch. If startError reports daily_limit_reached,
  // force 0.
  const displayedAttemptsRemaining =
    state.startError === 'daily_limit_reached'
      ? 0
      : state.attemptsRemaining ?? attempts?.remaining ?? null;

  // Use metadata from the last fetched week (when we're in a game) or fall
  // back to the currently active week metadata for StartScreen text.
  const staticWeek =
    weeks.find((w) => w.weekNumber === weekAvailability.weekNumber) ??
    weeks[weeks.length - 1];
  const startWeekTitle = staticWeek?.title ?? '';
  const startWeekDescription = staticWeek?.description;

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
            weekTitle={startWeekTitle}
            weekDescription={startWeekDescription}
            locked={!weekAvailability.available}
            availableDate={weekAvailability.availableDate}
            openTime={weekAvailability.openTime}
            closeTime={weekAvailability.closeTime}
            status={weekAvailability.status}
            attemptsRemaining={displayedAttemptsRemaining}
            attemptsLimit={attempts?.limit ?? 3}
            isStarting={state.isStarting}
            startError={startErrorMessage(state.startError)}
            onStart={() => {
              void startGame();
            }}
          />
        )}

        {(state.phase === 'playing' || state.phase === 'revealing') &&
          currentQuestion && (
            <QuestionCard
              key={`q-${state.currentQuestionIndex}`}
              question={currentQuestion}
              questionIndex={state.currentQuestionIndex}
              answers={state.answers}
              isRevealing={state.phase === 'revealing'}
              selectedAnswer={state.selectedAnswer}
              onSelectAnswer={selectAnswer}
              onTimeout={handleTimeout}
              onNextQuestion={nextQuestion}
              timerActive={state.timerActive}
            />
          )}

        {state.phase === 'finished' && user && state.weekMeta && (
          <ResultsScreen
            key="results"
            results={state.finalResults}
            questions={state.questions}
            week={state.weekMeta}
            score={state.finalScore}
            totalTimeMs={state.finalTotalTimeMs}
            attemptsRemaining={state.attemptsRemaining}
            submitError={state.submitError}
            isSubmitting={state.isSubmitting}
            onRestart={resetGame}
            onShowLeaderboard={showLeaderboard}
          />
        )}

        {state.phase === 'leaderboard' && (
          <LeaderboardScreen
            key="leaderboard"
            weekNumber={state.weekMeta?.weekNumber ?? staticWeek?.weekNumber ?? 1}
            weekTitle={state.weekMeta?.title ?? startWeekTitle}
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
