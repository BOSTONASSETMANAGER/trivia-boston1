/**
 * Assigns one of 48 country selection avatars deterministically per user ID.
 *
 * Uses a simple string hash so the same user always sees the same avatar
 * without needing a DB column. Distribution across the pool is near-uniform
 * for UUIDs.
 */

const AVATAR_FILES = [
  'ALEMANIA.jpg',
  'ARABIA SAUDITA.jpg',
  'ARGELIA.jpg',
  'ARGENTINA.png',
  'AUSTRALIA.jpg',
  'AUSTRIA.jpg',
  'BELGICA.jpg',
  'BOSNIA.jpg',
  'BRASIL.jpg',
  'CABO VERDE.jpg',
  'CANADA.jpg',
  'COLOMBIA.jpg',
  'COREA.png',
  'COSTA DE MARFIL.jpg',
  'CROACIA.jpg',
  'CURAZAO.png',
  'ECUADOR.jpg',
  'EGIPTO.jpg',
  'ESCOCIA.jpg',
  'ESPAÑA.jpg',
  'FRANCIA.jpg',
  'GHANA.jpg',
  'HAITI.jpg',
  'INGLATERRA.jpg',
  'IRAK.jpg',
  'IRAN.jpg',
  'JAPON.jpg',
  'JORDANIA.jpg',
  'MARRUECOS.jpg',
  'MEXICO.png',
  'NORUEGA.jpg',
  'NUEVA ZELANDA.jpg',
  'PAISES BAJOS.jpg',
  'PANAMA.jpg',
  'PARAGUAY.jpg',
  'PORTUGAL.jpg',
  'QATAR.jpg',
  'RD CONGO.jpg',
  'REPUBLICA CHECA.png',
  'SENEGAL.jpg',
  'SUDAFRICA.png',
  'SUECIA.jpg',
  'SUIZA.png',
  'TUNEZ.jpg',
  'TURQUIA.jpg',
  'URUGUAY.jpg',
  'USA.jpg',
  'UZBEKISTÁN.jpg',
] as const;

const AVATARS = AVATAR_FILES.map((f) => `/avatars/${encodeURIComponent(f)}`);

export function getAvatarForUser(userId: string | null | undefined): string {
  if (!userId) return AVATARS[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATARS.length;
  return AVATARS[idx];
}
