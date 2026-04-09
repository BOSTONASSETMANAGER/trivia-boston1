import { WeeklyTrivia } from '@/types/game';

export const weeks: WeeklyTrivia[] = [
  {
    weekNumber: 1,
    title: 'Primer Mundial de la Historia',
    description: 'Uruguay 1930 - El torneo que lo empezó todo',
    questions: [
      {
        id: 'w1q1',
        text: '¿En qué país se jugó el primer Mundial de la historia en 1930?',
        options: ['Brasil', 'Argentina', 'Uruguay', 'Italia'],
        correctIndex: 2,
        category: 'Fútbol',
      },
      {
        id: 'w1q2',
        text: '¿Qué hecho político sacudió a Argentina el mismo año del primer Mundial?',
        options: [
          'La creación del Banco Central',
          'La primera hiperinflación',
          'El primer golpe de Estado cívico-militar',
          'La fundación de YPF',
        ],
        correctIndex: 2,
        category: 'Economía',
      },
      {
        id: 'w1q3',
        text: '¿Por qué solo 12 de las 40 naciones afiliadas a la FIFA viajaron al primer Mundial en 1930?',
        options: [
          'Por conflictos políticos entre países Europeos',
          'Por la distancia y falta de vuelos comerciales',
          'Por la caída del mercado de valores de Wall Street en 1929',
          'Por una epidemia que afectaba Europa',
        ],
        correctIndex: 2,
        category: 'Historia',
      },
    ],
  },
];

export function getWeek(weekNumber: number): WeeklyTrivia | undefined {
  return weeks.find((w) => w.weekNumber === weekNumber);
}

export function getCurrentWeek(): WeeklyTrivia {
  return weeks[0];
}
