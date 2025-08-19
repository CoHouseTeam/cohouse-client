import React from 'react'

type Props = { onClick: () => void }
const TaskRandomButton: React.FC<Props> = ({ onClick }) => (
  <button className="btn btn-primary btn-sm" onClick={onClick}>
    랜덤 배정하기
  </button>
)
export default TaskRandomButton
