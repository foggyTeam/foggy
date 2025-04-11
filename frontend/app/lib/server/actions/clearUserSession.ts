'use server';
import { clearSession } from '@/app/lib/session';

export async function clearUserSession() {
  await clearSession();
}
