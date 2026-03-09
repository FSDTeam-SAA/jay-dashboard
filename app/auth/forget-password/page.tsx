"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

export default function ForgetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.forgetPassword(email)
      toast.success(response.data?.message || "OTP sent to your email")
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot Password"
      description="Request a password reset OTP for your account."
      footer={
        <Link href="/auth/login" className="font-medium text-blue-700 hover:text-blue-800">
          Back to sign in
        </Link>
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

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
