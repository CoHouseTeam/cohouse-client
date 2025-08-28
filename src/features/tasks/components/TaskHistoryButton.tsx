import React from 'react'

type Props = { onClick: () => void }
const TaskHistoryButton: React.FC<Props> = ({ onClick }) => (
  <button className="btn btn-outline btn-sm rounded-lg" onClick={onClick}>
    업무내역
  </button>
)
export default TaskHistoryButton
