import { Outlet } from 'react-router-dom'
import FullscreenToggle from './FullscreenToggle'

export default function Layout() {
  return (
    <div className="game-backdrop">
      <div className="game-frame">
        <FullscreenToggle />
        <Outlet />
      </div>
    </div>
  )
}
