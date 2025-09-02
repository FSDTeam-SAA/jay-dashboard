declare module "next-auth" {
  interface Session {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      name: string
      email: string
      role: string
      avatar: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    accessToken: string
    refreshToken: string
    avatar: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    refreshToken: string
    role: string
    avatar: string
  }
}
