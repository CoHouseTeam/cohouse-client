import React from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { SettingModalProps } from '../../../types/tasks'

const SettingModal: React.FC<SettingModalProps> = ({
  onSelectDay,
  onDeleteTemplate,
  onClose,
  positionClass,
}) => (
  <>
    <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
    <div
      className={`z-50 bg-white shadow-lg rounded-lg border border-gray-200 w-40 absolute ${positionClass ?? ''}`}
    >
      <button
        className="absolute right-2.5 top-2.5 z-10"
        onClick={onClose}
        aria-label="닫기"
        type="button"
      >
        <XCircleFill className="text-xl text-gray-400" />
      </button>

      <div className="flex flex-col py-4 px-4 space-y-3 mt-6">
        <button
          className="btn btn-sm btn-primary rounded-lg"
          onClick={() => {
            onSelectDay()
            onClose()
          }}
        >
          요일 선택
        </button>
        <button
          className="btn btn-sm brn-primary rounded-lg bg-white btn-outline"
          onClick={() => {
            onDeleteTemplate()
            onClose()
          }}
        >
          템플릿 삭제
        </button>
      </div>
    </div>
  </>
)

export default SettingModal
