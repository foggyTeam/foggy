import { deleteImages } from '@/app/lib/server/actions/handleImage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { urls } = await req.json();
  if (!urls?.length) return NextResponse.json({ ok: true });

  await deleteImages(urls);
  return NextResponse.json({ ok: true });
}
