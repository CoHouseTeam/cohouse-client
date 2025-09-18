import { useQuery } from '@tanstack/react-query'
import { PageParams, Settlement } from '../../../types/settlement'
import {
  fetchMySettlementHistory,
  fetchMySettlements,
  fetchSettlementDetail,
  fetchGroupSettlements,
} from '../../api/settlements'

export function useMySettlements() {
  return useQuery<Settlement[]>({
    queryKey: ['settlements', 'my'],
    queryFn: fetchMySettlements,
    staleTime: 0,
  })
}

// 그룹별 정산 내역
export function useGroupSettlements(groupId: number) {
  return useQuery<Settlement[]>({
    queryKey: ['settlements', 'group', groupId],
    queryFn: () => fetchGroupSettlements(groupId),
    staleTime: 0,
    enabled: !!groupId,
  })
}

// 정산 히스토리
export function useMySettlementHistory(params: PageParams) {
  return useQuery({
    queryKey: ['settlements', 'myHistory', params],
    queryFn: () => fetchMySettlementHistory(params),
    staleTime: 0,
    refetchOnMount: 'always', // 마운트 때마다 새로고침
    refetchOnWindowFocus: true,
  })
}

// 정산 상세 조회
export function useSettlementDetail(id?: number) {
  return useQuery({
    queryKey: ['settlementDetail', id],
    // id가 숫자일 때만 실행
    enabled: typeof id === 'number',
    queryFn: () => fetchSettlementDetail(id!),
    staleTime: 0,
  })
}
