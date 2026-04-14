import { Trophy, Users, GamepadIcon, Clock, Medal, Award, Star } from 'lucide-react';
import { getAdminStats } from '@/app/actions/admin';
import { weeks } from '@/data/questions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard · Trivia Boston',
};

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getWeekTitle(weekNumber: number): string {
  const week = weeks.find((w) => w.weekNumber === weekNumber);
  return week?.title ?? `Semana ${weekNumber}`;
}

const PLACE_STYLES = [
  { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: Trophy, label: '1er puesto' },
  { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600', icon: Medal, label: '2do puesto' },
  { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: Award, label: '3er puesto' },
];

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <main className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <header className="border-b border-[#e2e8f0] bg-white px-6 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3969] text-white">
              <GamepadIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-[#64748b]">
                Trivia Boston — Ganadores semanales
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Global stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5 text-[#2563eb]" />}
            label="Usuarios registrados"
            value={stats.totalUsers}
          />
          <StatCard
            icon={<GamepadIcon className="h-5 w-5 text-[#7c3aed]" />}
            label="Partidas jugadas"
            value={stats.totalSessions}
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-[#d97706]" />}
            label="Semanas activas"
            value={stats.weeks.length}
          />
          <StatCard
            icon={<Star className="h-5 w-5 text-[#059669]" />}
            label="Promedio score"
            value={
              stats.weeks.length > 0
                ? (
                    stats.weeks.reduce((s, w) => s + w.avgScore, 0) /
                    stats.weeks.length
                  ).toFixed(1) + '/3'
                : '—'
            }
          />
        </div>

        {/* Weekly sections */}
        {stats.weeks.length === 0 ? (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" />
            <p className="text-sm font-semibold text-[#64748b]">
              No hay partidas registradas todavia
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {stats.weeks.map((week) => (
              <section
                key={week.weekNumber}
                className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"
              >
                {/* Week header */}
                <div className="flex flex-col gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0f172a]">
                      Semana {week.weekNumber}
                    </h2>
                    <p className="text-xs text-[#64748b]">
                      {getWeekTitle(week.weekNumber)}
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {week.totalPlayers} jugadores
                    </span>
                    <span className="flex items-center gap-1">
                      <GamepadIcon className="h-3.5 w-3.5" />
                      {week.totalSessions} partidas
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      Promedio: {week.avgScore}/3
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(week.avgTimeMs)} promedio
                    </span>
                  </div>
                </div>

                {/* Winners */}
                <div className="p-6">
                  {week.winners.length === 0 ? (
                    <p className="text-center text-sm text-[#94a3b8]">
                      Sin ganadores esta semana
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {week.winners.map((winner, i) => {
                        const style = PLACE_STYLES[i];
                        const Icon = style.icon;
                        return (
                          <div
                            key={winner.userId}
                            className={`rounded-xl border ${style.border} ${style.bg} p-4`}
                          >
                            <div className="mb-3 flex items-center gap-2">
                              <Icon className={`h-5 w-5 ${style.text}`} />
                              <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                                {style.label}
                              </span>
                            </div>
                            <p className="text-base font-bold text-[#0f172a]">
                              {winner.name}
                            </p>
                            <p className="mb-3 text-xs text-[#64748b]">
                              {winner.email}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1 font-semibold text-[#0f172a]">
                                <Star className="h-3.5 w-3.5 fill-[#d97706] text-[#d97706]" />
                                {winner.score}/3
                              </span>
                              <span className="flex items-center gap-1 text-[#64748b]">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(winner.totalTimeMs)}
                              </span>
                              <span className="text-[#94a3b8]">
                                {new Date(winner.completedAt).toLocaleDateString('es-AR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="mt-10 text-center text-[11px] font-semibold tracking-wider text-black">
          BOSTON ASSET MANAGER SA
        </p>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-[#0f172a] tabular-nums">{value}</p>
      <p className="text-[11px] text-[#64748b]">{label}</p>
    </div>
  );
}
