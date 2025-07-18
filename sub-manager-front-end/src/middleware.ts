import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

    const token = req.cookies.get('JWT')?.value;
    const { pathname } = req.nextUrl;

    const protectedRoutes = ["/dashboard"]; 
    const authRoute = "/auth";      

    if (protectedRoutes.includes(pathname) && !token) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    if (authRoute === pathname && token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}
