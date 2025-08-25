import { useQuery } from '@tanstack/react-query'
import { fetchMyPayments } from '../../api/payments'
import { PaymentHistoryItem } from '../../../types/settlement'

export function useMyPayments() {
  return useQuery<PaymentHistoryItem[]>({
    queryKey: ['payments', 'histories'],
    queryFn: fetchMyPayments,
    staleTime: 30000,
  })
}
