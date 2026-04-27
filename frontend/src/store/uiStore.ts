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

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toasts: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  addToast: (type, message) => {
    const id = Date.now().toString()
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
