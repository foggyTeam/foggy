'use server';
import { cookies } from 'next/headers';

export async function updateTheme(theme: string) {
  const cookieStore = await cookies();

  cookieStore.set(
    'theme' as any,
    theme as any,
    {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
    } as any,
  );
}

export async function getTheme(): Promise<string> {
  const theme = (await cookies()).get('theme' as any)?.value;

  return theme ? (theme as string) : 'dark';
}
