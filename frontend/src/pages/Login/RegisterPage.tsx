import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: '' }
  let s = 0
  if (pwd.length >= 8) s++
  if (pwd.length >= 12) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  if (s <= 1) return { score: 1, label: 'Débil', color: '#ef4444' }
  if (s <= 2) return { score: 2, label: 'Regular', color: '#f59e0b' }
  if (s <= 3) return { score: 3, label: 'Buena', color: '#22c55e' }
  return { score: 4, label: 'Fuerte', color: '#22c55e' }
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
interface FieldProps {
  label: string
  children: React.ReactNode
  error?: string
  hint?: React.ReactNode
  touched?: boolean
}
function Field({ label, children, error, hint, touched }: FieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
        style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {children}
      {touched && error && (
        <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.85)' }}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <div className="mt-1.5">{hint}</div>}
    </div>
  )
}

// ─── Input base style ─────────────────────────────────────────────────────────
const inputStyle = (hasError: boolean): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
})

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, username: false, password: false, confirm: false })
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const strength = getStrength(password)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Correo inválido'
    if (!username.trim()) errs.username = 'El usuario es requerido'
    else if (username.trim().length < 4) errs.username = 'Mínimo 4 caracteres'
    else if (/\s/.test(username)) errs.username = 'Sin espacios'
    if (!password) errs.password = 'La contraseña es requerida'
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (!confirm) errs.confirm = 'Confirma tu contraseña'
    else if (confirm !== password) errs.confirm = 'Las contraseñas no coinciden'
    return errs
  }

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleBlur = (name: string, value: string) => {
    setTouched(t => ({ ...t, [name]: true }))
    const all = validate()
    setFieldErrors(fe => ({ ...fe, [name]: all[name] || '' }))
  }

  const handleChange = (name: string, value: string) => {
    if (name === 'email') setEmail(value)
    if (name === 'username') setUsername(value)
    if (name === 'password') setPassword(value)
    if (name === 'confirm') setConfirm(value)
    if ((touched as any)[name]) {
      // Validate inline with new value to avoid stale state
      const cur = { email, username, password, confirm, [name]: value }
      const errs: Record<string, string> = {}
      if (!cur.email.trim()) errs.email = 'El correo es requerido'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cur.email)) errs.email = 'Correo inválido'
      if (!cur.username.trim()) errs.username = 'El usuario es requerido'
      else if (cur.username.trim().length < 4) errs.username = 'Mínimo 4 caracteres'
      else if (/\s/.test(cur.username)) errs.username = 'Sin espacios'
      if (!cur.password) errs.password = 'La contraseña es requerida'
      else if (cur.password.length < 6) errs.password = 'Mínimo 6 caracteres'
      if (!cur.confirm) errs.confirm = 'Confirma tu contraseña'
      else if (cur.confirm !== cur.password) errs.confirm = 'Las contraseñas no coinciden'
      setFieldErrors(fe => ({ ...fe, [name]: errs[name] || '' }))
    }
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, username: true, password: true, confirm: true })
    const errs = validate()
    setFieldErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    setLoading(true)
    setError('')
    try {
      const data = await authApi.register(email.trim(), username.trim(), password)
      setAuth({ token: data.access_token, role: data.role, userId: data.user_id, username: data.username, studentId: data.student_id })
      navigate('/student', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const passwordMatch = confirm.length > 0 && confirm === password
  const passwordMismatch = touched.confirm && confirm.length > 0 && confirm !== password

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative"
      style={{ background: '#0d0d0f' }}>

      {/* Grain overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px]"
          style={{ background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.012) 0%, transparent 60%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-enter">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login"
            className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
            style={{ color: 'rgba(255,255,255,0.2)' }}>Horario · UC</p>
          <h1 className="text-xl font-bold text-white tracking-tight">Crear cuenta</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Necesitas un correo autorizado por administración
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Global error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm leading-snug" style={{ color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Field label="Correo institucional" error={fieldErrors.email} touched={touched.email}
              hint={
                email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null :
                email && <span className="text-[11px] flex items-center gap-1" style={{ color: 'rgba(34,197,94,0.8)' }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Formato válido
                </span>
              }>
              <input
                type="email"
                value={email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email', email)}
                placeholder="tu.correo@ucontinental.edu.pe"
                autoFocus
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-150"
                style={inputStyle(!!touched.email && !!fieldErrors.email)}
                onFocus={e => { if (!(touched.email && fieldErrors.email)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
                onBlurCapture={e => { if (!(touched.email && fieldErrors.email)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
            </Field>

            {/* Username */}
            <Field label="Nombre de usuario" error={fieldErrors.username} touched={touched.username}
              hint={
                !fieldErrors.username && username.length >= 4
                  ? <span className="text-[11px] flex items-center gap-1" style={{ color: 'rgba(34,197,94,0.8)' }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Disponible para usar
                    </span>
                  : username.length > 0 && username.length < 4
                    ? <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {4 - username.length} caracteres más
                      </span>
                    : null
              }>
              <input
                type="text"
                value={username}
                onChange={e => handleChange('username', e.target.value)}
                onBlur={() => handleBlur('username', username)}
                placeholder="nombre.apellido"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-150"
                style={inputStyle(!!touched.username && !!fieldErrors.username)}
                onFocus={e => { if (!(touched.username && fieldErrors.username)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
                onBlurCapture={e => { if (!(touched.username && fieldErrors.username)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
            </Field>

            {/* Password */}
            <Field label="Contraseña" error={fieldErrors.password} touched={touched.password}>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password', password)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-white text-sm outline-none transition-all duration-150"
                  style={inputStyle(!!touched.password && !!fieldErrors.password)}
                  onFocus={e => { if (!(touched.password && fieldErrors.password)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
                  onBlurCapture={e => { if (!(touched.password && fieldErrors.password)) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  aria-label={showPwd ? 'Ocultar' : 'Mostrar'}>
                  {showPwd
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <p className="text-[11px]" style={{ color: strength.color }}>
                    {strength.label}
                    <span className="ml-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {password.length < 8 && '· agrega más caracteres'}
                      {password.length >= 8 && !/[A-Z]/.test(password) && '· agrega mayúsculas'}
                      {password.length >= 8 && /[A-Z]/.test(password) && !/[0-9]/.test(password) && '· agrega números'}
                    </span>
                  </p>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirmar contraseña" error={fieldErrors.confirm} touched={touched.confirm}
              hint={
                passwordMatch
                  ? <span className="text-[11px] flex items-center gap-1" style={{ color: 'rgba(34,197,94,0.8)' }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Las contraseñas coinciden
                    </span>
                  : null
              }>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => handleChange('confirm', e.target.value)}
                  onBlur={() => handleBlur('confirm', confirm)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-white text-sm outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${
                      passwordMismatch ? 'rgba(239,68,68,0.5)' :
                      passwordMatch ? 'rgba(34,197,94,0.4)' :
                      'rgba(255,255,255,0.1)'
                    }`,
                  }}
                  onFocus={e => { if (!passwordMismatch && !passwordMatch) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
                  onBlurCapture={e => { if (!passwordMismatch && !passwordMatch) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}>
                  {showConfirm
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </Field>

            {/* Requirements checklist */}
            <div className="rounded-xl px-4 py-3 space-y-1.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2"
                style={{ color: 'rgba(255,255,255,0.25)' }}>Requisitos</p>
              {[
                { ok: password.length >= 6, text: 'Mínimo 6 caracteres' },
                { ok: /[A-Z]/.test(password), text: 'Al menos una mayúscula' },
                { ok: /[0-9]/.test(password), text: 'Al menos un número' },
                { ok: confirm === password && confirm.length > 0, text: 'Contraseñas coinciden' },
              ].map(({ ok, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <svg className="w-3 h-3 flex-shrink-0 transition-colors duration-200"
                    style={{ color: ok ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[11px] transition-colors duration-200"
                    style={{ color: ok ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)' }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#ffffff', color: '#0d0d0f', marginTop: 4 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#f0f0f0' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#ffffff' }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creando cuenta...
                  </span>
                : 'Crear cuenta'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.2)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login"
            className="underline underline-offset-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
            Iniciar sesión
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes enter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-enter { animation: enter 0.2s ease-out; }
        input::placeholder { color: rgba(255,255,255,0.15); }
        input { color-scheme: dark; }
      `}</style>
    </div>
  )
}
