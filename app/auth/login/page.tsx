"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

export default function AuthLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        try {
          await authApi.login(email, password)
          toast.error("Unable to complete sign in. Please try again.")
        } catch (error: any) {
          const message = error.response?.data?.message || "Invalid credentials"
          const pendingEmail = error.response?.data?.data?.email || email

          if (message.toLowerCase().includes("otp")) {
            toast.error(message)
            router.push(`/auth/verify?email=${encodeURIComponent(pendingEmail)}`)
          } else {
            toast.error(message)
          }
        }

        return
      }

      toast.success("Login successful")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign In"
      description="Use your Spotem365 admin credentials to access the dashboard."
      footer={
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/forget-password" className="font-medium text-blue-700 hover:text-blue-800">
            Forgot password?
          </Link>
          <Link href="/auth/verify" className="font-medium text-slate-700 hover:text-slate-900">
            Verify account
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword((current) => !current)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
