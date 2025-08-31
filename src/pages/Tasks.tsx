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

const members = Object.entries(membersObj).map(([, data]) => ({
  name: data.name,
  profileUrl: data.profileUrl,
}))

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

  // 인증 상태 한 번만 평가 및 저장
  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  // 그룹 정보 로딩 (유저 인증 상태 변경 시 실행)
  const loadGroupInfo = useCallback(async () => {
    if (!userAuthenticated) {
      setIsLeader(false)
      setError('')
      return
    }
    setError('')
    try {
      const data = await fetchMyGroups()
      const groupMembers: GroupMember[] = Array.isArray(data.groupMembers) ? data.groupMembers : []

      // 그룹 ID 설정
      setGroupId(data.id)

      // 실제 로그인된 유저 id 로 교체 필요 (임시로 첫 멤버 사용)
      const loggedInUserId = groupMembers[0]?.memberId ?? null
      const isMyLeader = groupMembers.some((m) => m.memberId === loggedInUserId && m.isLeader)
      setIsLeader(isMyLeader)
    } catch (e) {
      setError('그룹 정보를 불러오는 중 오류가 발생했습니다.')
      setIsLeader(false)
    }
  }, [userAuthenticated])

  useEffect(() => {
    loadGroupInfo()
  }, [loadGroupInfo])

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
              groupId: groupId, // 동적으로 가져온 groupId 사용
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

  if (isLeader === null) return <div>Loading...</div>

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
