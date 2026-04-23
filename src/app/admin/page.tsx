import { redirect } from 'next/navigation';
import { Trophy, Users, GamepadIcon, Clock, Medal, Award, Star, LogOut, Phone, Monitor, Mail, Calendar } from 'lucide-react';
import { getAdminStats } from '@/app/actions/admin';
import { isAdminAuthenticated, logoutAdmin } from '@/app/actions/admin-auth';
import { weeks as weekData } from '@/data/questions';
import AdminTabs from './AdminTabs';

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
  const week = weekData.find((w) => w.weekNumber === weekNumber);
  return week?.title ?? `Semana ${weekNumber}`;
}

function parseDevice(ua: string | null): string {
  if (!ua) return 'Desconocido';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Android')) {
    const match = ua.match(/Android[^;]*;\s*([^)]+)/);
    return match ? match[1].trim() : 'Android';
  }
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac')) return 'Mac';
  if (ua.includes('Linux')) return 'Linux';
  return 'Navegador';
}

const PLACE_STYLES = [
  { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: Trophy, label: '1er puesto' },
  { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600', icon: Medal, label: '2do puesto' },
  { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: Award, label: '3er puesto' },
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Star, label: '4to puesto' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: Star, label: '5to puesto' },
];

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const stats = await getAdminStats();

  return (
    <main className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <header className="border-b border-[#e2e8f0] bg-white px-6 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3969] text-white">
                <GamepadIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-[#64748b]">
                  Trivia Boston — Panel de administracion
                </p>
              </div>
            </div>
            <form
              action={async () => {
                'use server';
                await logoutAdmin();
                redirect('/admin/login');
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesion
              </button>
            </form>
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

        {/* Tabbed content */}
        <AdminTabs
          winnersContent={
            <div className="space-y-6">
              {stats.weeks.length === 0 ? (
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center">
                  <Trophy className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" />
                  <p className="text-sm font-semibold text-[#64748b]">
                    No hay partidas registradas todavia
                  </p>
                </div>
              ) : (
                stats.weeks.map((week) => (
                  <section
                    key={week.weekNumber}
                    className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"
                  >
                    <div className="flex flex-col gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-base font-bold text-[#0f172a]">
                          Semana {week.weekNumber}
                        </h2>
                        <p className="text-xs text-[#64748b]">
                          {getWeekTitle(week.weekNumber)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-[#64748b]">
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

                    <div className="p-6">
                      {week.winners.length === 0 ? (
                        <p className="text-center text-sm text-[#94a3b8]">
                          Sin ganadores esta semana
                        </p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                                <div className="mt-1 space-y-0.5">
                                  <p className="flex items-center gap-1.5 text-xs text-[#64748b]">
                                    <Mail className="h-3 w-3" />
                                    {winner.email}
                                  </p>
                                  <p className="flex items-center gap-1.5 text-xs text-[#64748b]">
                                    <Phone className="h-3 w-3" />
                                    {winner.phone || 'Sin telefono'}
                                  </p>
                                  <p className="flex items-center gap-1.5 text-xs text-[#64748b]">
                                    <Monitor className="h-3 w-3" />
                                    {parseDevice(winner.deviceInfo)}
                                  </p>
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs">
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
                ))
              )}
            </div>
          }
          historyContent={
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
              {stats.users.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" />
                  <p className="text-sm font-semibold text-[#64748b]">
                    No hay usuarios registrados
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Usuario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Contacto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Dispositivo
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Partidas
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Mejor
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Promedio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {stats.users.map((user) => (
                        <tr
                          key={user.userId}
                          className="transition-colors hover:bg-[#f8fafc]"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#0f172a]">{user.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="flex items-center gap-1.5 text-xs text-[#64748b]">
                              <Mail className="h-3 w-3 shrink-0" />
                              {user.email}
                            </p>
                            <p className="flex items-center gap-1.5 text-xs text-[#64748b] mt-0.5">
                              <Phone className="h-3 w-3 shrink-0" />
                              {user.phone || 'Sin telefono'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="flex items-center gap-1.5 text-xs text-[#64748b]">
                              <Monitor className="h-3 w-3 shrink-0" />
                              {parseDevice(user.deviceInfo)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-[#0f172a] tabular-nums">
                              {user.totalGames}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-[#0f172a] tabular-nums">
                              <Star className="h-3 w-3 fill-[#d97706] text-[#d97706]" />
                              {user.bestScore}/3
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="tabular-nums text-[#64748b]">
                              {user.avgScore}/3
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="flex items-center gap-1.5 text-xs text-[#64748b]">
                              <Calendar className="h-3 w-3 shrink-0" />
                              {new Date(user.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          }
        />

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
