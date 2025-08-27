import React from 'react'
import { RandomProps } from '../../../types/tasks'

const TaskRandomButton: React.FC<RandomProps> = ({ onClick, disabled }) => (
  <button className="btn btn-primary btn-sm rounded-lg px-6" onClick={onClick} disabled={disabled}>
    랜덤 배정하기
  </button>
)
export default TaskRandomButton
