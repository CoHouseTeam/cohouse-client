import React from 'react'

type Props = {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const CheckRepeat: React.FC<Props> = ({ checked, onChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input type="checkbox" className="checkbox checkbox-xs" checked={checked} onChange={onChange} />
    <span>반복하기</span>
  </label>
)
export default CheckRepeat
