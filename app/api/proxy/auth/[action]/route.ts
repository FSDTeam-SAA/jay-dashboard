import { NextRequest, NextResponse } from "next/server"

const allowedAuthActions = new Set([
  "login",
  "verify",
  "forget",
  "verify-otp",
  "reset-password",
  "change-password",
])

const authApiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL

export async function POST(request: NextRequest) {
  const action = request.nextUrl.pathname.split("/").pop() || ""

  if (!allowedAuthActions.has(action)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unsupported auth action",
      },
      { status: 404 },
    )
  }

  if (!authApiBaseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Backend auth URL is not configured",
      },
      { status: 500 },
    )
  }

  const requestHeaders = new Headers({
    "Content-Type": request.headers.get("content-type") || "application/json",
  })

  const authorization = request.headers.get("authorization")

  if (authorization) {
    requestHeaders.set("authorization", authorization)
  }

  const upstreamResponse = await fetch(`${authApiBaseUrl}/auth/${action}`, {
    method: "POST",
    headers: requestHeaders,
    body: await request.text(),
    cache: "no-store",
  })

  const responseHeaders = new Headers({
    "Content-Type": upstreamResponse.headers.get("content-type") || "application/json",
  })

  const setCookie = upstreamResponse.headers.get("set-cookie")

  if (setCookie) {
    responseHeaders.set("set-cookie", setCookie)
  }

  return new NextResponse(await upstreamResponse.text(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  })
}
