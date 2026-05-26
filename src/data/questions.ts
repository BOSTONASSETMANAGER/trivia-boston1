/* ───────────── Client-safe week metadata and availability helpers ───────────── */

export interface WeekPool {
  weekNumber: number;
  title: string;
  description?: string;
  /** Date string YYYY-MM-DD when this trivia is playable (America/Argentina/Buenos_Aires) */
  availableDate: string;
  /** Opening time HH:mm (UTC-3) */
  openTime: string;
  /** Closing time HH:mm (UTC-3), inclusive */
  closeTime: string;
}

const weekMeta: WeekPool[] = [
  {
    weekNumber: 1,
    title: 'Primer Mundial de la Historia',
    description: '',
    availableDate: '2026-04-22',
    openTime: '10:00',
    closeTime: '23:59',
  },
  {
    weekNumber: 2,
    title: 'Argentina Campeón 1978 y Camino al Mundial 2026',
    description: '',
    availableDate: '2026-04-29',
    openTime: '10:00',
    closeTime: '23:59',
  },
  {
    weekNumber: 3,
    title: 'SEMANA 3: Mundial 1986 México, Argentina campeón.',
    description: '',
    availableDate: '2026-05-06',
    openTime: '09:30',
    closeTime: '23:59',
  },
  {
    weekNumber: 4,
    title: 'SEMANA 4: Mundial 1994 Estados Unidos.',
    description: '',
    availableDate: '2026-05-13',
    openTime: '10:00',
    closeTime: '23:59',
  },
  {
    weekNumber: 5,
    title: 'SEMANA 5: Mundial 2014 Brasil y rumbo al Mundial 2026.',
    description: '',
    availableDate: '2026-05-20',
    openTime: '10:00',
    closeTime: '23:59',
  },
  {
    weekNumber: 6,
    title: 'SEMANA 6: Mundial 2022, Qatar — la tercera estrella',
    description: '',
    availableDate: '2026-05-27',
    openTime: '10:00',
    closeTime: '23:59',
  },
];

/** Flat list of week metadata (for admin dashboard, lookups, etc.) */
export const weeks = weekMeta.map((wp) => ({
  weekNumber: wp.weekNumber,
  title: wp.title,
  description: wp.description,
  availableDate: wp.availableDate,
  openTime: wp.openTime,
  closeTime: wp.closeTime,
}));

const TRIVIA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/** Current date+time in the trivia timezone (UTC-3). */
export function nowInTriviaTZ(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TRIVIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(hour) * 60 + Number(get('minute')),
  };
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export type WeekAvailabilityStatus = 'before' | 'open' | 'after';

/** Check if a given week is playable right now */
export function isWeekAvailable(weekNumber: number): boolean {
  const wp = weekMeta.find((w) => w.weekNumber === weekNumber);
  if (!wp) return false;
  const { date, minutes } = nowInTriviaTZ();
  if (date !== wp.availableDate) return false;
  return minutes >= timeToMinutes(wp.openTime) && minutes <= timeToMinutes(wp.closeTime);
}

/** Selecciona la semana "activa" segun la fecha de hoy en la TZ trivia.
 * Prioridad: 1) la que abre hoy, 2) la proxima upcoming, 3) la ultima ya pasada. */
function pickActiveWeek(today: string): WeekPool {
  const sorted = [...weekMeta].sort((a, b) =>
    a.availableDate.localeCompare(b.availableDate),
  );
  const sameDay = sorted.find((w) => w.availableDate === today);
  if (sameDay) return sameDay;
  const upcoming = sorted.find((w) => w.availableDate > today);
  if (upcoming) return upcoming;
  return sorted[sorted.length - 1];
}

/** Availability info for the current week */
export function getCurrentWeekAvailability(): {
  available: boolean;
  availableDate: string;
  openTime: string;
  closeTime: string;
  status: WeekAvailabilityStatus;
  weekNumber: number;
} {
  const { date, minutes } = nowInTriviaTZ();
  const wp = pickActiveWeek(date);
  const openMin = timeToMinutes(wp.openTime);
  const closeMin = timeToMinutes(wp.closeTime);

  let status: WeekAvailabilityStatus;
  if (date < wp.availableDate || (date === wp.availableDate && minutes < openMin)) {
    status = 'before';
  } else if (date === wp.availableDate && minutes >= openMin && minutes <= closeMin) {
    status = 'open';
  } else {
    status = 'after';
  }

  return {
    available: status === 'open',
    availableDate: wp.availableDate,
    openTime: wp.openTime,
    closeTime: wp.closeTime,
    status,
    weekNumber: wp.weekNumber,
  };
}
