import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { geistMono, geistSans, montserrat } from '@/public/fonts/fonts';
import { Providers } from '@/app/providers';

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
      >
        <Providers>
          <div className="h-full w-full bg-gradient-to-r from-[#B999B1] to-[#AA99B9]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
