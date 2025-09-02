"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
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
import { ChevronLeft, ChevronRight, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react" // Import Users component

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const limit = 10
  const queryClient = useQueryClient()

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", currentPage, limit],
    queryFn: () => adminApi.getUsers(currentPage, limit),
    onError: () => {
      toast.error("Failed to load users")
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setDeleteUserId(null)
    },
    onError: () => {
      toast.error("Failed to delete user")
      setDeleteUserId(null)
    },
  })

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId)
  }

  const users = usersData?.data?.data?.users || []
  const pagination = usersData?.data?.data?.pagination

  const totalPages = pagination?.totalPages || 1
  const hasNextPage = pagination?.hasNextPage || false
  const hasPrevPage = pagination?.hasPrevPage || false

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
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

    // Page numbers
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

    // Next button
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
          <h1 className="text-3xl font-bold text-foreground">User list</h1>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Users Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Phone Number</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Last Posts</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Total Posts</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Skeleton loading rows
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-8" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-8 w-8 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user: any) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                              <AvatarImage src={user.avatar?.url || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                {user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{user.phone}</td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">
                              {user.lastPost ? new Date(user.lastPost).toLocaleDateString() : "2023-01-15"}
                            </div>
                            <div className="text-gray-500">10:00Am</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.totalPosts}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-600 transition-all duration-200 hover:scale-105"
                                disabled={deleteUserMutation.isPending && deleteUserId === user._id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg font-semibold">Delete User</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Are you sure you want to delete{" "}
                                  <span className="font-medium text-gray-900">{user.name}</span>? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-gray-100 transition-colors duration-200">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    setDeleteUserId(user._id)
                                    handleDeleteUser(user._id)
                                  }}
                                  className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No users found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pagination.totalUsers)} of{" "}
                  {pagination.totalUsers} users
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
