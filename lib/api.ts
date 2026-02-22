import axios from "axios"
import { getSession } from "next-auth/react"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

type QueryParams = Record<string, string | number | boolean | null | undefined>

const buildQueryString = (params: QueryParams) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    searchParams.append(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// API functions
export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
}

export const adminApi = {
  getUsers: (page = 1, limit = 10) => api.get(`/admin/users?page=${page}&limit=${limit}`),

  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

  getMonthlyStats: (year: number, month: number) => api.get(`/admin/stats/monthly?year=${year}&month=${month}`),

  getSubscriptionPaymentHistory: (params: QueryParams = {}) =>
    api.get(`/admin/payments/subscriptions/history${buildQueryString(params)}`),

  getPaidUsersList: (params: QueryParams = {}) => api.get(`/admin/payments/paid-users${buildQueryString(params)}`),
}

export const subscriptionApi = {
  getSubscriptions: (activeOnly?: boolean) =>
    api.get(`/subscription${buildQueryString({ activeOnly: activeOnly ? "true" : undefined })}`),

  getSubscriptionById: (subscriptionId: string) => api.get(`/subscription/${subscriptionId}`),

  createSubscription: (payload: {
    name: string
    benefits: string[]
    priceMonthly: number
    priceYearly: number
    isActive: boolean
  }) => api.post("/subscription", payload),

  updateSubscription: (
    subscriptionId: string,
    payload: Partial<{
      name: string
      benefits: string[]
      priceMonthly: number
      priceYearly: number
      isActive: boolean
    }>,
  ) => api.patch(`/subscription/${subscriptionId}`, payload),

  deleteSubscription: (subscriptionId: string) => api.delete(`/subscription/${subscriptionId}`),
}

export { api }
