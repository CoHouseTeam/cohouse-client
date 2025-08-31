import React, { useEffect, useState, useCallback } from 'react'
import TaskHistoryButton from '../features/tasks/components/TaskHistoryButton'
import TaskTable from '../features/tasks/components/TaskTable'
import TaskRandomButton from '../features/tasks/components/TaskRandomButton'
import TaskExchangeButton from '../features/tasks/components/TaskExchangeButton'
import CheckRepeat from '../features/tasks/components/CheckRepeat'
import GroupMemberList from '../features/tasks/components/GroupMemberList'
import HistoryModal from '../features/tasks/components/HistoryModal'
import ExchangeModal from '../features/tasks/components/ExchangeModal'
import { members as membersObj, repeatDays, templates } from '../mocks/db/tasks'
import axios from 'axios'
import { Assignment, GroupMember, TaskHistory } from '../types/tasks'
import { fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'
import { groupMembersName } from '../libs/utils/groupMemberName'

const historyItems: TaskHistory[] = [
  { date: '2025.07.29', task: '청소', status: '미완료' },
  { date: '2025.07.21', task: '분리수거', status: '완료' },
  { date: '2025.07.18', task: '설거지', status: '완료' },
  { date: '2025.07.12', task: '청소', status: '미완료' },
  { date: '2025.07.10', task: '설거지', status: '완료' },
  { date: '2025.07.07', task: '분리수거', status: '완료' },
]

const TasksPage: React.FC = () => {
  const [repeat, setRepeat] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isAssigned, setIsAssigned] = useState(false)
  const [isLeader, setIsLeader] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])

  const fetchAssignments = useCallback(async () => {
    if (!groupId) return

    try {
      const res = await axios.get(`/api/tasks/assignments?groupId=${groupId}`)
      setAssignments(Array.isArray(res.data) ? res.data : [])
    } catch {
      setAssignments([])
    }
  }, [groupId])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // 인증 상태 초기 설정
  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  // 그룹 및 멤버 정보 로딩
  const loadGroupInfo = useCallback(async () => {
    if (!userAuthenticated) {
      setIsLeader(false)
      setError('')
      return
    }

    setError('')
    try {
      const data = await fetchMyGroups()
      const groupMembersData: GroupMember[] = Array.isArray(data.groupMembers)
        ? data.groupMembers
        : []
      setGroupMembers(groupMembersData)
      setGroupId(data.id)

      // 로그인 사용자 id (임시: 첫 멤버) 기반으로 리더 여부 결정
      const loggedInUserId = groupMembersData[0]?.memberId ?? null
      const isMyLeader = groupMembersData.some((m) => m.memberId === loggedInUserId && m.isLeader)
      setIsLeader(isMyLeader)
    } catch (e) {
      setError('그룹 정보를 불러오는 중 오류가 발생했습니다.')
      setIsLeader(false)
    }
  }, [userAuthenticated])

  useEffect(() => {
    loadGroupInfo()
  }, [loadGroupInfo])

  // 그룹멤버를 Member 타입으로 변환
  const members = groupMembersName(groupMembers)
  const handleRandomAssign = useCallback(async () => {
    if (!groupId) {
      console.error('그룹 ID가 없습니다.')
      return
    }

    const memberIds = Object.keys(membersObj)
      .map(Number)
      .filter((id) => id > 0)
    if (memberIds.length === 0) {
      console.error('유효한 멤버가 없습니다.')
      return
    }

    for (const tpl of templates) {
      const repeatInfo = repeatDays.filter((rd) => rd.templateId === tpl.templateId)
      const assignmentPromises = Array.isArray(repeatInfo)
        ? repeatInfo.map(async (repeatDay) => {
            const randomMemberId = memberIds[Math.floor(Math.random() * memberIds.length)]
            return axios.post('/api/tasks/assignments', {
              groupId,
              groupMemberId: randomMemberId,
              templateId: tpl.templateId,
              dayOfWeek: repeatDay.dayOfWeek,
              repeatType: 'WEEKLY',
            })
          })
        : []

      await Promise.all(assignmentPromises)
    }
    await fetchAssignments()
    setIsAssigned(true)
  }, [fetchAssignments, groupId])

  if (isLeader === null) return <>Loading...</>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">주간 업무표</h1>
        <TaskHistoryButton onClick={() => setShowHistory(true)} />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <TaskTable assignments={assignments} />
      <div className="flex flex-col items-center space-y-4 mt-2">
        <div className="flex space-x-2">
          {isLeader && <TaskRandomButton onClick={handleRandomAssign} disabled={isAssigned} />}
          {isLeader ? (
            isAssigned && <TaskExchangeButton onClick={() => setModalOpen(true)} />
          ) : (
            <TaskExchangeButton onClick={() => setModalOpen(true)} />
          )}
          {isLeader && isAssigned && (
            <ExchangeModal
              open={modalOpen}
              members={members}
              selected={selected}
              onSelect={setSelected}
              onRequest={() => setModalOpen(false)}
              onClose={() => setModalOpen(false)}
            />
          )}
        </div>

        {isLeader && <CheckRepeat checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />}
      </div>
      {isLeader && (
        <>
          <div className="font-bold text-md mt-4 text-primary">참여 그룹원</div>
          <GroupMemberList members={members} />
        </>
      )}
      <HistoryModal open={showHistory} onClose={() => setShowHistory(false)} items={historyItems} />
    </div>
  )
}

export default TasksPage
