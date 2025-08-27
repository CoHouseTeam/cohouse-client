import { useQuery } from '@tanstack/react-query'
import { Settlement } from '../../../types/settlement'
import {
  fetchMySettlementHistory,
  fetchMySettlements,
  fetchSettlementDetail,
} from '../../api/settlements'

export function useMySettlements() {
  return useQuery<Settlement[]>({
    queryKey: ['settlements', 'my'],
    queryFn: fetchMySettlements,
    staleTime: 30000,
  })
}

// 정산 히스토리
export function useMySettlementHistory() {
  return useQuery({
    queryKey: ['settlements', 'myHistory'],
    queryFn: fetchMySettlementHistory,
    staleTime: 30000,
  })
}

// 정산 상세 조회
export function useSettlementDetail(id?: number) {
  return useQuery({
    queryKey: ['settlementDetail', id],
    // id가 숫자일 때만 실행
    enabled: typeof id === 'number',
    queryFn: () => fetchSettlementDetail(id!),
    staleTime: 30000,
  })
}
