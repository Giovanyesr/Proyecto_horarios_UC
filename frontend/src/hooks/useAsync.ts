import { useState, useCallback } from 'react'

export function useAsync<T>(fn: (...args: unknown[]) => Promise<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true)
      setError(null)
      try {
        const result = await fn(...args)
        return result
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [fn],
  )

  return { execute, loading, error }
}
