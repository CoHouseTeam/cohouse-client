import { useState, useEffect } from 'react'
import { PlusCircle } from 'react-bootstrap-icons'
import SettlementCreateModal from '../features/settlements/components/SettlementCreateModal'
import OngoingSettlements from '../features/settlements/components/OngoingSettlements'
import RecentSettlements from '../features/settlements/components/RecentSettlements'
import { getCurrentGroupId } from '../libs/api/groups'
import { useParams } from 'react-router-dom'
import { useMyMemberId } from '../libs/hooks/useGroupMembers'

export default function Settlements() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // viewerId = 이 그룹에서의 "내 memberId"
  const { data: viewerId } = useMyMemberId(groupId)

  // 라우트 파람이 없을 수도 있으니 optional로
  const { groupId: groupIdParam } = useParams<{ groupId?: string }>()

  // 그룹 ID 가져오기
  useEffect(() => {
    const fetchGroupId = async () => {
      try {
        setLoading(true)
        // URL 파라미터가 있으면 그것을 사용, 없으면 API에서 가져오기
        if (groupIdParam) {
          const parsed = Number(groupIdParam)
          if (Number.isFinite(parsed)) {
            setGroupId(parsed)
            return
          }
        }

        // API에서 현재 그룹 ID 가져오기
        const currentGroupId = await getCurrentGroupId()
        setGroupId(currentGroupId)
      } catch (error) {
        console.error('그룹 ID 가져오기 실패:', error)
        setError('그룹 정보를 가져올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchGroupId()
  }, [groupIdParam])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="ml-4 text-gray-500">그룹 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (error || !groupId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-error mb-4">{error || '그룹 정보를 찾을 수 없습니다.'}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 w-full md:max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-secondary">정산하기</h1>
        </div>

        <section className="card border border-neutral-200 shadow rounded-lg">
          <div className="card-body flex flex-col items-center justify-center px-3 py-4 gap-3 ">
            <p className="text-base font-semibold h-fit text-secondary">
              그룹원과 투명하게 정산해요
            </p>
            <button
              className="flex items-center gap-2 bg-secondary btn-sm mt-2 text-white rounded-lg font-bold"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle />
              정산 등록
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          {/* 진행 중인 정산 */}
          <OngoingSettlements groupId={groupId} viewerId={viewerId} />

          {/* 정산 내역 */}
          <RecentSettlements groupId={groupId} viewerId={viewerId} />
        </div>
      </div>

      {isModalOpen && (
        <SettlementCreateModal
          onClose={() => setIsModalOpen(false)}
          mode="create"
          groupId={groupId}
        />
      )}
    </>
  )
}
