import 'server-only';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { signOut } from '@/auth';

export default async function getUserId(): Promise<string | undefined> {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session || !session.userId) {
    await signOut();
    return undefined;
  }
  return session.userId as string;
}
