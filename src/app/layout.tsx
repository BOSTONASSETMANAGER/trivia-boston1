import type { Metadata } from 'next';
import { Lexend, Manrope } from 'next/font/google';
import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Trivia Boston',
  description: 'Trivia semanal de fútbol, economía e historia - Boston Asset Manager SA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lexend.variable} ${manrope.variable} dark`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
