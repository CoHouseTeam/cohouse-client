import React from 'react'
import TaskHistoryButton from '../features/tasks/components/TaskHistoryButton'
import TaskTable from '../features/tasks/components/TaskTable'
import TaskRandomButton from '../features/tasks/components/TaskRandomButton'
import TaskExchangeButton from '../features/tasks/components/TaskExchangeButton'
import CheckRepeat from '../features/tasks/components/CheckRepeat'
/* 그룹장 화면 기준 ui */
const TasksPage: React.FC = () => {
  const [repeat, setRepeat] = React.useState(true)

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">주간 업무표</h1>
        <TaskHistoryButton onClick={() => {}} />
      </div>
      <TaskTable />

      <div className="flex flex-col items-center space-y-4 mt-2">
        <div className="flex space-x-2">
          <TaskRandomButton onClick={() => {}} />
          <TaskExchangeButton onClick={() => {}} />
        </div>
        <CheckRepeat checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
      </div>
    </div>
  )
}

export default TasksPage
