import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

client.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('horarioai-auth')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
  } catch { /* ignore */ }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('horarioai-auth')
      window.location.href = '/login'
    }
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred'
    return Promise.reject(new Error(message))
  },
)

export default client
