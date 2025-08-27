import React, { useCallback, useEffect, useState } from 'react'
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
import { Assignment, TaskHistory } from '../types/tasks'

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
  const [repeat, setRepeat] = React.useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isAssigned, setIsAssigned] = useState(false)

  const fetchAssignments = useCallback(async () => {
    const res = await axios.get('/api/tasks/assignments')
    setAssignments(Array.isArray(res.data) ? res.data : [])
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const handleRandomAssign = useCallback(async () => {
    // 0 이상의 유효한 멤버 ID만 필터링
    const memberIds = Object.keys(members)
      .map(Number)
      .filter((id) => id > 0)

    if (memberIds.length === 0) {
      console.error('유효한 멤버가 없습니다.')
      return
    }

    for (const tpl of templates) {
      const repeatInfo = repeatDays.filter((rd) => rd.templateId === tpl.templateId)

      // 템플릿별 반복일에 동시 배정 Promise 생성
      const assignmentPromises = Array.isArray(repeatInfo)
        ? repeatInfo.map(async (repeatDay) => {
            const randomMemberId = memberIds[Math.floor(Math.random() * memberIds.length)]
            return axios.post('/api/tasks/assignments', {
              groupId: tpl.groupId,
              groupMemberId: randomMemberId,
              templateId: tpl.templateId,
              dayOfWeek: repeatDay.dayOfWeek,
              repeatType: 'WEEKLY',
            })
          })
        : []

      await Promise.all(assignmentPromises)
    }

    // 모든 배정 완료 후 데이터 새로고침
    await fetchAssignments()
    setIsAssigned(true)
  }, [fetchAssignments, templates, repeatDays, members])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">주간 업무표</h1>
        <TaskHistoryButton onClick={() => setShowHistory(true)} />
      </div>
      <TaskTable assignments={assignments} />
      <div className="flex flex-col items-center space-y-4 mt-2">
        <div className="flex space-x-2">
          <TaskRandomButton onClick={handleRandomAssign} disabled={isAssigned} />
          <TaskExchangeButton
            onClick={() => {
              setModalOpen(true)
            }}
          />
          <ExchangeModal
            open={modalOpen}
            members={members}
            selected={selected}
            onSelect={setSelected}
            onRequest={() => {
              setModalOpen(false)
            }}
            onClose={() => setModalOpen(false)}
          />
        </div>
        <CheckRepeat checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
      </div>
      <div className="font-bold text-md mt-4 text-primary">참여 그룹원</div>
      <GroupMemberList members={members} />
      <HistoryModal open={showHistory} onClose={() => setShowHistory(false)} items={historyItems} />
    </div>
  )
}

export default TasksPage
