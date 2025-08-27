import LoadingSpinner from '../../common/LoadingSpinner'
import SettlementListItem from './SettlementListItem'
import { useMySettlements } from '../../../libs/hooks/settlements/useMySettlements'

export default function OngoingSettlements() {
  const { data, isLoading, error } = useMySettlements()

  if (isLoading) return <LoadingSpinner />
  if (error) return <p className="text-sm text-error">에러가 발생했어요</p>

  const ongoing = Array.isArray(data) ? data.filter((s: any) => s.status === 'PENDING') : []
  const isEmpty = ongoing.length === 0

  return (
    <section className={`card ${isEmpty ? 'border-2 border-dashed bg-base-200 shadow-sm' : ''}`}>
      <div
        className={`${isEmpty ? 'card-body p-4' : 'card-body p-4 bg-base-200 shadow rounded-xl'}`}
      >
        <div className="flex justify-between items-center">
          <h2 className="card-title text-xl">진행 중인 정산</h2>
        </div>
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
