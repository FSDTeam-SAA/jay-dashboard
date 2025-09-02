import type React from "react"
import type { Metadata } from "next/metadata"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Spotem365 Admin Dashboard",
  description: "Admin dashboard for Spotem365",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Providers>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
