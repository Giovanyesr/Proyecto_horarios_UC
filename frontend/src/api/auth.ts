import client from './client'
import type { UserRole } from '../store/authStore'

export interface LoginResponse {
  access_token: string
  token_type: string
  role: UserRole
  user_id: string
  username: string
  student_id: string | null
}

export interface UserRecord {
  id: string
  username: string
  email: string
  role: UserRole
  is_active: boolean
  student_id: string | null
  created_at: string
}

export interface UserCreatePayload {
  username: string
  email: string
  password: string
  role: UserRole
  student_id?: string | null
}

export interface AllowedEmailRecord {
  id: string
  email: string
  student_id: string | null
  is_used: boolean
  notes: string | null
  created_at: string
}

export interface AllowedEmailCreate {
  email: string
  student_id?: string | null
  notes?: string | null
}

export const authApi = {
  login: (username: string, password: string, role: UserRole) =>
    client.post<LoginResponse>('/auth/login', { username, password, role }).then(r => r.data),

  register: (email: string, username: string, password: string) =>
    client.post<LoginResponse>('/auth/register', { email, username, password }).then(r => r.data),

  me: () => client.get<UserRecord>('/auth/me').then(r => r.data),

  listUsers: () => client.get<UserRecord[] | { items: UserRecord[] }>('/auth/users', { params: { size: 100 } })
    .then(r => Array.isArray(r.data) ? r.data : r.data.items ?? []),

  createUser: (data: UserCreatePayload) =>
    client.post<UserRecord>('/auth/users', data).then(r => r.data),

  deleteUser: (id: string) =>
    client.delete(`/auth/users/${id}`),

  listAllowedEmails: () =>
    client.get<AllowedEmailRecord[] | { items: AllowedEmailRecord[] }>('/auth/allowed-emails', { params: { size: 100 } })
      .then(r => Array.isArray(r.data) ? r.data : r.data.items ?? []),

  createAllowedEmail: (data: AllowedEmailCreate) =>
    client.post<AllowedEmailRecord>('/auth/allowed-emails', data).then(r => r.data),

  deleteAllowedEmail: (id: string) =>
    client.delete(`/auth/allowed-emails/${id}`),
}
