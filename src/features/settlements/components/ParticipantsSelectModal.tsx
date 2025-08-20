import { XCircle } from 'react-bootstrap-icons'
import settlementIcon from '../../../assets/icons/settlementIcon.svg'

interface OnCloseProps {
  onClose: () => void
}

export default function ParticipantsSelectModal({ onClose }: OnCloseProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-none max-h-none w-screen h-screen rounded-none">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-2 top-2 bg-transparent"
          aria-label="닫기"
        >
          <XCircle size={15} />
        </button>

        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <div className="h-12 px-4 flex items-center justify-center mb-3">
            <h3 className="font-bold text-xl text-center">참여자 선택</h3>
          </div>

          {/* 본문 */}
          <div className="flex flex-1 flex-col overflow-auto gap-3 p-3">
            <div className="flex gap-2 items-center">
              <input type="checkbox" className="checkbox checkbox-primary mr-2 w-4 h-4" />
              <span>전체 선택</span>
            </div>

            {/* 참여자 리스트 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input type="checkbox" className="checkbox checkbox-primary mr-2 w-4 h-4" />
                <div className="flex gap-4 items-center bg-base-200 rounded-xl shadow-sm w-full h-14 pl-3">
                  <img src={settlementIcon} alt="프로필 사진" className="w-9 h-9" />
                  <span className="text-lg font-semibold text-gray-600">최꿀꿀</span>
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" className="checkbox checkbox-primary mr-2 w-4 h-4" />
                <div className="flex gap-4 items-center rounded-xl bg-base-200 shadow-sm w-full h-14 pl-3">
                  <img src={settlementIcon} alt="프로필 사진" className="w-9 h-9" />
                  <span className="text-lg font-semibold text-gray-600">최꿀꿀</span>
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" className="checkbox checkbox-primary mr-2 w-4 h-4" />
                <div className="flex gap-4 items-center rounded-xl bg-base-200 shadow-sm w-full h-14 pl-3">
                  <img src={settlementIcon} alt="프로필 사진" className="w-9 h-9" />
                  <span className="text-lg font-semibold text-gray-600">최꿀꿀</span>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="h-16 flex justify-center items-center">
            <button
              type="button"
              className="btn bg-[oklch(44%_0.043_257.281)] text-white btn-sm w-32"
            >
              선택 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
