import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { GameProvider } from './context/GameContext'
import Layout from './components/Layout'

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
          <div className="min-h-[100dvh] bg-parchment flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-pharmacy-green border-t-transparent animate-spin" />
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
