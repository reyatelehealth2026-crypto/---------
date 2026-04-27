import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TicketCheck, Timer, Wallet } from 'lucide-react'
import { formatThaiDate, pharmacyProfile } from '../lib/campaign'
import { useGame } from '../context/GameContext'
import { cutePetAssets, getCapsuleTheme } from '../lib/gameAssets'
import AppHeader from '../components/AppHeader'
import GameImage from '../components/game/GameImage'
import CoinIcon from '../components/game/CoinIcon'
import CutePetBackground from '../components/game/CutePetBackground'

export default function WalletPage() {
  const navigate = useNavigate()
  const { state } = useGame()

  const usableRewards = useMemo(
    () => state.rewards.filter((reward) => reward.status === 'unused'),
    [state.rewards],
  )
  const lineProfile = state.line?.profile
  const lineDisplayName = lineProfile?.displayName ?? state.customer?.displayName ?? 'โปรไฟล์ LINE'
  const registeredName = state.customer?.name ?? '-'
  const registeredPhone = state.customer?.phone ?? '-'
  const profileInitial = (lineDisplayName || registeredName || 'C').trim().charAt(0).toUpperCase()

  return (
    <div className="relative min-h-full overflow-hidden px-5 pb-24 pt-5 text-ink-dark">
      <CutePetBackground variant="hills" className="absolute inset-0 -z-10 h-full w-full" showTrees />
      <div className="mx-auto max-w-[460px]">
        <AppHeader showBack backLabel="หน้าแคมเปญ" onBack={() => navigate('/')} showWallet={false} />
        <section className="relative overflow-hidden rounded-[20px] border-2 border-[#E2C076] bg-deep-green p-5 text-white shadow-elevated">
          <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
          <GameImage
            src={cutePetAssets.currency.coinPile}
            decorative
            className="pointer-events-none absolute -right-2 -top-3 z-10 h-24 rotate-12 object-contain opacity-90"
          />
          <div className="relative z-20 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/75">{state.campaign.name || pharmacyProfile.name}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold">คูปองของฉัน</h1>
            </div>
            <Wallet size={38} className="text-gold" />
          </div>
          <div className="relative z-20 mt-5 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 rounded-[12px] bg-white/12 p-3">
              <CoinIcon variant="coin" className="h-8 w-8 object-contain" />
              <div>
                <p className="text-xl font-semibold">{state.rewards.length}</p>
                <p className="text-[11px] text-white/70">ทั้งหมด</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[12px] bg-white/12 p-3">
              <CoinIcon variant="diamond" className="h-8 w-8 object-contain" />
              <div>
                <p className="text-xl font-semibold">{usableRewards.length}</p>
                <p className="text-[11px] text-white/70">ใช้ได้</p>
              </div>
            </div>
            <div className="rounded-[12px] bg-white/12 p-3">
              <p className="text-xl font-semibold">{state.friendUnlocked ? 'เปิด' : 'ล็อก'}</p>
              <p className="text-[11px] text-white/70">LINE OA</p>
            </div>
          </div>
        </section>

        {state.rewards.length === 0 ? (
          <section className="mt-5 rounded-[18px] border-2 border-[#E2C076] bg-white p-5 text-center shadow-sm">
            <motion.img
              src={cutePetAssets.mascots.cat}
              alt="แมวน้อยรอคูปองแรก"
              className="mx-auto h-44 object-contain drop-shadow-[0_16px_22px_rgba(82,46,12,0.25)]"
              animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              draggable={false}
            />
            <h2 className="mt-3 font-display text-2xl font-semibold">ยังไม่มีคูปอง</h2>
            <p className="mt-2 text-sm leading-6 text-ink-medium">
              เริ่มรับสิทธิ์จากแคมเปญ CNY HEALTHCARE เพื่อเก็บคูปองแรกของคุณ
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-5 w-full rounded-[14px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
            >
              ไปหน้าแคมเปญ
            </button>
          </section>
        ) : (
          <div className="mt-5 space-y-4">
            {state.rewards.map((reward) => {
              const theme = getCapsuleTheme(reward.tier)
              const coinVariant =
                reward.amount >= 300 ? 'diamond' : reward.amount >= 100 ? 'pile' : 'coin'
              return (
                <article
                  key={reward.id}
                  className="relative overflow-hidden rounded-[18px] border-2 border-[#E2C076] bg-white p-4 shadow-sm"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1.5"
                    style={{ backgroundColor: theme.text }}
                    aria-hidden="true"
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CoinIcon variant={coinVariant} className="h-6 w-6 object-contain" />
                        <p className="text-xs font-semibold" style={{ color: theme.text }}>
                          {reward.type === 'bonus' ? 'โบนัสแชร์' : 'รางวัลหลัก'}
                        </p>
                      </div>
                      <h2 className="mt-1 font-display text-lg font-semibold leading-tight">
                        {reward.name}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        reward.status === 'unused'
                          ? 'bg-success-mint/15 text-pharmacy-green'
                          : 'bg-muted text-ink-light'
                      }`}
                    >
                      {reward.status === 'unused' ? 'ใช้ได้' : 'ใช้แล้ว'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-ink-light">
                    <Timer size={14} />
                    หมดอายุ {formatThaiDate(reward.expiryDate)}
                  </div>
                  <p className="mt-1 font-mono text-sm font-semibold text-ink-medium">
                    {reward.code}
                  </p>
                  <button
                    disabled={reward.status !== 'unused'}
                    onClick={() => navigate(`/redeem?code=${encodeURIComponent(reward.code)}`)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-pharmacy-green px-4 py-3 font-semibold text-white disabled:bg-muted disabled:text-ink-light"
                  >
                    <TicketCheck size={16} />
                    ใช้คูปองที่ร้าน
                  </button>
                </article>
              )
            })}
          </div>
        )}

        <section className="mt-5 rounded-[18px] border-2 border-[#E2C076] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative grid size-16 shrink-0 place-items-center rounded-full border-2 border-pharmacy-green/25 bg-sky-wash shadow-sm">
              {lineProfile?.pictureUrl ? (
                <img
                  src={lineProfile.pictureUrl}
                  alt={lineDisplayName}
                  className="size-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-display font-semibold text-pharmacy-green">
                  {profileInitial}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-pharmacy-green">โปรไฟล์ LINE</p>
              <h2 className="truncate font-display text-2xl font-semibold leading-tight">
                {lineDisplayName}
              </h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-[12px] bg-muted/70 px-3 py-2">
              <p className="text-xs font-medium text-ink-light">ชื่อที่ลงทะเบียน</p>
              <p className="mt-1 truncate font-semibold text-ink-dark">{registeredName}</p>
            </div>
            <div className="rounded-[12px] bg-muted/70 px-3 py-2">
              <p className="text-xs font-medium text-ink-light">เบอร์มือถือ</p>
              <p className="mt-1 truncate font-semibold text-ink-dark">{registeredPhone}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
