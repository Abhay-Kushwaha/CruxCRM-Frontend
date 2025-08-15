import { NextResponse, NextRequest } from "next/server";

// Define public paths for better maintainability
const PUBLIC_PATHS = [
    '/',
    '/worker/auth/login',
    '/worker/auth/register',
    '/worker/auth/reset-password',
    '/manager/auth/login',
    '/manager/auth/register',
    '/manager/auth/reset-password'
] as const;

export function middleware(request: NextRequest): NextResponse {
    const path = request.nextUrl.pathname;
    const isPublicPath = PUBLIC_PATHS.includes(path as typeof PUBLIC_PATHS[number]);

    const token = request.cookies.get('token')?.value ?? '';
    const cookies = request.cookies.getAll();
    const has001 = cookies.some(cookie => cookie.name === '001');
    const has002 = cookies.some(cookie => cookie.name === '002');
    const isWorkerPath = path.startsWith('/worker');
    const isManagerPath = path.startsWith('/manager');
    console.log("Just checking");
    console.log("Middleware check:", token, has001, has002, isWorkerPath, isManagerPath);

    if (isPublicPath) {
        if (token && has001 && isWorkerPath) {
            return NextResponse.redirect(new URL('/worker/dashboard', request.url));
        }
        if (token && has002 && isManagerPath) {
            return NextResponse.redirect(new URL('/manager/dashboard', request.url));
        }
    }
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    if (isWorkerPath && !has001) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    if (isManagerPath && !has002) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/dashboard',
        '/worker/:path*',
        '/manager/:path*',
        '/profile/:path*',
        '/login',
        '/register',
        '/reset-password'
    ]
} as const;