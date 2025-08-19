import { useState } from 'react'
import { Search, CaretDown } from 'react-bootstrap-icons'
import SettlementListItem from '../features/settlements/components/SettlementListItem'

const CATEGORY_LIST = ['전체', '송금 완료', '송금 실패', '송금 취소'] as const
type Category = (typeof CATEGORY_LIST)[number]

export default function SettlementHistory() {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <h1 className="text-2xl font-bold text-black">송금 히스토리</h1>

        {/* 검색 및 카테고리 필터 영역 */}
        <div className="flex gap-2 mt-2">
          {/* 검색 */}
          <label className="input input-bordered flex items-center gap-2 rounded-xl h-10 flex-1 min-w-0">
            <Search size={16} className="shrink-0" />
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              className="w-full min-w-0 text-sm"
            />
          </label>

          {/* 카테고리 */}
          <div className="relative flex-none w-32 sm:w-40 z-30 md:max-w-56">
            <div
              onClick={() => setOpen(!open)}
              role="button"
              className={`w-full border border-gray-300 rounded-xl px-4 py-2 bg-white overflow-hidden ${open ? 'max-h-64 absolute z-50' : 'max-h-10'}`}
            >
              {/* 타이틀 */}
              <div className="flex justify-between items-center">
                <span className={`${!selectedCategory ? 'text-gray-400' : ''} text-sm`}>
                  {selectedCategory ?? '전체'}
                </span>
                <CaretDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </div>

              {/* 옵션 목록 */}
              <div
                className={`${open ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 pt-1`}
                role="listbox"
              >
                {CATEGORY_LIST.map((category) => (
                  <div
                    key={category}
                    role="option"
                    aria-selected={selectedCategory === category}
                    onClick={(e) => {
                      e.stopPropagation() // 상위 onClick 토글 방지
                      setSelectedCategory(category)
                      setOpen(false)
                    }}
                    className="py-2 hover:bg-gray-100 text-sm cursor-pointer rounded-lg"
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start md:gap-6">
        <SettlementListItem />
      </div>
    </div>
  )
}
