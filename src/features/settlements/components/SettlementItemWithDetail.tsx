// src/features/settlements/components/SettlementItemWithDetail.tsx
import ErrorCard from '../../common/ErrorCard'
import SettlementListItem from './SettlementListItem'
import { useSettlementDetail } from '../../../libs/hooks/settlements/useMySettlements'
import type {
  Settlement,
  SettlementListItem as SettlementListItemType,
} from '../../../types/settlement'

// DTO(HistoryItem) → Settlement
function toSettlementStub(dto: SettlementListItemType): Settlement {
  return {
    id: dto.id,
    payerId: 0, // DTO에 없으므로 기본값
    payerName: '', // 기본값
    category: dto.category,
    title: dto.title ?? '',
    description: null, // 선택 필드 기본값
    settlementAmount: dto.settlementAmount ?? 0,
    status: dto.status,
    imageUrl: null, // 인터페이스가 string | null 이므로 null로
    platformSupportAmount: 0, // 기본값
    equalDistribution: false, // 기본값
    participants: [] as Settlement['participants'],
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
  }
}

type Props = {
  initial: SettlementListItemType
  viewerId: number
  groupId: number
}

/** id로 상세를 조회해 기존 카드에 그대로 전달하는 래퍼 컴포넌트 */
export default function SettlementItemWithDetail({ initial, viewerId, groupId }: Props) {
  const { data, error } = useSettlementDetail(initial.id)

  if (error) return <ErrorCard message="정산 상세 정보를 불러오는 중 오류가 발생했습니다." />

  // 상세 오기 전엔 DTO 스텁으로 먼저 렌더, 도착하면 자동 교체
  const item: Settlement = data ?? toSettlementStub(initial)
  return <SettlementListItem item={item} viewerId={viewerId} groupId={groupId} />
}
