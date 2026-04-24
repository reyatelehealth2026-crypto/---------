import type { CustomerProfile, Reward, TrackingParams } from './campaign'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export interface ServerCustomer extends CustomerProfile {
  id: string
  lineUserId?: string | null
  displayName?: string | null
}

export interface WalletResponse {
  customer: ServerCustomer
  rewards: Reward[]
  friendUnlocked: boolean
  friendshipVerifiedAt: string | null
}

export interface BootstrapResponse {
  campaign: {
    name: string
    lineHandle: string
    phone: string
    campaignTitle: string
    campaignSubtitle: string
  }
  line: {
    liffRequired: boolean
    lineAuthConfigured: boolean
  }
}

export interface AdminSummary {
  events: Record<string, number>
  sources: Array<{ source: string; total: number }>
  rewardTemplates: AdminRewardTemplate[]
  participants: AdminParticipant[]
}

export interface AdminRewardTemplate {
  id: string
  tier: string
  name: string
  description: string
  amount: number
  weight: number
  stock_remaining: number
  image: string
  terms: string
  active: boolean
}

export interface AdminParticipant {
  id: string
  name: string
  phone: string
  displayName?: string | null
  lineUserId?: string | null
  registeredAt: string
  rewardCount: number
  mainRewardName?: string | null
  mainRewardCode?: string | null
  mainRewardStatus?: string | null
  lastRewardAt?: string | null
  friendUnlocked: boolean
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  })
  const body = (await response.json().catch(() => ({}))) as { message?: string }
  if (!response.ok) {
    throw new Error(body.message ?? `API request failed: ${response.status}`)
  }
  return body as T
}

export const bootstrapCampaign = (tracking: TrackingParams) =>
  request<BootstrapResponse>('/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ tracking }),
  })

export const registerCustomer = (payload: {
  profile: Omit<CustomerProfile, 'registeredAt'>
  tracking: TrackingParams
  lineAccessToken?: string | null
}) =>
  request<{ customer: ServerCustomer; wallet: WalletResponse }>('/customers/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const lookupCustomerByLine = (lineAccessToken: string) =>
  request<{ wallet: WalletResponse | null }>('/customers/lookup', {
    method: 'POST',
    body: JSON.stringify({ lineAccessToken }),
  })

export const fetchWallet = (customerId: string) =>
  request<WalletResponse>(`/wallet?customerId=${encodeURIComponent(customerId)}`)

export const drawMainReward = (customerId: string, tracking: TrackingParams) =>
  request<{ reward: Reward; wallet: WalletResponse }>('/rewards/draw', {
    method: 'POST',
    body: JSON.stringify({ customerId, tracking }),
  })

export const verifyFriendship = (payload: {
  customerId: string
  lineUserId?: string | null
  tracking: TrackingParams
}) =>
  request<{ wallet: WalletResponse }>('/friendships/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const claimShareBonus = (customerId: string, tracking: TrackingParams) =>
  request<{ reward: Reward; wallet: WalletResponse }>('/rewards/share-bonus', {
    method: 'POST',
    body: JSON.stringify({ customerId, tracking }),
  })

export const redeemReward = (code: string, staffPin?: string) =>
  request<{ reward: Reward }>('/rewards/redeem', {
    method: 'POST',
    body: JSON.stringify({ code, staffPin }),
  })

export const fetchAdminSummary = (adminKey?: string) => {
  const query = adminKey ? `?key=${encodeURIComponent(adminKey)}` : ''
  return request<AdminSummary>(`/admin/summary${query}`)
}

export const updateAdminRewardTemplate = (
  rewardId: string,
  updates: Partial<Pick<AdminRewardTemplate, 'name' | 'description' | 'amount' | 'weight' | 'stock_remaining' | 'terms' | 'active'>>,
  adminKey?: string,
) => {
  const query = adminKey ? `?key=${encodeURIComponent(adminKey)}` : ''
  return request<{ rewardTemplate: AdminRewardTemplate }>(`/admin/reward-templates/${encodeURIComponent(rewardId)}${query}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}
