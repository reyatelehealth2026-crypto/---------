import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { GameProvider } from './context/GameContext'
import Layout from './components/Layout'
import EggLoader from './components/game/EggLoader'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const GamePage = lazy(() => import('./pages/GamePage'))
const RewardPage = lazy(() => import('./pages/RewardPage'))
const WalletPage = lazy(() => import('./pages/WalletPage'))
const RedeemPage = lazy(() => import('./pages/RedeemPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function App() {
  return (
    <GameProvider>
      <Suspense
        fallback={
          <div className="game-backdrop">
            <div className="game-frame flex items-center justify-center">
              <EggLoader label="กำลังโหลดเกม..." />
            </div>
          </div>
        }
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/reward" element={<RewardPage />} />
            <Route path="/wallet" element={<WalletPage />} />
          </Route>
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </GameProvider>
  )
}

export default App
