import { XCircle } from 'lucide-react'
import { ReactNode } from 'react'

type ConfirmModalProps = {
  open: boolean
  title?: string
  message?: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title = '확인',
  message = '이 작업을 진행하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-lg max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onCancel}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="py-2 text-base-content/80">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <div className="modal-action flex items-center justify-center gap-3">
          <button className="btn btn-sm rounded-lg w-24" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className="btn btn-sm rounded-lg bg-secondary text-white w-24"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel}></div>
    </div>
  )
}
