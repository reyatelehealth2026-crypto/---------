import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Gift,
  Hand,
  HeartPulse,
  Play,
  ShieldCheck,
  Smartphone,
  Ticket,
  X,
} from 'lucide-react'
import { rewardTemplates } from '../lib/campaign'
import { useGame } from '../context/GameContext'
import { getLiffEntryUrl } from '../lib/lineLiff'

const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]
const cnyLogoUrl = 'https://manager.cnypharmacy.com/assets/img/cny-logo.png'
const lineAddFriendUrl = 'https://page.line.me/clinicya'

export default function LandingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, hasPlayed } = useGame()
  const [showRules, setShowRules] = useState(false)
  const query = searchParams.toString()
  const liffEntryUrl = getLiffEntryUrl()
  const requiresLine = state.lineConfig.liffRequired
  const hasLineSession = Boolean(state.line?.accessToken)
  const canStartCampaign = !requiresLine || hasLineSession

  const steps = useMemo(
    () => [
      { label: 'แอด LINE', icon: Smartphone },
      { label: 'สมัครสมาชิก', icon: ClipboardCheck },
      { label: 'เล่นเกมส์', icon: Hand },
      { label: 'รับคูปอง', icon: Gift },
    ],
    [],
  )

  const startPath = state.customer ? '/game' : '/register'
  const startLabel = 'เล่นเกมส์'

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-parchment text-ink-dark">
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(180deg,#F7F2E8_0%,#ECF7F0_100%)]" />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[460px] flex-col px-5 pb-24 pt-4">
        <header className="px-1 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src={cnyLogoUrl} alt="CNY HEALTHCARE" className="h-10 w-[128px] shrink-0 object-contain" />
              <div className="hidden min-w-0 min-[410px]:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pharmacy-green">
                  Healthcare Wholesale
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-light">
                  ขายส่งยา อาหารเสริม อุปกรณ์การแพทย์
                </p>
              </div>
            </div>
            <a
              href={lineAddFriendUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#06C755]/30 bg-white/35 px-2.5 text-pharmacy-green shadow-sm backdrop-blur transition active:scale-[0.98]"
              aria-label="เพิ่มเพื่อน LINE @clinicya"
            >
              <span className="grid size-5 place-items-center rounded-[5px] bg-[#06C755] text-[7px] font-black leading-none text-white">
                LINE
              </span>
              <span className="text-sm font-bold lowercase tracking-normal">{state.campaign.lineHandle}</span>
            </a>
          </div>
        </header>

        <section className="relative flex flex-1 flex-col items-center pt-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeSpring }}
            className="rounded-full bg-white/85 px-4 py-2 text-xs font-semibold leading-5 text-deep-green shadow-sm"
          >
            ร้านขายส่งยา อันดับ 1 ที่คุณวางใจ อาหารเสริม และอุปกรณ์การแพทย์ครบวงจร
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: easeSpring }}
            className="mt-5 font-display text-[40px] font-semibold leading-[1.08] text-pharmacy-green"
          >
            {state.campaign.campaignTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.45 }}
            className="mt-3 max-w-[340px] text-[15px] leading-7 text-ink-medium"
          >
            {state.campaign.campaignSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="mt-5 w-full"
          >
            {canStartCampaign ? (
              <motion.button
                onClick={() => navigate(`${startPath}${query ? `?${query}` : ''}`)}
                className="relative flex h-20 w-full items-center justify-center overflow-visible transition active:scale-[0.96]"
                whileTap={{ scale: 0.94 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="/ui-button-play.png"
                  alt={startLabel}
                  className="h-20 w-auto object-contain drop-shadow-[0_16px_24px_rgba(212,184,90,0.45)]"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 font-display text-lg font-semibold text-white drop-shadow-[0_2px_0_rgba(22,74,56,0.6)]">
                  {startLabel}
                  <Play size={18} fill="currentColor" />
                </span>
              </motion.button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-[8px] border border-gold/35 bg-gold/10 px-4 py-3 text-left text-sm leading-6 text-ink-medium">
                  เปิดผ่าน LINE เพื่อรับสิทธิ์สำหรับลูกค้าใหม่และเก็บคูปองไว้ใน Wallet
                </div>
                <a
                  href={liffEntryUrl ?? '#'}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[8px] bg-pharmacy-green text-lg font-semibold text-white shadow-button transition active:scale-[0.98]"
                >
                  เปิดใน LINE
                  <ExternalLink size={18} />
                </a>
              </div>
            )}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-ink-light">
              <button onClick={() => setShowRules(true)} className="underline underline-offset-4">
                กติกาและเงื่อนไข
              </button>
              {hasPlayed && (
                <button onClick={() => navigate('/wallet')} className="font-semibold text-pharmacy-green">
                  ดู Wallet
                </button>
              )}
            </div>
            {!canStartCampaign && state.line?.error && (
              <div className="mt-3 rounded-[8px] bg-alert-coral/10 px-4 py-3 text-left text-sm text-alert-coral">
                {state.line.error}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.24, duration: 0.55, ease: easeSpring }}
            className="relative mt-6"
          >
            <motion.img
              src="/landing-jar-hero.png"
              alt="แคปซูลคูปอง CNY HEALTHCARE"
              className="relative z-10 h-auto w-[min(82vw,330px)]"
              animate={{ y: [0, -7, 0], rotate: [-0.8, 0.8, -0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src="/mascot-happy.png"
              alt="มาสคอต CNY ทักทาย"
              className="absolute -right-4 bottom-0 z-20 h-28 object-contain drop-shadow-[0_12px_18px_rgba(22,74,56,0.24)]"
              animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute bottom-2 left-1/2 h-4 w-52 -translate-x-1/2 rounded-full bg-ink-dark/10 blur-md" />
          </motion.div>

        </section>
      </div>

      {showRules && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45">
          <div className="mx-auto max-h-[82vh] w-full max-w-[460px] overflow-y-auto rounded-t-[16px] bg-white p-5 shadow-elevated">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-semibold">กติกาแคมเปญ</p>
                <p className="text-sm text-ink-medium">สำหรับลูกค้าใหม่ที่แอด LINE @clinicya ผ่านแคมเปญ CNY HEALTHCARE</p>
              </div>
              <button
                aria-label="ปิดกติกา"
                onClick={() => setShowRules(false)}
                className="grid size-9 place-items-center rounded-[8px] bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-ink-dark">ขั้นตอน</p>
              <div className="flex w-full items-center justify-between gap-1">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={step.label} className="flex flex-1 items-center">
                      <div className="flex flex-1 flex-col items-center gap-2">
                        <div className="grid size-10 place-items-center rounded-[8px] bg-sky-wash text-pharmacy-green shadow-sm">
                          <Icon size={20} />
                        </div>
                        <span className="text-[11px] font-medium text-ink-medium">{step.label}</span>
                      </div>
                      {index < steps.length - 1 && <ChevronRight size={14} className="text-ink-light" />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-ink-dark">รางวัลตัวอย่าง</p>
              <div className="grid grid-cols-3 gap-2">
                {rewardTemplates.slice(0, 3).map((reward) => (
                  <div
                    key={reward.id}
                    className="rounded-[8px] border border-paper-line bg-white p-3 text-left"
                  >
                    <Ticket size={18} className="text-gold" />
                    <p className="mt-2 text-sm font-semibold leading-snug">{reward.name}</p>
                    <p className="mt-1 text-[11px] leading-4 text-ink-light">มีจำนวนจำกัด</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-sm leading-6 text-ink-medium">
              <div className="flex gap-3">
                <HeartPulse className="mt-1 shrink-0 text-pharmacy-green" size={20} />
                <p>ผู้ใช้ 1 LINE user รับสิทธิ์ได้ 1 ครั้งต่อแคมเปญ หากเคยรับแล้วระบบจะเปิด Wallet เดิม</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 shrink-0 text-pharmacy-green" size={20} />
                <p>คูปองใช้กับสินค้าและบริการสุขภาพที่ร่วมรายการของ CNY HEALTHCARE และไม่สามารถแลกเป็นเงินสด</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
