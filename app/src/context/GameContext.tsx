import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CustomerProfile, Reward, TrackingParams } from '../lib/campaign'
import { pharmacyProfile } from '../lib/campaign'
import type { BootstrapResponse, ServerCustomer, WalletResponse } from '../lib/api'
import {
  bootstrapCampaign,
  claimShareBonus as claimShareBonusApi,
  drawMainReward as drawMainRewardApi,
  fetchWallet,
  lookupCustomerByLine,
  registerCustomer as registerCustomerApi,
  redeemReward as redeemRewardApi,
  verifyFriendship as verifyFriendshipApi,
} from '../lib/api'
import type { LineSession } from '../lib/lineLiff'
import { initializeLine, requestLineFriendship, shareCampaignToLine } from '../lib/lineLiff'

interface GameState {
  tracking: TrackingParams
  customer: ServerCustomer | null
  rewards: Reward[]
  friendUnlocked: boolean
  shareBonusClaimed: boolean
  lastRewardId: string | null
  campaign: BootstrapResponse['campaign']
  lineConfig: BootstrapResponse['line']
  line: LineSession | null
  isReady: boolean
  isSubmitting: boolean
  error: string | null
}

interface GameContextType {
  state: GameState
  hasPlayed: boolean
  registerCustomer: (customer: Omit<CustomerProfile, 'registeredAt'>) => Promise<WalletResponse>
  drawMainReward: () => Promise<Reward>
  unlockFriendGate: () => Promise<void>
  confirmFriendGateManually: () => Promise<void>
  claimShareBonus: () => Promise<Reward>
  redeemReward: (code: string, staffPin?: string) => Promise<Reward>
  refreshWallet: () => Promise<void>
  clearSession: () => void
  clearError: () => void
}

const GameContext = createContext<GameContextType | null>(null)
const SESSION_CUSTOMER_ID = 'pharmacy-campaign-customer-id'

const readTrackingFromLocation = (): TrackingParams => {
  const searchParams = new URLSearchParams(window.location.search)
  const hashQuery = window.location.hash.includes('?')
    ? new URLSearchParams(window.location.hash.split('?')[1])
    : new URLSearchParams()
  const read = (key: string) => searchParams.get(key) ?? hashQuery.get(key)

  return {
    utmSource: read('utm_source'),
    utmMedium: read('utm_medium'),
    utmCampaign: read('utm_campaign'),
    branch: read('branch'),
    qrId: read('qr_id'),
  }
}

const initialState = (tracking: TrackingParams): GameState => ({
  tracking,
  customer: null,
  rewards: [],
  friendUnlocked: false,
  shareBonusClaimed: false,
  lastRewardId: null,
  campaign: pharmacyProfile,
  lineConfig: {
    liffRequired: false,
    lineAuthConfigured: false,
  },
  line: null,
  isReady: false,
  isSubmitting: false,
  error: null,
})

const applyWallet = (state: GameState, wallet: WalletResponse): GameState => ({
  ...state,
  customer: wallet.customer,
  rewards: wallet.rewards,
  friendUnlocked: wallet.friendUnlocked,
  shareBonusClaimed: wallet.rewards.some((reward) => reward.type === 'bonus'),
})

