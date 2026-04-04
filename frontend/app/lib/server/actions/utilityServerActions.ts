'use server';

import { externalGetRequest } from '@/app/lib/server/requests';
import { URL } from 'url';
import { promises as dns } from 'dns';

const BLOCKED_HOSTNAMES = ['localhost', '0.0.0.0'];
const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./, // link-local / AWS metadata
  /^::1$/, // IPv6 loopback
  /^fc00:/, // IPv6 private
];

async function isSafeUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(hostname)) return false;

  try {
    const { address } = await dns.lookup(hostname);
    if (PRIVATE_IP_RANGES.some((re) => re.test(address))) return false;
  } catch {
    return false;
  }

  return true;
}

export async function FetchUrl(url: string) {
  if (!(await isSafeUrl(url))) throw new Error('URL not allowed');

  return await externalGetRequest(url, {
    timeout: 5000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)' },
  });
}
