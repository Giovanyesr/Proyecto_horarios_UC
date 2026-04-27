import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTokenExpiresAt } from '../utils/security'

export type UserRole = 'admin' | 'student'

interface AuthState {
  token: string | null
  role: UserRole | null
  userId: string | null
  username: string | null
  studentId: string | null
  expiresAt: number | null      // ms timestamp when the JWT expires
  isAuthenticated: boolean
  setAuth: (data: {
    token: string
    role: UserRole
    userId: string
    username: string
    studentId?: string | null
  }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      username: null,
      studentId: null,
      expiresAt: null,
      isAuthenticated: false,

      setAuth: ({ token, role, userId, username, studentId }) =>
        set({
          token,
          role,
          userId,
          username,
          studentId: studentId ?? null,
          expiresAt: getTokenExpiresAt(token),
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          role: null,
          userId: null,
          username: null,
          studentId: null,
          expiresAt: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'horarioai-auth' }
  )
)
