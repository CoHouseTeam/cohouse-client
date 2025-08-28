import axios from './axios'
import type { Settlement } from '../../types/settlement'
import { SETTLEMENT_ENDPOINTS } from './endpoints'

// 내 정산 내역 가져오기
export async function fetchMySettlements(): Promise<Settlement[]> {
  const { data } = await axios.get<Settlement[]>(SETTLEMENT_ENDPOINTS.MY_LIST)
  return data
}

// 정산 히스토리
export async function fetchMySettlementHistory(): Promise<Settlement[]> {
  const { data } = await axios.get(SETTLEMENT_ENDPOINTS.MY_HISTORY)
  return Array.isArray(data) ? data : (data?.content ?? [])
}

// 송금하기
export const postPaymentDone = (id: number) =>
  axios.post<Settlement>(SETTLEMENT_ENDPOINTS.PAYMENT_DONE(id)).then((r) => r.data)

// 정산 취소
export const cancelSettlement = (id: number) => axios.delete(SETTLEMENT_ENDPOINTS.DELETE(id))

// 정산 상세 조회
export async function fetchSettlementDetail(id: number): Promise<Settlement> {
  const { data } = await axios.get<Settlement>(SETTLEMENT_ENDPOINTS.DETAIL(id))
  return data
}
