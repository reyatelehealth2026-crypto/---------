import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartPulse, Phone, ShieldCheck, Sparkles } from 'lucide-react'
import { isValidThaiMobile, normalizeThaiPhone } from '../lib/campaign'
import { useGame } from '../context/GameContext'
import { getLiffEntryUrl } from '../lib/lineLiff'
import { cutePetAssets, gameAssets } from '../lib/gameAssets'
import AppHeader from '../components/AppHeader'
import ErrorBanner from '../components/ErrorBanner'
import GameImage from '../components/game/GameImage'
import GachaButton from '../components/game/GachaButton'
import CutePetBackground from '../components/game/CutePetBackground'

const facebookUrl = 'https://www.facebook.com/CLINICYATH/'
const lineAddFriendUrl = 'https://page.line.me/clinicya'
const facebookIconUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
const lineIconUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, registerCustomer } = useGame()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consentMarketing, setConsentMarketing] = useState<boolean | null>(null)
  const [nameTouched, setNameTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const liffEntryUrl = getLiffEntryUrl()
  const requiresLine = state.lineConfig.liffRequired
  const hasLineSession = Boolean(state.line?.accessToken)

  const query = useMemo(() => searchParams.toString(), [searchParams])
  const nameValue = nameTouched ? name : (state.customer?.name ?? name)
  const phoneValue = phoneTouched ? phone : (state.customer?.phone ?? phone)
  const consentValue = consentMarketing ?? state.customer?.consentMarketing ?? true

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = nameValue.trim()
    const normalizedPhone = normalizeThaiPhone(phoneValue)

    if (trimmedName.length < 2) {
      setError('กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร')
      return
    }

    if (!isValidThaiMobile(normalizedPhone)) {
      setError('กรุณากรอกเบอร์มือถือไทย 10 หลัก เช่น 0812345678')
      return
    }

    if (!consentValue) {
      setError('ต้องยอมรับเงื่อนไขและแอด LINE ก่อนรับสิทธิ์')
      return
    }

    try {
      await registerCustomer({
        name: trimmedName,
        phone: normalizedPhone,
        visitReason: 'ลูกค้าใหม่',
        consentMarketing: consentValue,
      })
      navigate(`/game${query ? `?${query}` : ''}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถลงทะเบียนได้')
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden text-ink-dark">
      <CutePetBackground variant="hills" className="absolute inset-0 -z-10 h-full w-full" showTrees />
      <div className="relative z-10 mx-auto min-h-full max-w-[460px] px-5 pb-12 pt-4">
        <AppHeader showBack backLabel="กลับหน้าแคมเปญ" onBack={() => navigate('/')} />
        {requiresLine && !hasLineSession ? (
          <div className="rounded-[18px] border-2 border-[#E2C076] bg-white p-5 shadow-elevated">
            <h1 className="font-display text-2xl font-semibold">เปิดผ่าน LINE ก่อนรับสิทธิ์</h1>
            <p className="mt-2 text-sm leading-6 text-ink-medium">
              สมัครผ่าน LINE เพื่อรับสิทธิ์ลูกค้าใหม่และติดตามโปรโมชั่นจาก CNY HEALTHCARE
            </p>
            <a
              href={liffEntryUrl ?? '#'}
              className="mt-4 flex w-full items-center justify-center rounded-[14px] bg-pharmacy-green px-4 py-4 text-base font-semibold text-white shadow-button"
            >
              เปิดใน LINE เพื่อแอด @clinicya
            </a>
          </div>
        ) : (
          <>
            <div className="relative mb-3 mt-1 flex items-center gap-3">
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                className="shrink-0"
              >
                <GameImage
                  src={cutePetAssets.mascots.bird}
                  alt="นกน้อยทักทาย"
                  className="h-20 w-20 object-contain drop-shadow-[0_12px_18px_rgba(82,46,12,0.25)]"
                />
              </motion.div>
              <div className="rounded-[16px] border-2 border-[#E2C076] bg-[#FFF6DC] px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold text-pharmacy-green">เริ่มแคมเปญลูกค้าใหม่</p>
                <h1 className="mt-1 font-display text-xl font-extrabold leading-tight text-[#5A2E0F]">
                  ลงทะเบียนรับสิทธิ์ส่วนลดสูงสุด 600 บาท
                </h1>
              </div>
            </div>

            <form
              onSubmit={submit}
              className="relative space-y-4 rounded-[18px] border-2 border-[#E2C076] bg-white p-5 shadow-elevated"
            >
              <div className="pointer-events-none absolute -top-4 right-4">
                <GameImage
                  src={gameAssets.rewards.ticket}
                  decorative
                  className="h-12 rotate-[-6deg] object-contain drop-shadow-[0_8px_12px_rgba(82,46,12,0.25)]"
                />
              </div>

              <ErrorBanner message={state.error} tone="soft" />

              {state.customer && (
                <div className="rounded-[12px] border border-pharmacy-green/20 bg-sky-wash px-4 py-3 text-sm leading-6 text-ink-medium">
                  พบข้อมูลที่เคยสมัครไว้แล้ว สามารถตรวจชื่อและเบอร์ แล้วกดเล่นเกมส์ได้ทันที
                </div>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-[#5A2E0F]">ชื่อเล่น / ชื่อผู้รับสิทธิ์</span>
                <input
                  value={nameValue}
                  onChange={(event) => {
                    setNameTouched(true)
                    setName(event.target.value)
                  }}
                  className="mt-2 h-12 w-full rounded-[12px] border-2 border-[#E2C076]/60 bg-[#FFFDF2] px-4 text-base outline-none transition focus:border-pharmacy-green focus:ring-2 focus:ring-pharmacy-green/15"
                  placeholder="เช่น คุณนิด"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#5A2E0F]">เบอร์มือถือ</span>
                <input
                  value={phoneValue}
                  onChange={(event) => {
                    setPhoneTouched(true)
                    setPhone(event.target.value)
                  }}
                  inputMode="tel"
                  className="mt-2 h-12 w-full rounded-[12px] border-2 border-[#E2C076]/60 bg-[#FFFDF2] px-4 text-base outline-none transition focus:border-pharmacy-green focus:ring-2 focus:ring-pharmacy-green/15"
                  placeholder="0812345678"
                />
              </label>

              <label className="flex items-start gap-3 rounded-[12px] bg-sky-wash p-3">
                <input
                  type="checkbox"
                  checked={consentValue}
                  onChange={(event) => setConsentMarketing(event.target.checked)}
                  className="mt-1 size-4 accent-pharmacy-green"
                />
                <span className="text-sm leading-6 text-ink-medium">
                  ยอมรับเงื่อนไขแคมเปญและแอด LINE @clinicya เพื่อรับคูปอง ส่วนลด และข่าวสารจาก CNY HEALTHCARE
                </span>
              </label>

              <ErrorBanner message={error} onDismiss={() => setError(null)} />

              <GachaButton
                type="submit"
                disabled={state.isSubmitting}
                label={
                  state.isSubmitting
                    ? 'กำลังตรวจสอบสิทธิ์...'
                    : state.customer
                      ? 'เล่นเกมส์'
                      : 'ยืนยันและเล่นเกมส์'
                }
                iconLeading={<Sparkles size={18} />}
                size="xl"
              />
            </form>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[16px] border-2 border-[#E2C076] bg-white p-4 shadow-sm">
                <ShieldCheck size={22} className="text-pharmacy-green" />
                <p className="mt-2 font-semibold">เติบโตไปกับ CNY</p>
                <p className="mt-1 text-xs leading-5 text-ink-light">
                  CNY HEALTHCARE เป็นส่วนหนึ่งในเรื่องราวความสำเร็จของคุณ ก้าวไปข้างหน้าพร้อมเราเพื่อสร้างอนาคตที่สดใสและมั่นคงในธุรกิจสุขภาพ
                </p>
              </div>
              <div className="rounded-[16px] border-2 border-[#E2C076] bg-white p-4 shadow-sm">
                <HeartPulse size={22} className="text-alert-coral" />
                <p className="mt-2 font-semibold">ช่องทางติดต่อ</p>
                <div className="mt-2 space-y-2 text-xs leading-5">
                  <a
                    href="tel:0991915416"
                    className="flex items-center gap-2 rounded-[10px] bg-muted/70 px-2 py-1.5 font-medium text-ink-medium"
                  >
                    <Phone size={14} className="text-pharmacy-green" />
                    099-191-5416 กด 2
                  </a>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-[10px] bg-muted/70 px-2 py-1.5 font-medium text-ink-medium"
                  >
                    <img src={facebookIconUrl} alt="" className="size-4" />
                    CNYPHARMACY
                  </a>
                  <a
                    href={lineAddFriendUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-[10px] bg-[#06C755]/10 px-2 py-1.5 font-semibold uppercase text-pharmacy-green"
                  >
                    <img src={lineIconUrl} alt="" className="size-4 rounded-[3px]" />
                    @CLINICYA
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
