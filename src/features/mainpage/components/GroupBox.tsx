import { useState } from 'react'
import GroupCreateModal from './GroupCreateModal'

const GroupBox = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="w-full border border-[#2C2C2C] rounded-lg bg-white p-5 text-center">
        <p className="text-[#2C2C2C] mb-3 text-[18px]">아직 소속된 그룹이 없어요</p>
        <button
          className="btn btn-md bg-[#242424] text-white rounded-lg mt-1 px-6 text-[16px]"
          onClick={() => setOpen(true)}
        >
          그룹 생성하기
        </button>
      </div>
      {open && <GroupCreateModal onClose={() => setOpen(false)} />}
    </>
  )
}

export default GroupBox
