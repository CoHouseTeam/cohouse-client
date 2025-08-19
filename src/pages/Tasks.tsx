import React, { useState } from 'react'
import TaskHistoryButton from '../features/tasks/components/TaskHistoryButton'
import TaskTable from '../features/tasks/components/TaskTable'
import TaskRandomButton from '../features/tasks/components/TaskRandomButton'
import TaskExchangeButton from '../features/tasks/components/TaskExchangeButton'
import CheckRepeat from '../features/tasks/components/CheckRepeat'
import GroupMemberList from '../features/tasks/components/GroupMemberList'
import HistoryModal, { TaskHistory } from '../features/tasks/components/HistoryModal'
/* 그룹장 화면 기준 ui */

const members = [
  { name: '그룹원1', avatarUrl: '/' },
  { name: '그룹원2', avatarUrl: '/' },
  { name: '그룹원3', avatarUrl: '/' },
]

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">주간 업무표</h1>
        <TaskHistoryButton onClick={() => setShowHistory(true)} />
      </div>
      <TaskTable />
      <div className="flex flex-col items-center space-y-4 mt-2">
        <div className="flex space-x-2">
          <TaskRandomButton onClick={() => {}} />
          <TaskExchangeButton onClick={() => {}} />
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
