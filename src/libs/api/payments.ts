// src/libs/api/payments.ts
import qs from 'qs'
import axios from './axios'
import { PAYMENT_ENDPOINTS } from './endpoints'
import type {
  Pageable,
  PageParams,
  PaymentHistoryItem,
  PaymentHistoryRequest,
} from '../../types/settlement'

/** 송금 히스토리 페이지 조회 (원본 Pageable 반환) */
export async function fetchMyPayments(
  request: PaymentHistoryRequest = {},
  pageable: PageParams
): Promise<Pageable<PaymentHistoryItem>> {
  const { data } = await axios.get<Pageable<PaymentHistoryItem>>(PAYMENT_ENDPOINTS.HISTORIES, {
    params: { request, pageable },
    paramsSerializer: (p) => qs.stringify(p, { allowDots: true, arrayFormat: 'repeat' }),
  })
  return data
}
