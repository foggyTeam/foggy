import 'server-only';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { SessionPayload } from '@/app/lib/types/definitions';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session: any = await encrypt({ userId, expiresAt } as SessionPayload);
  const cookieStore = await cookies();

  cookieStore.set('session' as any, session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt as any,
    sameSite: 'lax',
    path: '/',
  } as any);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session as string, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('Failed to verify session');
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set('session' as any, '', {
    httpOnly: true,
    secure: true,
    expires: new Date(0) as any,
    sameSite: 'lax',
    path: '/',
  } as any);
}
