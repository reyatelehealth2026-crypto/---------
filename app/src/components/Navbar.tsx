import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', label: 'หน้าแรก', icon: Home },
  { path: '/wallet', label: 'คูปอง', icon: Ticket },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  // Only show navbar on user-facing pages
  const showNavPaths = ['/wallet']
  const shouldShow = showNavPaths.includes(location.pathname)

  if (!shouldShow) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-paper-line bg-cream-card shadow-elevated">
      <div className="max-w-[430px] mx-auto h-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex h-full w-20 flex-col items-center justify-center gap-1"
            >
              <Icon
                size={24}
                className={isActive ? 'text-pharmacy-green' : 'text-ink-light'}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[11px] font-medium ${
                  isActive ? 'text-pharmacy-green' : 'text-ink-light'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-pharmacy-green"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
