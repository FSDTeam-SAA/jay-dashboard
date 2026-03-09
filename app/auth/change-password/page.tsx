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

export default function ChangePasswordPage() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.changePassword(oldPassword, newPassword)
      toast.success(response.data?.message || "Password changed successfully")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to change password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Change Password"
      description="Update your current password for this admin account."
      footer={
        <Link href="/dashboard" className="font-medium text-blue-700 hover:text-blue-800">
          Back to dashboard
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="oldPassword">Current password</Label>
          <Input
            id="oldPassword"
            type="password"
            placeholder="Enter your current password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
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
              Changing password...
            </>
          ) : (
            "Change password"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
