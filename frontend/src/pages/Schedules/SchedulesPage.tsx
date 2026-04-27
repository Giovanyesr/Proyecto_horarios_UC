import { useEffect, useState } from 'react'
import { schedulesApi, studentsApi, teachersApi } from '../../api'
import type { ScheduleRun, ScheduledSection, SolverConfig, Student, Teacher } from '../../types'
import { Spinner } from '../../components/common/Spinner'
import { WeeklyCalendar } from '../../components/schedule/WeeklyCalendar'
import { useUIStore } from '../../store/uiStore'

const DEFAULT_CONFIG: SolverConfig = {
  use_mrv: true, use_lcv: true, use_ac3: true, use_forward_checking: true,
  timeout_seconds: 60, slot_duration_hours: 2
}

const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  completed:  { label: 'Completado',     bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  running:    { label: 'Ejecutando',     bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  infeasible: { label: 'Sin solución',   bg: '#fefce8', text: '#a16207', dot: '#eab308' },
  error:      { label: 'Error',          bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
  timeout:    { label: 'Tiempo agotado', bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, bg: '#f8fafc', text: '#475569', dot: '#94a3b8' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: m.bg, color: m.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  )
}

const HEURISTICS: [keyof SolverConfig, string, string][] = [
  ['use_mrv', 'MRV', 'Minimum Remaining Values'],
  ['use_lcv', 'LCV', 'Least Constraining Value'],
  ['use_ac3', 'AC-3', 'Arc Consistency'],
  ['use_forward_checking', 'FC', 'Forward Checking'],
]

export default function SchedulesPage() {
  const [runs, setRuns] = useState<ScheduleRun[]>([])
  const [activeRun, setActiveRun] = useState<ScheduleRun | null>(null)
  const [sections, setSections] = useState<ScheduledSection[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [period, setPeriod] = useState('2026-1')
  const [config, setConfig] = useState<SolverConfig>(DEFAULT_CONFIG)
  const [generating, setGenerating] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [filterStudent, setFilterStudent] = useState<string | ''>('')
  const [filterTeacher, setFilterTeacher] = useState<string | ''>('')
  const { addToast } = useUIStore()

  const loadRuns = () => schedulesApi.listRuns().then(setRuns).catch(() => {})

  useEffect(() => {
    loadRuns()
    studentsApi.list({ size: 200, is_active: true }).then(r => setStudents(r.items)).catch(() => {})
    teachersApi.list({ size: 200, is_active: true }).then(r => setTeachers(r.items)).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const run = await schedulesApi.generate(period, config)
      addToast(run.status === 'completed' ? 'success' : 'error',
        run.status === 'completed' ? `Horario generado en ${run.duration_ms}ms` :
        run.status === 'infeasible' ? 'No hay solución posible con las restricciones actuales' :
        run.error_message ?? 'Error al generar')
      await loadRuns()
      if (run.status === 'completed') await viewRun(run)
    } catch (e: unknown) {
      addToast('error', e instanceof Error ? e.message : 'Error al generar horario')
    } finally {
      setGenerating(false)
    }
  }

  const viewRun = async (run: ScheduleRun) => {
    setActiveRun(run)
    setLoadingSections(true)
    try {
      const s = await schedulesApi.getSections(run.id, {
        student_id: filterStudent || undefined,
        teacher_id: filterTeacher || undefined,
      })
      setSections(s)
    } finally {
      setLoadingSections(false)
    }
  }

  const applyFilter = async () => {
    if (!activeRun) return
    setLoadingSections(true)
    try {
      const s = await schedulesApi.getSections(activeRun.id, {
        student_id: filterStudent || undefined,
        teacher_id: filterTeacher || undefined,
      })
      setSections(s)
    } finally { setLoadingSections(false) }
  }

  const completedRuns = runs.filter(r => r.status === 'completed').length

  return (
    <div className="p-6 xl:p-8 space-y-6 max-w-7xl animate-fadeIn">

      {/* ── Hero ── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 55%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 80% 40%, rgba(167,139,250,0.2) 0%, transparent 55%)' }} />
        <div className="relative px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
              <span className="text-violet-200 text-xs font-semibold uppercase tracking-widest">Motor CSP</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Generación de Horarios</h1>
            <p className="text-violet-300 text-sm mt-0.5">Backtracking + AC-3 + MRV/LCV</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-center px-4 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="text-xl font-extrabold text-white">{runs.length}</div>
              <div className="text-[10px] text-violet-200 uppercase tracking-wider">Ejecuciones</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="text-xl font-extrabold text-white">{completedRuns}</div>
              <div className="text-[10px] text-violet-200 uppercase tracking-wider">Completados</div>
            </div>
            {activeRun && (
              <div className="text-center px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="text-xl font-extrabold text-white">{sections.length}</div>
                <div className="text-[10px] text-violet-200 uppercase tracking-wider">Secciones</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3-column top panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Config panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', borderColor: '#e9d5ff' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800 text-sm">Configuración del Solver</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Período académico
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                value={period}
                onChange={e => setPeriod(e.target.value)}
                placeholder="2026-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Duración de bloque
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                value={config.slot_duration_hours}
                onChange={e => setConfig(c => ({ ...c, slot_duration_hours: Number(e.target.value) }))}
              >
                <option value={1}>1 hora</option>
                <option value={2}>2 horas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Timeout (segundos)
              </label>
              <input
                type="number" min={5} max={300}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                value={config.timeout_seconds}
                onChange={e => setConfig(c => ({ ...c, timeout_seconds: Number(e.target.value) }))}
              />
            </div>

            {/* Heuristics */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Heurísticas</p>
              <div className="grid grid-cols-2 gap-2">
                {HEURISTICS.map(([key, short, long]) => {
                  const on = config[key] as boolean
                  return (
                    <button
                      key={key}
                      onClick={() => setConfig(c => ({ ...c, [key]: !on }))}
                      className="flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all duration-150"
                      style={on ? {
                        background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)',
                        borderColor: '#c4b5fd',
                      } : {
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                      }}
                    >
                      <span className="text-[11px] font-extrabold" style={{ color: on ? '#7c3aed' : '#94a3b8' }}>{short}</span>
                      <span className="text-[9px] mt-0.5 leading-tight" style={{ color: on ? '#a78bfa' : '#cbd5e1' }}>{long}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2"
              style={generating || !period ? {
                background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed'
              } : {
                background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(109,40,217,0.35)',
              }}
              onClick={handleGenerate}
              disabled={generating || !period}
            >
              {generating ? (
                <><Spinner size="sm" /><span>Generando...</span></>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generar Horario
                </>
              )}
            </button>
          </div>
        </div>

        {/* Runs history */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', borderColor: '#e9d5ff' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800 text-sm">Historial de ejecuciones</h2>
            {runs.length > 0 && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#ede9fe', color: '#7c3aed' }}>
                {runs.length}
              </span>
            )}
          </div>
          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)' }}>
                <svg className="w-6 h-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-500">Sin ejecuciones aún</p>
              <p className="text-xs text-slate-400 mt-1">Genera tu primer horario</p>
            </div>
          ) : (
            <div className="divide-y overflow-y-auto max-h-[360px]" style={{ divideColor: '#f1f5f9' }}>
              {runs.map(run => {
                const isActive = activeRun?.id === run.id
                return (
                  <button key={run.id} onClick={() => viewRun(run)}
                    className="w-full text-left px-5 py-3.5 transition-all duration-150"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)'
                        : undefined,
                      borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#faf5ff' }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-700">{run.academic_period}</span>
                      <StatusBadge status={run.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400">
                        {new Date(run.created_at).toLocaleString('es-PE')}
                      </span>
                      {run.duration_ms != null && (
                        <span className="text-[11px] font-semibold"
                          style={{ color: '#8b5cf6' }}>
                          {run.duration_ms}ms
                        </span>
                      )}
                      {run.nodes_explored != null && (
                        <span className="text-[11px] text-slate-400">{run.nodes_explored} nodos</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', borderColor: '#e9d5ff' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800 text-sm">Filtros de visualización</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Estudiante
              </label>
              <select
                aria-label="Filtrar por estudiante"
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                value={filterStudent}
                onChange={e => setFilterStudent(e.target.value || '')}
              >
                <option value="">Todos los estudiantes</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Docente
              </label>
              <select
                aria-label="Filtrar por docente"
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                value={filterTeacher}
                onChange={e => setFilterTeacher(e.target.value || '')}
              >
                <option value="">Todos los docentes</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
              </select>
            </div>

            <button
              className="w-full py-2 rounded-xl font-bold text-sm transition-all duration-150"
              style={!activeRun ? {
                background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed'
              } : {
                background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)',
                color: '#7c3aed',
                border: '1px solid #c4b5fd',
              }}
              onClick={applyFilter}
              disabled={!activeRun}
            >
              Aplicar filtros
            </button>

            {activeRun && (
              <div className="rounded-xl p-3 text-xs space-y-1.5"
                style={{ background: '#f5f3ff', border: '1px solid #e9d5ff' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-700">Run #{activeRun.id}</span>
                  <StatusBadge status={activeRun.status} />
                </div>
                <div className="text-violet-600 font-medium">{activeRun.academic_period}</div>
                <div className="text-violet-500">{sections.length} sección(es) visibles</div>
                {activeRun.duration_ms != null && (
                  <div className="text-violet-400">Tiempo: {activeRun.duration_ms}ms</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Calendar section ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', borderColor: '#e9d5ff' }}>
          <div>
            <h2 className="font-bold text-slate-800">
              {activeRun ? `Horario — Período ${activeRun.academic_period}` : 'Calendario semanal'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeRun
                ? sections.length > 0
                  ? `${sections.length} sección${sections.length > 1 ? 'es' : ''} asignadas`
                  : 'Sin secciones con los filtros actuales'
                : 'Selecciona una ejecución o genera un nuevo horario'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loadingSections && <Spinner size="sm" />}
            {activeRun && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-400"
                  style={{ boxShadow: '0 0 5px #a78bfa' }} />
                <span className="text-xs font-semibold text-violet-600">Activo</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          {!activeRun ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)' }}>
                <svg className="w-8 h-8 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-600">Sin horario seleccionado</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Genera un nuevo horario o selecciona una ejecución del historial para visualizarlo.
              </p>
            </div>
          ) : (
            <WeeklyCalendar sections={sections} />
          )}
        </div>
      </div>

    </div>
  )
}
