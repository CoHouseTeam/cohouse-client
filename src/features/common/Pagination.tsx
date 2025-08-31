import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

type Props = {
  /** 현재 페이지 (0-base) */
  page: number
  /** 총 페이지 수 (최소 1) */
  totalPages: number
  /** 페이지 변경 핸들러: 0-base index */
  onChange: (next: number) => void
  /** 보여줄 번호 버튼 수 (기본 5) */
  maxNumbers?: number
}

export default function Pagination({ page, totalPages, onChange, maxNumbers = 5 }: Props) {
  const pages = useMemo(() => {
    const max = Math.max(1, totalPages)
    const count = Math.min(maxNumbers, max)
    const half = Math.floor(count / 2)

    let start = Math.max(0, page - half)
    let end = start + count - 1
    if (end > max - 1) {
      end = max - 1
      start = Math.max(0, end - count + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [page, totalPages, maxNumbers])

  const isFirst = page <= 0
  const isLast = page >= totalPages - 1

  return (
    <nav className="flex items-center justify-center gap-2 select-none" aria-label="Pagination">
      {/* Prev */}
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => !isFirst && onChange(page - 1)}
        disabled={isFirst}
        className={`px-2 py-1 rounded-md text-sm ${
          isFirst ? 'text-gray-300' : 'text-secondary hover:bg-gray-50'
        }`}
      >
        <ChevronLeft />
      </button>

      {/* Numbered */}
      {pages.map((p) => {
        const active = p === page
        return (
          <button
            key={p}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg border text-sm font-medium ${
              active
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p + 1}
          </button>
        )
      })}

      {/* Next */}
      <button
        type="button"
        aria-label="Next page"
        onClick={() => !isLast && onChange(page + 1)}
        disabled={isLast}
        className={`px-2 py-1 rounded-md  text-sm ${
          isLast ? 'text-gray-300' : 'text-secondary hover:bg-gray-50'
        }`}
      >
        <ChevronRight />
      </button>
    </nav>
  )
}
