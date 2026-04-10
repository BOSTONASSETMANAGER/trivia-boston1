/**
 * Assigns one of three profile images deterministically per user ID.
 *
 * Uses a simple string hash so the same user always sees the same avatar
 * without needing a DB column. Distribution across {1,2,3} is near-uniform
 * for UUIDs.
 */

const AVATARS = ['/perfil1.jpg', '/perfil2.jpg', '/perfil3.jpg'] as const;

export function getAvatarForUser(userId: string | null | undefined): string {
  if (!userId) return AVATARS[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATARS.length;
  return AVATARS[idx];
}
