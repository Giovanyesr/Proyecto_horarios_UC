import { useUIStore } from '../../store/uiStore'

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg text-white min-w-[260px] ${
            t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/80 hover:text-white"
            aria-label="Cerrar notificación"
          >×</button>
        </div>
      ))}
    </div>
  )
}
