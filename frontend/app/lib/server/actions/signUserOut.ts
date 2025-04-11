'use server';

import { signOut } from '@/auth';

export async function signUserOut() {
  await signOut().catch((error: any) => {
    throw error;
  });
}
