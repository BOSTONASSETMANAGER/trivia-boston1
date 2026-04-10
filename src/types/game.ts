export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: string;
}

export interface WeeklyTrivia {
  weekNumber: number;
  title: string;
  description?: string;
  questions: [Question, Question, Question];
}

export type AnswerResult = {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  timeRemaining: number;
};

export type GamePhase =
  | 'auth'
  | 'start'
  | 'playing'
  | 'revealing'
  | 'finished'
  | 'leaderboard'
  | 'profile'
  | 'bostonplus';

export interface GameState {
  phase: GamePhase;
  currentWeek: WeeklyTrivia;
  currentQuestionIndex: number;
  results: AnswerResult[];
  selectedAnswer: number | null;
  timerActive: boolean;
  startTimestamp: number | null;
  totalTimeMs: number | null;
}

export interface TriviaUser {
  id: string;
  name: string;
  email: string;
}

export interface LeaderboardEntry {
  sessionId: string;
  userId: string;
  name: string;
  weekNumber: number;
  score: number;
  totalTimeMs: number;
  completedAt: string;
}
