import { Link } from 'react-router-dom'
import SettlementListItem from './SettlementListItem'
import { useMySettlements } from '../../../libs/hooks/settlements/useMySettlements'
import LoadingSpinner from '../../common/LoadingSpinner'

export default function RecentSettlements() {
  const { data, isLoading, error } = useMySettlements()

  if (isLoading) return <LoadingSpinner />
  if (error) return <p className="text-sm text-error">에러가 발생했어요</p>

  // 완료된 정산
  const completed = (data ?? []).filter((s) => s.status === 'COMPLETED')

  // 최신순 정렬
  const sorted = completed.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // 최근 2개
  const recent2 = sorted.slice(0, 2)

  const isEmpty = completed.length === 0

  return (
    <section className={`card ${isEmpty ? 'border-2 border-dashed bg-base-200 shadow-sm' : ''}`}>
      <div
        className={`${isEmpty ? 'card-body p-4' : 'card-body p-4 bg-base-200 shadow rounded-xl'}`}
      >
        <div className="flex items-baseline gap-1 text-center">
          <h2 className="card-title text-success">정산 내역</h2>
          <div className="flex flex-1 justify-between">
            <span className="text-[0.7rem] text-neutral-400">(최근 내역 2개)</span>
            <Link to="/settlements/history" className="text-[0.7rem] pr-1 text-neutral-400">
              전체보기
            </Link>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex flex-col justify-center text-center mt-4">
            <img
              src="/src/assets/icons/settlementIcon.svg"
              alt="empty icon"
              className="h-10 w-10 mx-auto"
            />
            <p className="text-sm font-medium text-neutral-400 text-center p-3">
              정산 내역이 없어요
            </p>
          </div>
        ) : (
          <>
            {recent2.map((s) => (
              <SettlementListItem key={s.id} item={s} viewerId={1} />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
