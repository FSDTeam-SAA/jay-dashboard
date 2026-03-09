"use client"

import type React from "react"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setEmail(searchParams.get("email") || "")
    setOtp(searchParams.get("otp") || "")
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.resetPassword(email, otp, password)
      toast.success(response.data?.message || "Password reset successfully")
      router.push("/auth/login")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset Password"
      description="Use your verified OTP to set a new password."
      footer={
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/verify-otp" className="font-medium text-blue-700 hover:text-blue-800">
            Verify another OTP
          </Link>
          <Link href="/auth/login" className="font-medium text-slate-700 hover:text-slate-900">
            Back to sign in
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
          <Label htmlFor="otp">OTP</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter the verified OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
