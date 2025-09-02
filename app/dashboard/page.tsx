"use client"

import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertChart } from "@/components/dashboard/alert-chart"
import { AnalyticsCards } from "@/components/dashboard/analytics-cards"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { toast } from "sonner"

export default function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", 1, 5], // Show only 5 users on dashboard
    queryFn: () => adminApi.getUsers(1, 5),
    onError: () => {
      toast.error("Failed to load users")
    },
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["monthly-stats", 2025, 3],
    queryFn: () => adminApi.getMonthlyStats(2025, 3),
    onError: () => {
      toast.error("Failed to load statistics")
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Analytics Cards */}
        <AnalyticsCards loading={statsLoading} />

        {/* User List Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">User list</CardTitle>
            <Link href="/dashboard/users">
              <Button variant="link" className="text-green-600 hover:text-green-700 p-0">
                See all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {usersData?.data?.data?.users?.slice(0, 3).map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar?.url || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {user.lastPost ? new Date(user.lastPost).toLocaleDateString() : "2023-01-15"}
                      </p>
                      <p className="text-sm text-muted-foreground">10:00Am</p>
                    </div>
                    <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Monthly Highest Alert Rate</CardTitle>
            <select className="text-sm border rounded px-2 py-1 bg-background">
              <option>This month</option>
            </select>
          </CardHeader>
          <CardContent>
            <AlertChart loading={statsLoading} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
