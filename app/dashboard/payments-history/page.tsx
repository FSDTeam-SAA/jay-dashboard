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
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react"

type PaymentUser = {
  _id: string
  name: string
  email: string
  phone?: string
}

type PaymentSubscription = {
  _id: string
  name: string
  priceMonthly?: number
  priceYearly?: number
  isActive?: boolean
}

type PaymentHistoryItem = {
  _id: string
  userId?: PaymentUser | null
  subscriptionId?: PaymentSubscription | null
  price: number
  paymentStatus: "complete" | "pending" | "failed"
  transactionId?: string
  billingPeriod?: "monthly" | "yearly"
  createdAt: string
  updatedAt?: string
}

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Complete", value: "complete" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
]

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

const statusStyles: Record<string, string> = {
  complete: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  failed: "bg-red-100 text-red-700 border-red-200",
}

export default function PaymentsHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [billingFilter, setBillingFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const limit = 10

  const {
    data: paymentData,
    isLoading,
  } = useQuery({
    queryKey: ["payments-history", currentPage, limit, statusFilter, billingFilter, fromDate, toDate],
    queryFn: () =>
      adminApi.getSubscriptionPaymentHistory({
        page: currentPage,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        billingPeriod: billingFilter === "all" ? undefined : billingFilter,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    onError: () => {
      toast.error("Failed to load payment history")
    },
  })

  const payments: PaymentHistoryItem[] = paymentData?.data?.data?.payments || []
  const summary = paymentData?.data?.data?.summary || {
    totalPayments: 0,
    totalRevenue: 0,
    statusCounts: { complete: 0, pending: 0, failed: 0 },
  }
  const pagination = paymentData?.data?.data?.pagination

  const totalPages = pagination?.totalPages || 1
  const hasNextPage = pagination?.hasNextPage || false
  const hasPrevPage = pagination?.hasPrevPage || false

  const resetFilters = () => {
    setStatusFilter("all")
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payments history</h1>
            <p className="text-sm text-muted-foreground">Track subscription payment activity and status breakdowns.</p>
          </div>
          <Button variant="outline" onClick={resetFilters} className="sm:self-start">
            Reset filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total payments</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="text-2xl font-semibold text-foreground">{summary.totalPayments}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total revenue</p>
              {isLoading ? (
                <Skeleton className="h-8 w-28 mt-2" />
              ) : (
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(summary.totalRevenue)}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Complete</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-2xl font-semibold text-green-600">{summary.statusCounts?.complete ?? 0}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-2xl font-semibold text-yellow-600">{summary.statusCounts?.pending ?? 0}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Failed</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-2xl font-semibold text-red-600">{summary.statusCounts?.failed ?? 0}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-xl">Payment history</CardTitle>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Billing</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Transaction</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-28" />
                        </td>
                      </tr>
                    ))
                  ) : payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{payment.userId?.name || "Unknown"}</p>
                            <p className="text-sm text-gray-500">{payment.userId?.email || "No email"}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{payment.subscriptionId?.name || "N/A"}</p>
                            <p className="text-xs text-gray-500">{payment.billingPeriod ? payment.billingPeriod : "N/A"}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(payment.price)}</td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className={`capitalize ${statusStyles[payment.paymentStatus] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                          >
                            {payment.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="secondary" className="capitalize">
                            {payment.billingPeriod || "N/A"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{formatTransactionId(payment.transactionId)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{formatDateTime(payment.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No payments found</p>
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
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pagination.totalPayments)} of {pagination.totalPayments} payments
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
