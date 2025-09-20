import React from 'react'
import { CheckProps } from '../../../types/tasks'
import { useTaskStore } from '../../../app/tasksStore'

const CheckRepeat: React.FC<CheckProps> = () => {
  const repeat = useTaskStore((state) => state.repeat)
  const setRepeat = useTaskStore((state) => state.setRepeat)
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className="checkbox checkbox-xs"
        checked={repeat}
        onChange={(e) => setRepeat(e.target.checked)}
      />
      <span>랜덤 배정 반복</span>
    </label>
  )
}

export default CheckRepeat
