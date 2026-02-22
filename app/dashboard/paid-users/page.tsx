"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react"

type PaidUserSubscription = {
  id?: string
  name?: string
  priceMonthly?: number
  priceYearly?: number
  isActive?: boolean
}

type PaidUser = {
  userId: string
  name: string
  email?: string
  username?: string
  phone?: string
  avatar?: { url?: string }
  totalPaidAmount: number
  totalTransactions: number
  lastPaymentAt?: string
  lastBillingPeriod?: "monthly" | "yearly"
  lastTransactionId?: string
  subscription?: PaidUserSubscription
}

const BILLING_OPTIONS = [
  { label: "All periods", value: "all" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
]

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0))

const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString() : "N/A")

const formatTransactionId = (value?: string) => {
  if (!value) return "N/A"
  if (value.length <= 12) return value
  return `${value.slice(0, 8)}...${value.slice(-4)}`
}

export default function PaidUsersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [billingFilter, setBillingFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const limit = 10

  const {
    data: paidUsersData,
    isLoading,
  } = useQuery({
    queryKey: ["paid-users", currentPage, limit, searchTerm, billingFilter, fromDate, toDate],
    queryFn: () =>
      adminApi.getPaidUsersList({
        page: currentPage,
        limit,
        search: searchTerm.trim() || undefined,
        billingPeriod: billingFilter === "all" ? undefined : billingFilter,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    onError: () => {
      toast.error("Failed to load paid users")
    },
  })

  const users: PaidUser[] = paidUsersData?.data?.data?.users || []
  const summary = paidUsersData?.data?.data?.summary || {
    totalPaidUsers: 0,
    totalCollected: 0,
    totalTransactions: 0,
  }
  const pagination = paidUsersData?.data?.data?.pagination

  const totalPages = pagination?.totalPages || 1
  const hasNextPage = pagination?.hasNextPage || false
  const hasPrevPage = pagination?.hasPrevPage || false

  const resetFilters = () => {
    setSearchTerm("")
    setBillingFilter("all")
    setFromDate("")
    setToDate("")
    setCurrentPage(1)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={!hasPrevPage}
        className="h-9 w-9 p-0 hover:bg-blue-50 transition-colors duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>,
    )

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={`h-9 w-9 p-0 transition-all duration-200 ${
            i === currentPage ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "hover:bg-blue-50"
          }`}
        >
          {i}
        </Button>,
      )
    }

    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={!hasNextPage}
        className="h-9 w-9 p-0 hover:bg-blue-50 transition-colors duration-200"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>,
    )

    return buttons
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Paid users</h1>
            <p className="text-sm text-muted-foreground">Customers with completed subscription payments.</p>
          </div>
          <Button variant="outline" onClick={resetFilters} className="lg:self-start">
            Reset filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total paid users</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <p className="text-2xl font-semibold">{summary.totalPaidUsers}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total collected</p>
              {isLoading ? (
                <Skeleton className="h-8 w-28 mt-2" />
              ) : (
                <p className="text-2xl font-semibold">{formatCurrency(summary.totalCollected)}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total transactions</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="text-2xl font-semibold">{summary.totalTransactions}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-xl">Paid users list</CardTitle>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <select
                value={billingFilter}
                onChange={(event) => {
                  setBillingFilter(event.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BILLING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value)
                  setCurrentPage(1)
                }}
                className="sm:w-40"
              />
              <Input
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value)
                  setCurrentPage(1)
                }}
                className="sm:w-40"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">User</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Subscription</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Total paid</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Transactions</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Last payment</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Billing</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Last transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.userId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                              <AvatarImage src={user.avatar?.url || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{user.subscription?.name || "N/A"}</p>
                            <p className="text-xs text-gray-500">{user.username || ""}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(user.totalPaidAmount)}</td>
                        <td className="py-4 px-6">
                          <Badge variant="secondary">{user.totalTransactions}</Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{formatDateTime(user.lastPaymentAt)}</td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="capitalize">
                            {user.lastBillingPeriod || "N/A"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{formatTransactionId(user.lastTransactionId)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No paid users found</p>
                          <p className="text-sm text-gray-400">Try adjusting your filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pagination.totalUsers)} of {pagination.totalUsers} users
                </div>
                <div className="flex items-center space-x-2">{renderPaginationButtons()}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
