import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { montserrat } from '@/public/fonts/fonts';
import { Providers } from '@/app/providers';
import NextTopLoader from 'nextjs-toploader';
import { primary } from '@/tailwind.config';
import RightBottomBar from '@/app/lib/components/menu/rightBottomBar/rightBottomBar';
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
    <html suppressHydrationWarning lang="ru">
      <body
        suppressHydrationWarning
        className={`${montserrat.className} antialiased`}
      >
        <Providers>
          <div className="flex h-screen w-full flex-col overflow-hidden">
            <main className="w-full flex-1 overflow-hidden">{children}</main>
          </div>

          <BackgroundGradient />

          <NextTopLoader color={primary.light.DEFAULT} showSpinner={false} />

          <RightBottomBar />
        </Providers>
      </body>
    </html>
  );
}
