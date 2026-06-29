import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface UIStore {
  sidebarOpen: boolean
  toasts: Toast[]
  setSidebarOpen: (open: boolean) => void
  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
}

const TOAST_TTL_MS = 4000
// Track auto-dismiss timers so manual close cancels them — otherwise the
// timer fires later and triggers a redundant state update.
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: true,
  toasts: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  addToast: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    const timer = setTimeout(() => {
      toastTimers.delete(id)
      get().removeToast(id)
    }, TOAST_TTL_MS)
    toastTimers.set(id, timer)
  },
  removeToast: (id) => {
    const timer = toastTimers.get(id)
    if (timer) { clearTimeout(timer); toastTimers.delete(id) }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
