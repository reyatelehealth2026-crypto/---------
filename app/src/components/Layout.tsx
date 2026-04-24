import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-[100dvh] bg-parchment relative">
      <main className="pb-16">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}
