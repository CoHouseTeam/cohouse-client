import { useQuery } from '@tanstack/react-query'
import { Settlement } from '../../../types/settlement'
import { fetchMySettlementHistory, fetchMySettlements } from '../../api/settlements'

export function useMySettlements() {
  return useQuery<Settlement[]>({
    queryKey: ['settlements', 'my'],
    queryFn: fetchMySettlements,
    staleTime: 30000,
  })
}

export function useMySettlementHistory() {
  return useQuery({
    queryKey: ['settlements', 'myHistory'],
    queryFn: fetchMySettlementHistory,
    staleTime: 30000,
  })
}
