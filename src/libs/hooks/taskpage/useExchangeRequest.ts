import { Assignment, GroupMember, OverrideRequestBody } from '../../../types/tasks'
import { createOverrideRequest } from '../../api/tasks'

interface UseExchangeRequestParams {
  assignments: Assignment[]
  groupMembers: GroupMember[]
  myMemberId: number | null
  setExchangeSelected: (selected: number[]) => void
  setModalOpen: (open: boolean) => void
  showAlert: (msg: string) => void
}

export function useExchangeRequest({
  assignments,
  groupMembers,
  myMemberId,
  setExchangeSelected,
  setModalOpen,
  showAlert,
}: UseExchangeRequestParams) {
  return async function requestExchange(selectedIndices: number[]) {
    if (!selectedIndices.length) {
      showAlert('교환할 멤버를 선택해 주세요.')
      return
    }
    if (myMemberId === null) {
      showAlert('현재 로그인한 사용자 ID가 없습니다.')
      return
    }

    try {
      const targetIds = selectedIndices.map((idx) => groupMembers[idx].memberId)
      const targetId = targetIds[0]

      const swapAssignment = assignments.find((a) => {
        if (!a.groupMemberId) return false
        if (Array.isArray(a.groupMemberId)) return a.groupMemberId.includes(targetId)
        return a.groupMemberId === targetId
      })
      const swapAssignmentId = swapAssignment?.assignmentId ?? 0

      const currentUserAssignment = assignments.find((a) => {
        if (!a.groupMemberId) return false
        if (Array.isArray(a.groupMemberId)) return a.groupMemberId.includes(myMemberId)
        return a.groupMemberId === myMemberId
      })
      const assignmentId = currentUserAssignment?.assignmentId ?? 0

      const requestData: OverrideRequestBody = {
        assignmentId,
        targetId,
        targetIds,
        requesterId: myMemberId,
        swapAssignmentId,
      }

      await createOverrideRequest(requestData)

      setModalOpen(false)
      setExchangeSelected([])
      showAlert('업무 교환 요청이 성공하였습니다.')
    } catch (err) {
      showAlert('교환 요청에 실패했습니다.')
    }
  }
}
