import { deleteImages } from '@/app/lib/server/actions/handleImage';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId)
    return NextResponse.json({ ok: false }, { status: 401 });

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && new URL(origin).host !== host)
    return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json().catch(() => null);
  const urls: unknown = body?.urls;

  if (
    !Array.isArray(urls) ||
    urls.some((u) => typeof u !== 'string') ||
    urls.length > 256
  )
    return NextResponse.json({ ok: false }, { status: 400 });

  if (!urls.length) return NextResponse.json({ ok: true });

  await deleteImages(urls as string[]);
  return NextResponse.json({ ok: true });
}
