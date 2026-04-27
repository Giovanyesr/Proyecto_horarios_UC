import { Outlet } from 'react-router-dom'
import { StudentSidebar } from './StudentSidebar'
import { ToastContainer } from '../common/Toast'
import { useThemeStore } from '../../store/themeStore'

export function StudentShell() {
  const { theme } = useThemeStore()

  return (
    <div
      className="flex h-screen overflow-hidden"
      data-sp-theme={theme}
      style={{ background: 'var(--sp-bg)' }}
    >
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto" id="main-content">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}
