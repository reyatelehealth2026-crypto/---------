import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-[100dvh] bg-parchment">
      <Outlet />
    </div>
  )
}
