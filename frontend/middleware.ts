import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/session';
import { cookies } from 'next/headers';

const publicRoutes = ['/login'];
const protectedRoutesRegex = /^\/(project|team|board)\/([^/]+)$/;

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!isPublicRoute && !session?.userId)
    return NextResponse.redirect(new URL('/login', req.nextUrl));

  // Маршрут вида project/[id], team/[id], или board/[id]
  const match = path.match(protectedRoutesRegex);

  if (match) {
    const [resourceType, resourceId] = match;

    // TODO: uncomment when API is ready
    /*
    try {
      const response = await getRequest(
        `${resourceType}/${resourceId}/access`,
        { headers: { 'x-user-id': session.userId } },
      );
      if (!response || response?.status !== 200)
        return NextResponse.redirect(new URL('/403', req.nextUrl));
    } catch (error) {
      console.error('Ошибка проверки доступа:', error);
      return NextResponse.redirect(new URL('/403', req.nextUrl));
    }*/
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
