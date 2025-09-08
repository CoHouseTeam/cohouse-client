import { useState } from 'react'
import GroupCreateModal from './GroupCreateModal'
import GroupInviteInputModal from './GroupInviteInputModal'

const GroupBox = () => {
  const [openCreate, setOpenCreate] = useState(false)
  const [openInvite, setOpenInvite] = useState(false)

  return (
    <>
      <div className="w-full border border-[#2C2C2C] rounded-lg bg-white p-5 text-center">
        <p className="text-[#2C2C2C] mb-4 text-[18px]">아직 소속된 그룹이 없어요</p>
        <div className="space-y-2">
          <button
            className="btn btn-md bg-[#242424] text-white rounded-lg w-full px-6 text-[16px]"
            onClick={() => setOpenCreate(true)}
          >
            그룹 생성하기
          </button>
          <button
            className="btn btn-md btn-outline border-[#242424] text-[#242424] rounded-lg w-full px-6 text-[16px]"
            onClick={() => setOpenInvite(true)}
          >
            초대 코드로 참여하기
          </button>
        </div>
      </div>
      {openCreate && <GroupCreateModal onClose={() => setOpenCreate(false)} />}
      {openInvite && <GroupInviteInputModal onClose={() => setOpenInvite(false)} />}
    </>
  )
}

export default GroupBox
