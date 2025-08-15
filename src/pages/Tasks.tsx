import TaskTable from '../features/tasks/components/TaskTable'

const Tasks = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">주간 업무표</h1>
      <TaskTable />
    </div>
  )
}

export default Tasks
