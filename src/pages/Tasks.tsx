import React, { useCallback } from 'react'
import TaskHistoryButton from '../features/tasks/components/TaskHistoryButton'
import TaskTable from '../features/tasks/components/TaskTable'
import TaskExchangeButton from '../features/tasks/components/TaskExchangeButton'
import CheckRepeat from '../features/tasks/components/CheckRepeat'
import GroupMemberList from '../features/tasks/components/GroupMemberList'
import HistoryModal from '../features/tasks/components/HistoryModal'
import ExchangeModal from '../features/tasks/components/ExchangeModal'
import { useAuth } from '../libs/hooks/taskpage/useAuth'
import { useGroupData } from '../libs/hooks/taskpage/useGroupData'
import { useAssignments } from '../libs/hooks/taskpage/useAssignments'
import { useMyMemberId } from '../libs/hooks/taskpage/useMyMemberId'
import TaskRandomButton from '../features/tasks/components/TaskRandomButton'
import { useTaskStore } from '../app/tasksStore'
import LoadingSpinner from '../features/common/LoadingSpinner'
import { groupMembersName } from '../libs/utils/groupMemberName'
import { useRandomAssign } from '../libs/hooks/taskpage/useRandomAssign'
import { useExchangeRequest } from '../libs/hooks/taskpage/useExchangeRequest'

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
  const handleRandomAssign = useRandomAssign({
    groupId,
    groupMembers,
    templates,
    repeatDays,
    isAlreadyAssigned,
    reloadAssignments,
    showAlert,
    randomModeEnabled: repeat,
  })

  // 교환 요청
  const handleExchangeRequest = useExchangeRequest({
    assignments,
    groupMembers,
    myMemberId,
    setExchangeSelected,
    setModalOpen,
    showAlert,
  })

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
        <ExchangeModal
          open={modalOpen}
          members={members}
          selected={exchangeSelected}
          onSelect={handleSelect}
          onRequest={handleRequest}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default TasksPage
