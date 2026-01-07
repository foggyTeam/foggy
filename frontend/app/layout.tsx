import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { montserrat } from '@/public/fonts/fonts';
import { Providers } from '@/app/providers';
import BackgroundGradient from '@/app/lib/components/backgroundGradient/backgroundGradient';
import NextTopLoader from 'nextjs-toploader';
import { primary } from '@/tailwind.config';
import RightBottomBar from '@/app/lib/components/menu/rightBottomBar/rightBottomBar';

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
          <main className="h-screen w-screen">{children}</main>

          <BackgroundGradient backgroundColor="--heroui-danger-900" />

          <NextTopLoader color={primary.light.DEFAULT} showSpinner={false} />

          <RightBottomBar />
        </Providers>
      </body>
    </html>
  );
}
