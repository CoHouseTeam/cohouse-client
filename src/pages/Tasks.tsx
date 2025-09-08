import React, { useCallback } from 'react'
import TaskHistoryButton from '../features/tasks/components/TaskHistoryButton'
import TaskTable from '../features/tasks/components/TaskTable'
import TaskExchangeButton from '../features/tasks/components/TaskExchangeButton'
import CheckRepeat from '../features/tasks/components/CheckRepeat'
import GroupMemberList from '../features/tasks/components/GroupMemberList'
import HistoryModal from '../features/tasks/components/HistoryModal'
import ExchangeModal from '../features/tasks/components/ExchangeModal'
import { OverrideRequestBody } from '../types/tasks'
import { isAuthenticated } from '../libs/utils/auth'
import { groupMembersName } from '../libs/utils/groupMemberName'
import { getDateOfThisWeek } from '../libs/utils/dayMapping'
import { createAssignment, createOverrideRequest } from '../libs/api/tasks'

import { useAuth } from '../libs/hooks/taskpage/useAuth'
import { useGroupData } from '../libs/hooks/taskpage/useGroupData'
import { useAssignments } from '../libs/hooks/taskpage/useAssignments'
import { useMyMemberId } from '../libs/hooks/taskpage/useMyMemberId'
import TaskRandomButton from '../features/tasks/components/TaskRandomButton'
import { useTaskStore } from '../app/tasksStore'
import LoadingSpinner from '../features/common/LoadingSpinner'

const TasksPage: React.FC = () => {
  const { userAuthenticated } = useAuth()
  const {
    groupId,
    groupMembers,
    templates,
    repeatDays,
    isLeader,
    error: groupError,
  } = useGroupData(userAuthenticated)
  const {
    assignments,
    isAssigned,
    error: assignmentsError,
    reload: reloadAssignments,
  } = useAssignments(userAuthenticated, groupId)
  const { myMemberId } = useMyMemberId()

  // zustand
  const repeat = useTaskStore((state) => state.repeat)
  const setRepeat = useTaskStore((state) => state.setRepeat)
  const showHistory = useTaskStore((state) => state.showHistory)
  const setShowHistory = useTaskStore((state) => state.setShowHistory)
  const exchangeSelected = useTaskStore((state) => state.exchangeSelected)
  const setExchangeSelected = useTaskStore((state) => state.setExchangeSelected)
  const modalOpen = useTaskStore((state) => state.modalOpen)
  const setModalOpen = useTaskStore((state) => state.setModalOpen)
  const error = useTaskStore((state) => state.error)
  // 에러 상태
  const combinedError = groupError || assignmentsError || error

  const isAlreadyAssigned = useCallback(
    (memberId: number, templateId: number, date: string) =>
      assignments.some(
        (a) => a.groupMemberId === memberId && a.templateId === templateId && a.date === date
      ),
    [assignments]
  )

  const showAlert = useCallback((message: string) => {
    alert(message)
  }, [])

  // 랜덤 배정
  const handleRandomAssign = useCallback(async () => {
    if (!isAuthenticated()) {
      showAlert('로그인이 필요합니다. 다시 로그인해 주세요.')
      return
    }
    if (!groupId || groupMembers.length === 0) {
      showAlert('그룹 정보가 없습니다.')
      return
    }
    if (!templates.length) {
      showAlert('템플릿 정보가 없습니다.')
      return
    }
    if (!repeatDays.length) {
      showAlert('반복 요일 정보가 없습니다. 템플릿의 반복 설정을 확인해 주세요.')
      return
    }

    try {
      const memberIds = groupMembers.map((m) => m.memberId).filter(Boolean) as number[]
      const assignmentPromises = []

      for (let idx = 0; idx < templates.length; idx++) {
        const tpl = templates[idx]
        const tplRepeatDays = repeatDays.filter((rd) => rd.templateId === tpl.templateId)

        const assignedMemberId = memberIds[idx % memberIds.length]

        for (const day of tplRepeatDays) {
          const assignDate = getDateOfThisWeek(day.dayOfWeek)

          if (!isAlreadyAssigned(assignedMemberId, tpl.templateId, assignDate)) {
            assignmentPromises.push(
              createAssignment({
                groupId,
                date: assignDate,
                templateId: tpl.templateId,
                groupMemberId: [assignedMemberId],
                randomEnabled: true,
              })
            )
          }
        }
      }

      await Promise.all(assignmentPromises)
      await reloadAssignments()
    } catch (err) {
      console.error(err)
      showAlert('랜덤 배정에 실패했습니다.')
    }
  }, [
    groupId,
    groupMembers,
    templates,
    repeatDays,
    isAlreadyAssigned,
    reloadAssignments,
    showAlert,
  ])

  // 교환 요청
  const handleExchangeRequest = useCallback(
    async (selectedIndices: number[]) => {
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
        console.error(err)
        showAlert('교환 요청에 실패했습니다.')
      }
    },
    [assignments, groupMembers, myMemberId, setExchangeSelected, setModalOpen, showAlert]
  )

  const handleRequest = () => handleExchangeRequest(exchangeSelected)
  const handleSelect = (selected: number[]) => setExchangeSelected(selected)

  if (isLeader === null)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    )

  const members = groupMembersName(groupMembers)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">주간 업무표</h1>
        <TaskHistoryButton onClick={() => setShowHistory(true)} />
      </div>

      {combinedError && <div className="text-red-600">{combinedError}</div>}

      <TaskTable assignments={assignments} groupMembers={groupMembers} isLeader={isLeader} />

      <div className="flex flex-col items-center space-y-4 mt-2">
        <div className="flex space-x-2">
          {isLeader && <TaskRandomButton onClick={handleRandomAssign} disabled={isAssigned} />}

          {(isLeader && isAssigned) || !isLeader ? (
            <TaskExchangeButton onClick={() => setModalOpen(true)} />
          ) : null}
        </div>
        {isLeader && <CheckRepeat checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />}
      </div>

      {isLeader && (
        <>
          <div className="font-bold text-md mt-4 text-primary">참여 그룹원</div>
          <GroupMemberList members={members} />
        </>
      )}

      <HistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        groupId={groupId ?? 0}
        memberId={myMemberId ?? 0}
      />

      {modalOpen && (
        <>
          <ExchangeModal
            open={modalOpen}
            members={members}
            selected={exchangeSelected}
            onSelect={handleSelect}
            onRequest={handleRequest}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}
    </div>
  )
}

export default TasksPage
