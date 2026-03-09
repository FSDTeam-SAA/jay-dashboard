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

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setEmail(searchParams.get("email") || "")
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.verifyOTP(email, otp)
      toast.success(response.data?.message || "OTP verified successfully")
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Verify Reset OTP"
      description="Confirm the OTP sent to your email before resetting your password."
      footer={
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/forget-password" className="font-medium text-blue-700 hover:text-blue-800">
            Send another OTP
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
            placeholder="Enter your reset code"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking OTP...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
