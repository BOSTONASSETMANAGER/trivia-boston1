import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trivia Boston',
  description:
    'Trivia semanal de fútbol, economía e historia - Boston Asset Manager SA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
