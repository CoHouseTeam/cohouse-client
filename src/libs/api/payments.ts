import axios from './axios'
import type { PaymentHistoryItem } from '../../types/settlement'
import { SETTLEMENTS_ENDPOINTS } from './endpoints'

// 내 송금 내역 가져오기
export async function fetchMyPayments(): Promise<PaymentHistoryItem[]> {
  const { data } = await axios.get(SETTLEMENTS_ENDPOINTS.PAYMENT_HISTORIES)
  return Array.isArray(data) ? data : (data?.content ?? [])
}
