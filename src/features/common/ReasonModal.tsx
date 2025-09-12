// src/features/common/ReasonModal.tsx
import { useEffect, useState } from 'react'

type ReasonModalProps = {
  open: boolean
  title: string
  message?: string
  placeholder?: string
  maxLength?: number
  initialValue?: string
  confirmText?: string
  cancelText?: string
  isSubmitting?: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export default function ReasonModal({
  open,
  title,
  message,
  placeholder = '사유를 입력하세요',
  maxLength = 100,
  initialValue = '',
  confirmText = '요청하기',
  cancelText = '취소',
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ReasonModalProps) {
  const [reason, setReason] = useState(initialValue)

  useEffect(() => {
    if (open) setReason(initialValue ?? '')
  }, [open, initialValue])

  if (!open) return null

  const disabled = isSubmitting || reason.trim().length === 0

  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-lg">
        <h3 className="font-bold text-lg">{title}</h3>
        {message && <p className="mt-1 text-sm text-base-content/70">{message}</p>}

        <textarea
          className="textarea textarea-bordered w-full mt-3 rounded-lg"
          rows={4}
          placeholder={placeholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={maxLength}
        />

        <div className="mt-2 text-right text-xs text-base-content/60">
          {reason.length}/{maxLength}
        </div>

        <div className="modal-action">
          <button className="btn btn-sm rounded-lg" onClick={onCancel} disabled={isSubmitting}>
            {cancelText}
          </button>
          <button
            className="btn btn-sm btn-primary rounded-lg"
            onClick={() => onConfirm(reason.trim())}
            disabled={disabled}
            aria-busy={isSubmitting}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
