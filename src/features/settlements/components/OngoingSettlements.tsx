import LoadingSpinner from '../../common/LoadingSpinner'
import SettlementListItem from './SettlementListItem'
import { useGroupSettlements } from '../../../libs/hooks/settlements/useMySettlements'
import ErrorCard from '../../common/ErrorCard'

interface OngoingSettlementsProps {
  groupId?: number
}

export default function OngoingSettlements({ groupId }: OngoingSettlementsProps) {
  const { data, isLoading, error } = useGroupSettlements(groupId || 0)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorCard message="정산 정보를 불러오는 중 오류가 발생했습니다." />

  const ongoing = Array.isArray(data) ? data.filter((s) => s.status === 'PENDING') : []
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
              <SettlementListItem key={s.id} item={s} viewerId={1} />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
