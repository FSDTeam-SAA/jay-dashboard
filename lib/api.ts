import axios from "axios"
import { getSession } from "next-auth/react"

const createJsonClient = (baseURL: string) =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  })

const api = createJsonClient(process.env.NEXT_PUBLIC_BASE_URL || "")
const authProxyApi = createJsonClient("/api/proxy/auth")

type QueryParams = Record<string, string | number | boolean | null | undefined>

const attachAuthHeader = async (config: any) => {
  const session = await getSession()

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }

  return config
}

const handleApiError = async (error: any) => {
  if (error.response?.status === 401 && typeof window !== "undefined") {
    window.location.href = "/auth/login"
  }

  return Promise.reject(error)
}

api.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error))
authProxyApi.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error))

api.interceptors.response.use((response) => response, handleApiError)
authProxyApi.interceptors.response.use((response) => response, handleApiError)

const buildQueryString = (params: QueryParams) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    searchParams.append(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export const authApi = {
  login: (email: string, password: string) => authProxyApi.post("/login", { email, password }),

  verifyEmail: (email: string, otp: string) => authProxyApi.post("/verify", { email, otp }),

  forgetPassword: (email: string) => authProxyApi.post("/forget", { email }),

  verifyOTP: (email: string, otp: string) => authProxyApi.post("/verify-otp", { email, otp }),

  resetPassword: (email: string, otp: string, password: string) =>
    authProxyApi.post("/reset-password", { email, otp, password }),

  changePassword: (oldPassword: string, newPassword: string) =>
    authProxyApi.post("/change-password", { oldPassword, newPassword }),
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
