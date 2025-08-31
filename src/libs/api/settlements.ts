import axios from './axios'
import type { CreateSettlementBody, CreateSettlementResp, Settlement } from '../../types/settlement'
import { SETTLEMENT_ENDPOINTS } from './endpoints'
import api from './axios'

export type UploadReceiptResp = {
  imageUrl: string
}

// 내 정산 내역 가져오기
export async function fetchMySettlements(): Promise<Settlement[]> {
  const { data } = await axios.get<Settlement[]>(SETTLEMENT_ENDPOINTS.MY_LIST)
  return data
}

// 그룹별 정산 내역 가져오기
export async function fetchGroupSettlements(groupId: number): Promise<Settlement[]> {
  const { data } = await axios.get<Settlement[]>(SETTLEMENT_ENDPOINTS.GROUP_LIST(groupId))
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

// 영수증 이미지 업로드(POST: 최초 업로드 / PUT: 교체)
export async function uploadSettlementReceipt(
  settlementId: number,
  groupId: number,
  file: File,
  method: 'POST' | 'PUT' = 'POST'
): Promise<UploadReceiptResp> {
  const form = new FormData()
  form.append('file', file)

  const url = SETTLEMENT_ENDPOINTS.RECEIPT(settlementId)
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { groupId },
  }

  if (method === 'PUT') {
    const { data } = await api.put<UploadReceiptResp>(url, form, config)
    return data
  } else {
    const { data } = await api.post<UploadReceiptResp>(url, form, config)
    return data
  }
}

// 영수증 삭제
export async function deleteSettlementReceipt(settlementId: number): Promise<void> {
  const url = SETTLEMENT_ENDPOINTS.RECEIPT(settlementId)
  await api.delete(url)
}

// 정산 생성(등록)
export async function createSettlement(body: CreateSettlementBody): Promise<CreateSettlementResp> {
  const { data } = await api.post<CreateSettlementResp>(SETTLEMENT_ENDPOINTS.CREATE, body)
  return data
}
