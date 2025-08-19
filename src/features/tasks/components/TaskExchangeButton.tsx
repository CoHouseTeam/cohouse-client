import React from 'react'

type Props = { onClick: () => void }
const TaskExchangeButton: React.FC<Props> = ({ onClick }) => (
  <button className="btn btn-secondary btn-sm" onClick={onClick}>
    업무 교환 요청
  </button>
)
export default TaskExchangeButton
