import axios from "axios"
import { getSession } from "next-auth/react"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

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
}

export { api }
