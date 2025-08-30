import { useQuery } from '@tanstack/react-query'
import { fetchMyPayments } from '../../api/payments'
import {
  Pageable,
  PageParams,
  PaymentHistoryItem,
  PaymentHistoryRequest,
} from '../../../types/settlement'

export function useMyPayments(pageable: PageParams, request: PaymentHistoryRequest = {}) {
  return useQuery<Pageable<PaymentHistoryItem>>({
    queryKey: ['payments', 'histories', 'pageable', request, pageable],
    queryFn: () => fetchMyPayments(request, pageable),
    staleTime: 30000,
  })
}
