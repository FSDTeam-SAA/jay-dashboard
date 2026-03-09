"use client"

import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  BadgeCheck,
  KeyRound,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import Image from "next/image"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "User List", href: "/dashboard/users", icon: Users },
    { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
    { name: "Payments History", href: "/dashboard/payments-history", icon: Receipt },
    { name: "Paid Users", href: "/dashboard/paid-users", icon: BadgeCheck },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center space-x-3">
              <Image
                src="/logo.png"
                alt="Logo"
                width={500}
                height={500}
                className="w-[148px] h-[148px]"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            
            // FIXED LOGIC: 
            // If the item is the root dashboard, use exact match.
            // Otherwise, check if current path starts with the link href.
            const isCurrent = item.href === "/dashboard" 
              ? pathname === "/dashboard" 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium
                  transition-all duration-200 ease-in-out group
                  ${isCurrent 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}
                `}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isCurrent ? "text-white" : "text-gray-500 group-hover:text-gray-900 group-hover:scale-110"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium text-gray-900">
              {session.user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
          </div>

          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Link href="/auth/change-password">
              <KeyRound className="h-5 w-5 mr-3" />
              Change Password
            </Link>
          </Button>

          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                </div>
              </div>
              <span className="font-bold text-gray-900">Spotem365</span>
            </div>
          </div>
        </header>

        <main className="min-h-screen pt-16 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
