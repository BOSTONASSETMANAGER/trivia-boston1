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

export type GamePhase = 'start' | 'playing' | 'revealing' | 'finished';

export interface GameState {
  phase: GamePhase;
  currentWeek: WeeklyTrivia;
  currentQuestionIndex: number;
  results: AnswerResult[];
  selectedAnswer: number | null;
  timerActive: boolean;
}
