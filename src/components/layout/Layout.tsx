import { Outlet } from 'react-router-dom'
import BottomNav from '../ui/BottomNav'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
