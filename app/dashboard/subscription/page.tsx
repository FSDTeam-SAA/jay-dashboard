"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { subscriptionApi } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Pencil, Plus, Search, Trash2, Package } from "lucide-react"

type Subscription = {
  _id: string
  name: string
  benefits: string[]
  priceMonthly: number
  priceYearly: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type SubscriptionForm = {
  name: string
  benefits: string
  priceMonthly: string
  priceYearly: string
  isActive: boolean
}

const STATUS_OPTIONS = [
  { label: "All plans", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const defaultForm: SubscriptionForm = {
  name: "",
  benefits: "",
  priceMonthly: "",
  priceYearly: "",
  isActive: true,
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "N/A")

export default function SubscriptionPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [form, setForm] = useState<SubscriptionForm>(defaultForm)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => subscriptionApi.getSubscriptions(),
    onError: () => {
      toast.error("Failed to load subscriptions")
    },
  })

  const subscriptions: Subscription[] = subscriptionData?.data?.data || []

  const summary = useMemo(() => {
    const total = subscriptions.length
    const active = subscriptions.filter((subscription) => subscription.isActive).length
    const inactive = total - active
    const activePrices = subscriptions.filter((subscription) => subscription.isActive).map((plan) => plan.priceMonthly)
    const avgMonthly = activePrices.length
      ? activePrices.reduce((acc, price) => acc + price, 0) / activePrices.length
      : 0
    return {
      total,
      active,
      inactive,
      avgMonthly,
    }
  }, [subscriptions])

  const filteredSubscriptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return subscriptions.filter((subscription) => {
      if (statusFilter === "active" && !subscription.isActive) return false
      if (statusFilter === "inactive" && subscription.isActive) return false
      if (!normalizedSearch) return true
      const benefitsText = subscription.benefits.join(" ").toLowerCase()
      return (
        subscription.name.toLowerCase().includes(normalizedSearch) || benefitsText.includes(normalizedSearch)
      )
    })
  }, [subscriptions, statusFilter, searchTerm])

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string
      benefits: string[]
      priceMonthly: number
      priceYearly: number
      isActive: boolean
    }) => subscriptionApi.createSubscription(payload),
    onSuccess: () => {
      toast.success("Subscription created")
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
      handleDialogClose()
    },
    onError: () => {
      toast.error("Failed to create subscription")
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string
      data: {
        name: string
        benefits: string[]
        priceMonthly: number
        priceYearly: number
        isActive: boolean
      }
    }) => subscriptionApi.updateSubscription(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Subscription updated")
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
      handleDialogClose()
    },
    onError: () => {
      toast.error("Failed to update subscription")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.deleteSubscription(id),
    onSuccess: () => {
      toast.success("Subscription deleted")
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
    },
    onError: () => {
      toast.error("Failed to delete subscription")
    },
  })

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingSubscription(null)
    setForm(defaultForm)
  }

  const openCreateDialog = () => {
    setEditingSubscription(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEditDialog = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setForm({
      name: subscription.name,
      benefits: subscription.benefits.join("\n"),
      priceMonthly: String(subscription.priceMonthly),
      priceYearly: String(subscription.priceYearly),
      isActive: subscription.isActive,
    })
    setDialogOpen(true)
  }

  const parseBenefits = (raw: string) =>
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = form.name.trim()
    const priceMonthly = Number.parseFloat(form.priceMonthly)
    const priceYearly = Number.parseFloat(form.priceYearly)

    if (!name) {
      toast.error("Plan name is required")
      return
    }

    if (!Number.isFinite(priceMonthly) || priceMonthly < 0) {
      toast.error("Monthly price must be a valid number")
      return
    }

    if (!Number.isFinite(priceYearly) || priceYearly < 0) {
      toast.error("Yearly price must be a valid number")
      return
    }

    const payload = {
      name,
      benefits: parseBenefits(form.benefits),
      priceMonthly,
      priceYearly,
      isActive: form.isActive,
    }

    if (editingSubscription) {
      updateMutation.mutate({ id: editingSubscription._id, data: payload })
      return
    }

    createMutation.mutate(payload)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscription plans</h1>
            <p className="text-sm text-muted-foreground">Create and manage subscription tiers for your users.</p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add plan
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total plans</p>
              {isLoading ? <Skeleton className="h-8 w-20 mt-2" /> : <p className="text-2xl font-semibold">{summary.total}</p>}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active plans</p>
              {isLoading ? <Skeleton className="h-8 w-20 mt-2" /> : <p className="text-2xl font-semibold text-green-600">{summary.active}</p>}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Inactive plans</p>
              {isLoading ? <Skeleton className="h-8 w-20 mt-2" /> : <p className="text-2xl font-semibold text-yellow-600">{summary.inactive}</p>}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg monthly price</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="text-2xl font-semibold">{formatCurrency(summary.avgMonthly)}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-xl">All subscriptions</CardTitle>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search plans or benefits..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Plan</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Benefits</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Monthly</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Yearly</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Created</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-4 px-6"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-48" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-8 w-20" /></td>
                      </tr>
                    ))
                  ) : filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map((subscription) => (
                      <tr
                        key={subscription._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{subscription.name}</p>
                            <p className="text-xs text-gray-500">ID: {subscription._id.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {subscription.benefits.length > 0 ? (
                            <div>
                              <p className="text-sm text-gray-700">
                                {subscription.benefits.slice(0, 2).join(", ")}
                                {subscription.benefits.length > 2 ? "..." : ""}
                              </p>
                              <p className="text-xs text-gray-400">{subscription.benefits.length} benefits</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No benefits</p>
                          )}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(subscription.priceMonthly)}</td>
                        <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(subscription.priceYearly)}</td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className={subscription.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}
                          >
                            {subscription.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{formatDate(subscription.createdAt)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(subscription)}
                              className="h-8 px-2"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 px-2"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="sm:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete plan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {subscription.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(subscription._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No subscriptions found</p>
                          <p className="text-sm text-gray-400">Try adjusting your filters or add a new plan.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleDialogClose())}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSubscription ? "Edit subscription" : "Create subscription"}</DialogTitle>
              <DialogDescription>
                {editingSubscription
                  ? "Update your subscription plan details."
                  : "Add a new subscription plan for your users."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan name</Label>
                <Input
                  id="plan-name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Premium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price-monthly">Monthly price</Label>
                  <Input
                    id="price-monthly"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceMonthly}
                    onChange={(event) => setForm((prev) => ({ ...prev, priceMonthly: event.target.value }))}
                    placeholder="9.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-yearly">Yearly price</Label>
                  <Input
                    id="price-yearly"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceYearly}
                    onChange={(event) => setForm((prev) => ({ ...prev, priceYearly: event.target.value }))}
                    placeholder="99.99"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits (one per line)</Label>
                <Textarea
                  id="benefits"
                  value={form.benefits}
                  onChange={(event) => setForm((prev) => ({ ...prev, benefits: event.target.value }))}
                  placeholder="Priority support\nUnlimited alerts"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Plan status</p>
                  <p className="text-xs text-gray-500">Toggle whether this plan is visible to users.</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingSubscription ? "Save changes" : "Create plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
