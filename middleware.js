import { NextResponse } from 'next/server';

export function middleware(request) {
    const host = request.headers.get('host') || '';

    if (host.startsWith('www.')) {
        const newHost = host.replace('www.', '');
        const url = new URL(request.url);
        url.host = newHost;
        url.protocol = 'https:'; // Force HTTPS as well

        return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
