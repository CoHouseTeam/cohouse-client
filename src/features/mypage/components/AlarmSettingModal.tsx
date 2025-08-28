import { XCircle } from 'lucide-react'
import { useState } from 'react'
import Toggle from '../../common/Toggle'
import AmPmTimePicker from './AmPmTimePicker'

interface OnCloseProps {
  onClose: () => void
}

export default function AlarmSettingModal({ onClose }: OnCloseProps) {
  const [settlementToggleOn, setSettlementToggleOn] = useState(false)
  const [taskToggleOn, setTaskToggleOn] = useState(false)
  const [boardToggleOn, setBoardToggleOn] = useState(false)

  // 전체 토글 클릭 시 자식 3개를 일괄 변경
  const allToggleOn = settlementToggleOn && taskToggleOn && boardToggleOn

  const handleAllToggleChange = (n: boolean) => {
    setSettlementToggleOn(n)
    setTaskToggleOn(n)
    setBoardToggleOn(n)
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-none max-h-none w-screen h-screen rounded-none md:w-[24rem] md:h-[30rem] md:rounded-xl mx-auto">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-2 top-2 bg-transparent border-none"
          aria-label="닫기"
        >
          <XCircle size={15} />
        </button>

        <div className="flex h-full flex-col gap-2">
          {/* 헤더 */}
          <h3 className="font-bold text-xl text-center mb-3">알림 설정</h3>

          {/* 본문 */}
          <div className="flex-1">
            {/* 전체 알림 */}
            <div className="flex items-center justify-end px-4 py-3 gap-2 overflow-auto">
              <span className="text-sm">전체 알림 설정</span>
              <Toggle checked={allToggleOn} onChange={handleAllToggleChange} />
            </div>

            {/* 개별 알림 */}
            <div className="flex flex-col gap-3">
              {/* 정산 알림 */}
              <div className="flex justify-between items-center shadow-md border border-neutral-200 px-4 py-3 rounded-lg">
                <span>정산 알림</span>
                <Toggle checked={settlementToggleOn} onChange={setSettlementToggleOn} />
              </div>
              {/* 할 일 알림 */}
              <div
                className={`shadow-md px-4 py-3 rounded-lg border border-neutral-200 transition-[height] duration-500 ease-in-out 
                            ${taskToggleOn ? 'h-40' : ''}`}
              >
                <div className="flex justify-between mb-2">
                  <span>할 일 알림</span>
                  <Toggle checked={taskToggleOn} onChange={setTaskToggleOn} />
                </div>

                {taskToggleOn && (
                  <div className="flex flex-col gap-2 pl-2 pt-4">
                    <span className="text-sm font-semibold">알림 시간 설정</span>
                    <AmPmTimePicker />
                  </div>
                )}
              </div>

              {/* 공지사항 알림 */}
              <div className="flex justify-between items-center shadow-md px-4 py-3 rounded-lg border border-neutral-200">
                <span>공지사항 알림</span>
                <Toggle checked={boardToggleOn} onChange={setBoardToggleOn} />
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="h-16 flex justify-center items-center">
            <button type="button" className="btn bg-secondary rounded-lg text-white btn-sm w-32">
              저장
            </button>
          </div>
        </div>

        {/* 푸터 */}
      </div>
    </div>
  )
}
