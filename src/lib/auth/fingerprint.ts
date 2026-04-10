'use client';

/**
 * Client-side device fingerprinting for anti-abuse.
 * Combines stable browser attributes into a SHA-256 hash.
 * Not uniquely identifying by itself — paired with IP server-side.
 */

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function canvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 30);
    ctx.fillStyle = '#069';
    ctx.fillText('trivia-boston-fp', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('trivia-boston-fp', 4, 17);
    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
}

export async function getFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'ssr';

  const parts = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') ?? '',
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() ?? '',
    // @ts-expect-error - deviceMemory is non-standard
    navigator.deviceMemory?.toString() ?? '',
    canvasFingerprint(),
  ];

  return sha256Hex(parts.join('|'));
}
