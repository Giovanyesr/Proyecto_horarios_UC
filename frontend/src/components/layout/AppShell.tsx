import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '../common/Toast'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" id="main-content">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}
