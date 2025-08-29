import React from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { InviteModalProps } from '../../../types/main'

const GroupInviteModal: React.FC<InviteModalProps> = ({
  groupName,
  onClose,
  onAccept,
  onDecline,
}) => {
  return (
    <dialog open className="modal">
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg w-[90%] max-w-sm mx-auto px-6 py-8 shadow-lg">
          <button
            className="absolute right-3 top-3"
            onClick={onClose}
            aria-label="닫기"
            type="button"
          >
            <XCircleFill className="text-xl text-gray-400" />
          </button>

          <div className="flex flex-col items-center justify-center">
            <p className="text-[18px] font-medium mt-4 mb-8 text-center">
              {groupName} 그룹에 초대 되었습니다.
            </p>
            <div className="flex justify-center space-x-3 mt-2 w-full">
              <button
                className="btn bg-gray-200 text-black text-[16px] w-[40%] rounded-lg hover:bg-gray-300"
                onClick={onDecline}
              >
                거절
              </button>
              <button
                className="btn bg-black text-white text-[16px] w-[40%] rounded-lg hover:bg-gray-700"
                onClick={onAccept}
              >
                승인
              </button>
            </div>
          </div>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop fixed inset-0 bg-black/40"
        onClick={onClose}
      ></form>
    </dialog>
  )
}

export default GroupInviteModal
