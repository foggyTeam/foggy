'use server';

import { externalGetRequest } from '@/app/lib/server/requests';

export async function FetchUrl(url: string) {
  return await externalGetRequest(url, {
    timeout: 5000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)' },
  });
}
