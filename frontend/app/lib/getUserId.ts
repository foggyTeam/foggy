import 'server-only';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';

export default async function getUserId(): Promise<string | undefined> {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session || !session.userId) {
    return undefined;
  }
  return session.userId as string;
}
