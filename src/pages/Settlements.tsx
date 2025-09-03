import { useState, useEffect } from 'react'
import { PlusCircle } from 'react-bootstrap-icons'
import SettlementCreateModal from '../features/settlements/components/SettlementCreateModal'
import OngoingSettlements from '../features/settlements/components/OngoingSettlements'
import RecentSettlements from '../features/settlements/components/RecentSettlements'
import { getCurrentGroupId } from '../libs/api/groups'

import { useMyMemberId } from '../libs/hooks/useGroupMembers'
import { useGroupStore } from '../app/store'

export default function Settlements() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const groupId = useGroupStore((s) => s.groupId)
  const setGroupId = useGroupStore((s) => s.setGroupId)
  const setHasGroups = useGroupStore((s) => s.setHasGroups)

  // viewerId = 이 그룹에서의 "내 memberId"
  const { data: viewerId } = useMyMemberId(groupId)

  // 스토어에 groupId가 없으면 백엔드에서 한 번 가져와 채워넣기
  useEffect(() => {
    if (groupId != null) return
    let cancelled = false
    ;(async () => {
      try {
        const id = await getCurrentGroupId()
        if (!cancelled) {
          setGroupId(id)
          setHasGroups(true)
        }
      } catch (e) {
        console.error('현재 그룹 조회 실패:', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [groupId, setGroupId, setHasGroups])

  if (groupId == null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        그룹 정보를 불러오는 중...
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
