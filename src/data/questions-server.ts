import 'server-only';

import type { Question } from '@/types/game';

export interface ServerWeeklyTrivia {
  weekNumber: number;
  title: string;
  description?: string;
  questions: [Question, Question, Question];
}

/* ───────────── Pool de preguntas – Semana 1 ───────────── */

const week1Pool: Question[] = [
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
      'Por conflictos políticos entre países',
      'Por la distancia y falta de vuelos comerciales',
      'Por la caída del mercado de valores de Wall Street en 1929 que golpeó la economía de muchos países',
      'Por una epidemia que afectaba Europa',
    ],
    correctIndex: 2,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w1q4',
    text: '¿Quién fue el goleador del primer Mundial de la historia?',
    options: [
      'José Nasazzi',
      'Guillermo Stábile',
      'Obdulio Varela',
      'Héctor Scarone',
    ],
    correctIndex: 1,
    category: 'Fútbol',
  },
  {
    id: 'w1q5',
    text: '¿En qué estadio se jugó la final del Mundial 1930 entre Uruguay y Argentina?',
    options: ['Maracaná', 'Estadio Centenario', 'Monumental', 'Wembley'],
    correctIndex: 1,
    category: 'Fútbol',
  },
  {
    id: 'w1q6',
    text: '¿Qué significa diversificar una inversión?',
    options: [
      'Invertir todo en el activo más rentable',
      'Guardar el dinero en efectivo',
      'Cambiar de inversión cada mes',
      'Distribuir el capital en distintos activos para reducir el riesgo',
    ],
    correctIndex: 3,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w1q7',
    text: 'Cuando caen fuerte las acciones, ¿cómo se llama ese movimiento del mercado?',
    options: [
      'Rally',
      'Corrección o caída del mercado',
      'Expansión',
      'Rebote técnico',
    ],
    correctIndex: 1,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w1q8',
    text: '¿Cuál fue la inflación mensual en Argentina según el INDEC en marzo de 2026?',
    options: ['1,9%', '2,9%', '3,4%', '4,2%'],
    correctIndex: 2,
    category: 'Economía',
  },
  {
    id: 'w1q9',
    text: '¿Cuántos goles tiene Lionel Messi como máximo goleador histórico de la Selección Argentina?',
    options: ['89 goles', '98 goles', '108 goles', '115 goles'],
    correctIndex: 3,
    category: 'Fútbol',
  },
  {
    id: 'w1q10',
    text: '¿Cuánto habilitó el FMI desembolsar a Argentina en abril de 2026?',
    options: [
      'USD 500 millones',
      'USD 1.000 millones',
      'USD 2.000 millones',
      'USD 5.000 millones',
    ],
    correctIndex: 1,
    category: 'Mercado de Capitales',
  },
];

/* ───────────── Pool de preguntas – Semana 2 ───────────── */

