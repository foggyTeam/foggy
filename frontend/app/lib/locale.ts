'use server';
import { AvailableLocales } from '@/app/lib/types/definitions';
import { cookies } from 'next/headers';

export async function updateLocale(locale: AvailableLocales) {
  const cookieStore = await cookies();

  cookieStore.set(
    'locale' as any,
    locale as any,
    {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
    } as any,
  );
}

export async function getLocale(): Promise<AvailableLocales> {
  const locale = (await cookies()).get('locale' as any)?.value;

  return locale ? (locale as AvailableLocales) : 'en';
}
