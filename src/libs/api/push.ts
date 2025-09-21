import api from './axios'
import { PUSH_ENDPOINTS } from './endpoints'

export type RegisterFcmReq = {
  token: string
  deviceInfo?: string
  platform?: 'web' | 'android' | 'ios'
}
export type RegisterFcmResp = {
  id: number
  token: string
  active: boolean
  lastUsedAt: string
}

export async function registerFcmToken(body: RegisterFcmReq) {
  const { data } = await api.post(PUSH_ENDPOINTS.REGISTER, body)

  return data
}

export async function deleteFcmToken(tokenId: number) {
  const { data } = await api.delete(PUSH_ENDPOINTS.DELETE_BY_ID(tokenId))
  return data
}