export function GameProvider({ children }: { children: ReactNode }) {
  const [tracking] = useState(() => readTrackingFromLocation())
  const [state, setState] = useState<GameState>(() => initialState(tracking))

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      try {
        const [bootstrap, line] = await Promise.all([
          bootstrapCampaign(tracking),
          initializeLine(),
        ])
        if (cancelled) return

        const customerId = window.sessionStorage.getItem(SESSION_CUSTOMER_ID)
        let wallet = customerId ? await fetchWallet(customerId).catch(() => null) : null
        if (!wallet && line?.accessToken) {
          wallet = (await lookupCustomerByLine(line.accessToken).catch(() => null))?.wallet ?? null
          if (wallet?.customer.id) {
            window.sessionStorage.setItem(SESSION_CUSTOMER_ID, wallet.customer.id)
          }
        }
        if (cancelled) return

        setState((prev) => {
          const next = {
            ...prev,
            campaign: bootstrap.campaign,
            lineConfig: bootstrap.line,
            line,
            isReady: true,
            error: line.error,
          }
          return wallet ? applyWallet(next, wallet) : next
        })
      } catch (error) {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          isReady: true,
          error: error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อ API ได้',
        }))
      }
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [tracking])

  const setSubmitting = (isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }))
  }

  const setError = (error: unknown) => {
    setState((prev) => ({
      ...prev,
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
    }))
  }

  const refreshWallet = useCallback(async () => {
    const customerId = window.sessionStorage.getItem(SESSION_CUSTOMER_ID)
    if (!customerId) return
    const wallet = await fetchWallet(customerId)
    setState((prev) => applyWallet(prev, wallet))
  }, [])

  const registerCustomer = useCallback(
    async (customer: Omit<CustomerProfile, 'registeredAt'>) => {
      setSubmitting(true)
      try {
        const response = await registerCustomerApi({
          profile: customer,
          tracking: state.tracking,
          lineAccessToken: state.line?.accessToken,
        })
        window.sessionStorage.setItem(SESSION_CUSTOMER_ID, response.customer.id)
        setState((prev) => ({
          ...applyWallet(prev, response.wallet),
          lastRewardId: null,
          error: null,
        }))
        return response.wallet
      } catch (error) {
        setError(error)
        throw error
      } finally {
        setSubmitting(false)
      }
    },
    [state.line?.accessToken, state.tracking],
  )

  const drawMainReward = useCallback(async () => {
    if (!state.customer) throw new Error('ต้องลงทะเบียนก่อนรับรางวัล')
    setSubmitting(true)
    try {
      const response = await drawMainRewardApi(state.customer.id, state.tracking)
      setState((prev) => ({
        ...applyWallet(prev, response.wallet),
        lastRewardId: response.reward.id,
        error: null,
      }))
      return response.reward
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [state.customer, state.tracking])

  const unlockFriendGate = useCallback(async () => {
    if (!state.customer) throw new Error('ต้องลงทะเบียนก่อนปลดล็อกคูปอง')
    setSubmitting(true)
    try {
      await requestLineFriendship()
      const response = await verifyFriendshipApi({
        customerId: state.customer.id,
        lineUserId: state.line?.profile?.userId,
        tracking: state.tracking,
      })
      setState((prev) => ({ ...applyWallet(prev, response.wallet), error: null }))
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [state.customer, state.line?.profile?.userId, state.tracking])

  const confirmFriendGateManually = useCallback(async () => {
    if (!state.customer) throw new Error('ต้องลงทะเบียนก่อนปลดล็อกคูปอง')
    setSubmitting(true)
    try {
      const response = await verifyFriendshipApi({
        customerId: state.customer.id,
        lineUserId: state.line?.profile?.userId,
        tracking: state.tracking,
      })
      setState((prev) => ({ ...applyWallet(prev, response.wallet), error: null }))
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [state.customer, state.line?.profile?.userId, state.tracking])

  const claimShareBonus = useCallback(async () => {
    if (!state.customer) throw new Error('ต้องลงทะเบียนก่อนรับโบนัส')
    setSubmitting(true)
    try {
      await shareCampaignToLine()
      const response = await claimShareBonusApi(state.customer.id, state.tracking)
      setState((prev) => ({
        ...applyWallet(prev, response.wallet),
        lastRewardId: response.reward.id,
        error: null,
      }))
      return response.reward
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [state.customer, state.tracking])

  const redeemReward = useCallback(async (code: string, staffPin?: string) => {
    setSubmitting(true)
    try {
      const response = await redeemRewardApi(code, staffPin)
      await refreshWallet()
      setState((prev) => ({ ...prev, error: null }))
      return response.reward
    } catch (error) {
      setError(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [refreshWallet])

  const clearSession = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_CUSTOMER_ID)
    setState((prev) => ({
      ...prev,
      customer: null,
      rewards: [],
      friendUnlocked: false,
      shareBonusClaimed: false,
      lastRewardId: null,
    }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const value = useMemo<GameContextType>(
    () => ({
      state,
      hasPlayed: state.rewards.some((reward) => reward.type === 'main'),
      registerCustomer,
      drawMainReward,
      unlockFriendGate,
      confirmFriendGateManually,
      claimShareBonus,
      redeemReward,
      refreshWallet,
      clearSession,
      clearError,
    }),
    [
      state,
      registerCustomer,
      drawMainReward,
      unlockFriendGate,
      confirmFriendGateManually,
      claimShareBonus,
      redeemReward,
      refreshWallet,
      clearSession,
      clearError,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}

export type { GameState, ServerCustomer, TrackingParams, Reward }
