import api from './axios'
import qs from 'qs'

import type {
  CreateSettlementBody,
  CreateSettlementResp,
  Pageable,
  PageParams,
  Settlement,
  SettlementListItem,
} from '../../types/settlement'
import { SETTLEMENT_ENDPOINTS } from './endpoints'

export type ReceiptOcrResp = {
  imageUrl: string
  settlementAmount: number
  ocrSuccess: boolean
}

// 내 정산 내역 가져오기
export async function fetchMySettlements(): Promise<Settlement[]> {
  const { data } = await api.get<Settlement[]>(SETTLEMENT_ENDPOINTS.MY_LIST)
  return data
}

// 정산 히스토리
export async function fetchMySettlementHistory(
  params: PageParams
): Promise<Pageable<SettlementListItem>> {
  const { page, size, sort = 'createdAt,desc' } = params

  const { data } = await api.get<Pageable<SettlementListItem>>(SETTLEMENT_ENDPOINTS.MY_HISTORY, {
    params: { pageable: { page, size, sort } },
    paramsSerializer: (p) => qs.stringify(p, { allowDots: true, arrayFormat: 'repeat' }),
  })
  return data // ← Page<SettlementListItem> - content와 totalPages 등을 모두 갖는 Page 객체
}

// 송금하기
export const postPaymentDone = (id: number) =>
  api.post<Settlement>(SETTLEMENT_ENDPOINTS.PAYMENT_DONE(id)).then((r) => r.data)

// 정산 취소
export const cancelSettlement = (id: number) => api.delete(SETTLEMENT_ENDPOINTS.DELETE(id))

// 정산 상세 조회
export async function fetchSettlementDetail(id: number): Promise<Settlement> {
  const { data } = await api.get<Settlement>(SETTLEMENT_ENDPOINTS.DETAIL(id))
  return data
}

// 정산 생성/수정 이후의 영수증 업로드(저장)(POST: 최초 업로드 / PUT: 교체)
export async function uploadSettlementReceipt(
  settlementId: number,
  groupId: number,
  file: File,
  method: 'POST' | 'PUT' = 'POST'
): Promise<ReceiptOcrResp> {
  const form = new FormData()
  form.append('file', file)

  const url = SETTLEMENT_ENDPOINTS.RECEIPT(settlementId)
  const config = {
    params: { groupId },
    timeout: 20000,
    withCredentials: true,
  }

  const { data } =
    method === 'PUT'
      ? await api.put<ReceiptOcrResp>(url, form, config)
      : await api.post<ReceiptOcrResp>(url, form, config)
  return data
}

// 정산 생성 전 OCR 미리보기
export async function ocrSettlementReceipt(file: File): Promise<ReceiptOcrResp> {
  const form = new FormData()
  form.append('file', file, file.name)

  const { data } = await api.post<ReceiptOcrResp>(SETTLEMENT_ENDPOINTS.RECEIPT_OCR, form, {
    timeout: 20000,
    validateStatus: (s) => s >= 200 && s < 300,
  })
  return data
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
