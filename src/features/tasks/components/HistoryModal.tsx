import React, { useState, useRef, useEffect } from 'react'
import { CaretDownFill, XCircleFill } from 'react-bootstrap-icons'
import { HistoryModalProps, TaskHistory } from '../../../types/tasks'
import { MemberAssignmentsHistories } from '../../../libs/api/tasks'

const filterOptions = [
  { label: '전체보기', value: 'all' },
  { label: '완료', value: '완료' },
  { label: '미완료', value: '미완료' },
]

const ITEMS_PER_PAGE = 7 // 한 페이지당 아이템 수

const HistoryModal: React.FC<HistoryModalProps & { groupId: number; memberId: number }> = ({
  open,
  onClose,
  groupId,
  memberId,
}) => {
  const [filter, setFilter] = useState('all')
  const [openDropdown, setOpenDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1) // 현재 페이지 번호
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<TaskHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return // 모달이 열릴 때만 요청
    setLoading(true)
    setError(null)
    MemberAssignmentsHistories({ groupId, memberId })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError('내 업무 내역을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [open, groupId, memberId])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, items])

  function getStatusLabel(status: string) {
    if (status === 'COMPLETED') return '완료'
    if (status === 'PENDING') return '미완료'
    return status
  }

  if (!open) return null

  // 필터에 따라 아이템 필터링
  const filteredItems =
    filter === 'all'
      ? items
      : items.filter(
          (i) =>
            (filter === '완료' && i.status === 'COMPLETED') ||
            (filter === '미완료' && i.status === 'PENDING')
        )

  // 페이지 계산 및 현재 페이지에 해당하는 아이템 추출
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const pagedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // 페이지 변경 핸들러
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-lg h-[90vh] px-4 py-7 overflow-y-auto flex flex-col">
        {loading && <div>로딩 중...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <>
            {/* 닫기 버튼 */}
            <button
              className="btn btn-xs btn-circle btn-ghost absolute right-4 top-4"
              onClick={onClose}
              aria-label="닫기"
            >
              <XCircleFill className="text-xl text-gray-400" />
            </button>

            <h2 className="text-center text-xl font-bold mb-5">업무 내역</h2>

            {/* 필터 드롭다운 */}
            <div className="flex justify-end mb-2 relative" ref={dropdownRef}>
              <button
                className="
              w-32 h-10 border border-gray-200 rounded-lg bg-white
              flex items-center justify-between px-4
            "
                type="button"
                onClick={() => setOpenDropdown((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={openDropdown}
              >
                {filterOptions.find((o) => o.value === filter)?.label}
                <CaretDownFill
                  className={`ml-2 transition-transform duration-200 ${openDropdown ? 'scale-y-[-1]' : ''}`}
                />
              </button>

              {openDropdown && (
                <ul
                  className="
                absolute right-0 top-full w-32
                z-10 py-1 mt-0
                bg-white border rounded-lg shadow flex flex-col
              "
                  role="listbox"
                  tabIndex={-1}
                >
                  {filterOptions.map((option) => (
                    <li key={option.value} role="option" aria-selected={filter === option.value}>
                      <button
                        type="button"
                        className={`
                      w-full px-4 py-2 text-left text-sm
                      ${filter === option.value ? 'bg-gray-100 text-black font-bold' : 'text-gray-500'} hover:bg-gray-200
                    `}
                        onClick={() => {
                          setFilter(option.value)
                          setOpenDropdown(false)
                        }}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 업무내역 리스트 */}
            <div className="flex-1 flex flex-col space-y-2 overflow-y-auto mb-4">
              {Array.isArray(pagedItems) &&
                pagedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="
                  card card-bordered bg-base-100 flex-row items-center 
                  px-4 py-2.5 border-[#DEDEDE] shadow-none rounded-lg
                "
                  >
                    <div className="font-bold mr-1.5 min-w-[100px]">{item.date}</div>
                    <div className="flex-1 text-md">{item.task}</div>
                    <span
                      className={`
    badge h-9 w-20
    py-3 ml-3 rounded-lg
    font-semibold border-none
    ${item.status === 'COMPLETED' ? 'bg-[#757575] text-white' : 'bg-gray-100 text-gray-500'}
  `}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                ))}
            </div>

            {/* 페이지네이션 컨트롤 */}
            <div className="flex justify-center space-x-2 mt-auto select-none">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                이전
              </button>

              {[...Array(totalPages).keys()].map((i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${currentPage === i + 1 ? 'btn-active' : ''}`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop !fixed !inset-0 !bg-black/40">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}

export default HistoryModal
