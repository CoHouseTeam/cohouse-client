import React from 'react'
import { CheckProps } from '../../../types/tasks'

const CheckRepeat: React.FC<CheckProps> = ({ checked, onChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input type="checkbox" className="checkbox checkbox-xs" checked={checked} onChange={onChange} />
    <span>반복하기</span>
  </label>
)
export default CheckRepeat
