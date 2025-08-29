import { useEffect } from 'react'
import { X } from 'lucide-react'

type ImageViewerProps = {
  open: boolean
  src: string // blob: 또는 https: 이미지 URL
  alt?: string
  onClose: () => void
  downloadable?: boolean
  downloadName?: string
}

export default function ImageViewer({
  open,
  src,
  alt = '이미지 미리보기',
  onClose,
}: ImageViewerProps) {
  if (!open) return null

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // 바깥 클릭으로 닫기
    >
      <div
        className="relative max-w-[95vw] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()} // 이미지 클릭은 닫히지 않게
      >
        {/* 상단 액션 */}
        <div className="absolute -top-12 right-0 flex items-center gap-2 text-white">
          <button className="btn btn-sm btn-ghost" onClick={onClose} aria-label="닫기" title="닫기">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 이미지 */}
        <img
          src={src}
          alt={alt}
          className="max-w-[95vw] max-h-[92vh] object-contain rounded-xl shadow-2xl select-none"
          draggable={false}
        />
      </div>
    </div>
  )
}
