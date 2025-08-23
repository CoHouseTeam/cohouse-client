import { useState } from 'react'
import { XCircle, Images, CaretDown } from 'react-bootstrap-icons'
import ParticipantsSelectModal from './ParticipantsSelectModal'

interface OnCloseProps {
  onClose: () => void
}

const categoryList = ['식비', '생활용품', '문화생활', '기타']
type categoryLabel = (typeof categoryList)[number]

export default function SettlementCreateModal({ onClose }: OnCloseProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<categoryLabel | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle absolute right-2 top-2 bg-transparent border-none"
            aria-label="닫기"
          >
            <XCircle size={15} />
          </button>

          <div className="flex flex-col h-full">
            {/* 헤더 */}
            <h3 className="font-bold text-xl text-center mb-3">정산 등록</h3>

            {/* 본문 */}
            <div className="flex flex-col">
              {/* 제목 */}
              <label className="form-control">
                <span className="label-text text-base mb-2 font-semibold">제목</span>
                <input
                  type="text"
                  placeholder="정산 제목을 입력해주세요."
                  className="input input-bordered text-sm rounded-xl h-10"
                />
                <span className="label-text-alt text-end mr-2 text-base-300 pt-1">0/30</span>
              </label>

              {/* 설명 */}
              <label className="form-control">
                <span className="label-text text-base mb-2 font-semibold">설명</span>
                <input
                  type="text"
                  placeholder="정산에 대한 설명을 입력해주세요."
                  className="input input-bordered text-sm rounded-xl h-10"
                />
                <span className="label-text-alt text-end mr-2 text-base-300 pt-1">0/100</span>
              </label>

              {/* 카테고리 */}
              <label className="form-control">
                <span className="label-text text-base mb-2 font-semibold">카테고리</span>

                <div className="relative w-full z-30">
                  <div
                    onClick={() => setOpen(!open)}
                    role="button"
                    className={`w-full border border-gray-300 rounded-xl px-4 py-2 bg-white overflow-hidden ${open ? 'max-h-64 absolute z-50' : 'max-h-10'}`}
                  >
                    {/* 타이틀 */}
                    <div className="flex justify-between items-center">
                      <span className={`${!selectedCategory ? 'text-gray-400' : ''} text-sm`}>
                        {selectedCategory ?? '카테고리 선택'}
                      </span>
                      <CaretDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>

                    {/* 옵션 목록 */}
                    <div
                      className={`${open ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 pt-1`}
                      role="listbox"
                    >
                      {categoryList.map((category) => (
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
              </label>

              {/* 총 정산 금액 */}
              <div className="form-control">
                <span
                  className={`${open ? 'mt-[3.25rem] pt-14' : ''} label-text text-base mt-3 mb-2 font-semibold`}
                >
                  총 정산 금액
                </span>
                <div className="flex w-full items-center gap-2 mb-2">
                  <div className="flex border border-dashed rounded-xl h-10 w-16 justify-center items-center no-spinner">
                    <Images size={27} className="text-base-300" />
                  </div>
                  <input
                    type="number"
                    placeholder="정산 금액을 입력해주세요"
                    className="input input-bordered text-sm rounded-xl flex-1 min-w-0 h-10 no-spinner"
                  />
                </div>
              </div>

              {/* 참여자 선택 */}
              <div className="form-control">
                <div className="flex items-center justify-between mt-3 mb-2">
                  <span className="label-text text-base font-semibold">참여자</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-sm border rounded-xl border-black text-xs px-2"
                  >
                    참여자 선택
                  </button>
                </div>

                <div className="flex border border-dashed h-[7rem] w-full justify-center items-center">
                  <span className="text-sm text-gray-400">참여자를 선택해주세요</span>
                </div>
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex justify-center items-center h-16">
              <button className="btn bg-[oklch(44%_0.043_257.281)] text-white btn-sm w-32 mt-4">
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <ParticipantsSelectModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}
