import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { montserrat } from '@/public/fonts/fonts';
import { Providers } from '@/app/providers';
import LocaleSwitcher from '@/app/lib/components/localeSwitcher';
import BackgroundGradient from '@/app/lib/components/backgroundGradient/backgroundGradient';

export const metadata: Metadata = {
  title: { template: `foggy | %s`, default: 'foggy' },
  description:
    'Foggy is a web-app for collaborative work on multiple interactive boards.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${montserrat.className} antialiased light`}>
        <Providers>
          <main className="h-screen w-screen">{children}</main>

          <BackgroundGradient backgroundColor="default-100" />

          <LocaleSwitcher />
        </Providers>
      </body>
    </html>
  );
}
