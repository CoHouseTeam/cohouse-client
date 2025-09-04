import LoadingSpinner from '../../common/LoadingSpinner'
import SettlementListItem from './SettlementListItem'
import { useMySettlements } from '../../../libs/hooks/settlements/useMySettlements'
import ErrorCard from '../../common/ErrorCard'
import { Settlement } from '../../../types/settlement'

interface OngoingSettlementsProps {
  groupId: number
  viewerId?: number
}

export default function OngoingSettlements({ groupId, viewerId }: OngoingSettlementsProps) {
  if (!groupId) return null

  const { data, isLoading, error } = useMySettlements()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorCard message="정산 정보를 불러오는 중 오류가 발생했습니다." />

  const list: Settlement[] = Array.isArray(data)
    ? data
    : // 페이지네이션/랩퍼 응답을 쓰는 경우 대비
      Array.isArray((data as any)?.content)
      ? (data as any).content
      : []

  const mine =
    viewerId != null
      ? list.filter(
          (s) => s.payerId === viewerId || s.participants.some((p) => p.memberId === viewerId)
        )
      : list

  const ongoing = mine.filter((s) => s.status === 'PENDING')
  const isEmpty = ongoing.length === 0

  return (
    <section className={`card ${isEmpty ? 'shadow-sm' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <h2 className="card-title text-xl">진행 중인 정산</h2>
      </div>
      <div
        className={`rounded-lg ${isEmpty ? 'card-body border-2 border-dashed' : 'card-body p-1'}`}
      >
        {isEmpty ? (
          <div className="flex flex-col justify-center text-center mt-4">
            <img
              src="/src/assets/icons/settlementIcon.svg"
              alt="empty icon"
              className="h-10 w-10 mx-auto"
            />
            <p className="text-sm font-medium text-neutral-400 text-center p-3">
              진행 중인 정산이 없어요
            </p>
          </div>
        ) : (
          <>
            {ongoing.map((s) => (
              <SettlementListItem key={s.id} item={s} groupId={groupId} viewerId={viewerId} />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
