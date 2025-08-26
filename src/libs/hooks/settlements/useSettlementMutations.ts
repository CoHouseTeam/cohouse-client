import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postPaymentDone, cancelSettlement } from '../../api/settlements'

// 송금 완료
export function usePaySettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => postPaymentDone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', 'my'] })
    },
  })
}

// 정산 취소
export function useCancelSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelSettlement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', 'my'] })
    },
  })
}