const week2Pool: Question[] = [
  {
    id: 'w2q1',
    text: '¿Contra qué selección ganó Argentina su primer Mundial en 1978?',
    options: ['Brasil', 'Alemania', 'Italia', 'Holanda'],
    correctIndex: 3,
    category: 'Fútbol',
  },
  {
    id: 'w2q2',
    text: '¿Cuál fue la inflación anual en Argentina durante el Mundial 1978?',
    options: ['45%', '25%', '170%', '60%'],
    correctIndex: 2,
    category: 'Economía',
  },
  {
    id: 'w2q3',
    text: '¿En cuántos años la dictadura militar multiplicó por seis la deuda externa argentina?',
    options: ['En 3 años', 'En 7 años', 'En 10 años', 'En 15 años'],
    correctIndex: 1,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w2q4',
    text: '¿Cuántos goles convirtió Mario Alberto Kempes en el Mundial 1978, consagrándose máximo goleador del torneo?',
    options: ['4 goles', '5 goles', '6 goles', '8 goles'],
    correctIndex: 2,
    category: 'Fútbol',
  },
  {
    id: 'w2q5',
    text: '¿Qué mide el Riesgo País de Argentina, que en abril de 2026 se ubicó en torno a los 500–580 puntos básicos?',
    options: [
      'La inflación esperada para los próximos 12 meses',
      'El sobrecosto de tasa que Argentina paga sobre los bonos del Tesoro de EE.UU. para financiarse',
      'La cantidad de dólares que tiene el BCRA en reservas',
      'El nivel de pobreza medido por el INDEC',
    ],
    correctIndex: 1,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w2q6',
    text: '¿Cuántos goles hizo Lionel Messi en el Mundial Qatar 2022?',
    options: ['5 goles', '6 goles', '7 goles', '9 goles'],
    correctIndex: 2,
    category: 'Fútbol',
  },
  {
    id: 'w2q7',
    text: '¿Cuál fue la inflación mensual en Argentina según el INDEC en marzo de 2026?',
    options: ['1,9%', '2,9%', '3,4%', '4,2%'],
    correctIndex: 2,
    category: 'Economía',
  },
  {
    id: 'w2q8',
    text: '¿Contra qué selección debutará Argentina en el Mundial 2026, el martes 16 de junio?',
    options: ['Australia', 'México', 'Argelia', 'Estados Unidos'],
    correctIndex: 2,
    category: 'Fútbol',
  },
  {
    id: 'w2q9',
    text: '¿Qué organismo regula el mercado de capitales en Argentina y supervisa a las empresas como Boston Asset Manager?',
    options: [
      'BCRA — Banco Central',
      'AFIP',
      'CNV — Comisión Nacional de Valores',
      'ANSES',
    ],
    correctIndex: 2,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w2q10',
    text: '¿Cuál es el objetivo de inflación anual que fijó el Gobierno argentino para 2026 en el Presupuesto?',
    options: ['5%', '10,1%', '15%', '25%'],
    correctIndex: 1,
    category: 'Economía',
  },
];

/* ───────────── Semanas ───────────── */

interface ServerWeekPool {
  weekNumber: number;
  title: string;
  description?: string;
  availableDate: string;
  openTime: string;
  closeTime: string;
  pool: Question[];
}

const weekPools: ServerWeekPool[] = [
  {
    weekNumber: 1,
    title: 'Primer Mundial de la Historia',
    description: 'Uruguay 1930 - El torneo que lo empezó todo',
    availableDate: '2026-04-22',
    openTime: '10:00',
    closeTime: '23:59',
    pool: week1Pool,
  },
  {
    weekNumber: 2,
    title: 'Argentina Campeón 1978 y Camino al Mundial 2026',
    description: 'De Kempes y Holanda a Messi y el debut ante Argelia',
    availableDate: '2026-04-29',
    openTime: '10:00',
    closeTime: '23:59',
    pool: week2Pool,
  },
];

export { week1Pool, week2Pool, weekPools };

/* ───────────── Randomizer ───────────── */

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function shuffleOptions(q: Question): Question {
  const correctOption = q.options[q.correctIndex];
  const shuffled = shuffle([...q.options]);
  return {
    ...q,
    options: shuffled,
    correctIndex: shuffled.indexOf(correctOption),
  };
}

export function pickRandom(pool: Question[], count: number): Question[] {
  const picked = shuffle([...pool]).slice(0, count);
  return picked.map(shuffleOptions);
}

/* ───────────── Public server API ───────────── */

export function getWeekServer(weekNumber: number): ServerWeeklyTrivia | undefined {
  const wp = weekPools.find((w) => w.weekNumber === weekNumber);
  if (!wp) return undefined;
  const questions = pickRandom(wp.pool, 3) as [Question, Question, Question];
  return {
    weekNumber: wp.weekNumber,
    title: wp.title,
    description: wp.description,
    questions,
  };
}

export function getCurrentWeekServer(): ServerWeeklyTrivia {
  const wp = weekPools[1];
  const questions = pickRandom(wp.pool, 3) as [Question, Question, Question];
  return {
    weekNumber: wp.weekNumber,
    title: wp.title,
    description: wp.description,
    questions,
  };
}
