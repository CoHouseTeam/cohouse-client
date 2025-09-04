import { Link } from 'react-router-dom'
import SettlementListItem from './SettlementListItem'
import { useMySettlementHistory } from '../../../libs/hooks/settlements/useMySettlements'
import LoadingSpinner from '../../common/LoadingSpinner'
import ErrorCard from '../../common/ErrorCard'

interface RecentSettlementsProps {
  groupId: number
  viewerId?: number
}

export default function RecentSettlements({ groupId, viewerId }: RecentSettlementsProps) {
  const { data, isLoading, error } = useMySettlementHistory({ page: 0, size: 20 })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorCard message="최근 정산 정보를 불러오는 중 오류가 발생했습니다." />

  const list = Array.isArray(data) ? data : []

  // 완료된 정산
  const completed = list.filter((s) => s.status === 'COMPLETED')

  // 최신순 정렬
  const sorted = completed.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // 최근 2개
  const recent2 = sorted.slice(0, 2)

  const isEmpty = completed.length === 0

  return (
    <section className={`card ${isEmpty ? 'shadow-sm' : ''}`}>
      <div className="flex items-baseline gap-1 text-center mb-1">
        <h2 className="card-title">정산 내역</h2>
        <div className="flex flex-1 justify-between">
          <span className="text-[0.7rem] text-neutral-400">(최근 내역 2개)</span>
          <Link to="/settlements/history" className="text-[0.7rem] pr-1 text-neutral-400">
            전체보기
          </Link>
        </div>
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
              정산 내역이 없어요
            </p>
          </div>
        ) : (
          <>
            {recent2.map((s) => (
              <SettlementListItem key={s.id} item={s} groupId={groupId} viewerId={viewerId} />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
