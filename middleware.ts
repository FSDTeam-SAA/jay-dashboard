import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth"

const { auth } = NextAuth(authConfig)

const publicAuthRoutes = new Set([
  "/auth/login",
  "/auth/verify",
  "/auth/forget-password",
  "/auth/verify-otp",
  "/auth/reset-password",
])

const protectedAuthRoutes = new Set(["/auth/change-password"])

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const isAuthenticated = Boolean(req.auth)

  if (pathname === "/" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (pathname.startsWith("/auth")) {
    if (protectedAuthRoutes.has(pathname) && !isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (publicAuthRoutes.has(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
}
