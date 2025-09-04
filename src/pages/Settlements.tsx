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
     
        // API에서 현재 그룹 ID 가져오기
        const currentGroupId = await getCurrentGroupId()
        setGroupId(currentGroupId)
        
        // 그룹이 없는 경우 에러 메시지 설정하지 않음 (정상적인 상황)
        if (!currentGroupId) {
          setError('그룹에 속해있지 않습니다. 그룹에 가입하거나 그룹을 생성해주세요.')
        }
      } catch (error) {
        console.error('그룹 ID 가져오기 실패:', error)
        setError('그룹 정보를 가져올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [groupId, setGroupId, setHasGroups])

  if (groupId == null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          {error && error.includes('그룹에 속해있지 않습니다') ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">그룹이 필요합니다</h3>
              <p className="text-blue-600 mb-4">{error}</p>
              <div className="space-y-2">
                <p className="text-sm text-blue-500">그룹을 생성하거나 초대 코드로 가입할 수 있습니다.</p>
                <p className="text-sm text-blue-500">그룹에 가입하면 정산 기능을 사용할 수 있어요!</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-lg text-error mb-4">{error || '그룹 정보를 찾을 수 없습니다.'}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </button>
            </>
          )}
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
