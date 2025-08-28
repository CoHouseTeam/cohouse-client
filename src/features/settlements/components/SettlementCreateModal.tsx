import { ChangeEventHandler, useEffect, useState } from 'react'
import { XCircle, Images, CaretDown } from 'react-bootstrap-icons'
import ParticipantsSelectModal from './ParticipantsSelectModal'
import { useSettlementDetail } from '../../../libs/hooks/settlements/useMySettlements'
import { fromCategory } from '../../../libs/utils/categoryMapping'
import LoadingSpinner from '../../common/LoadingSpinner'
import Toggle from '../../common/Toggle'
import ErrorCard from '../../common/ErrorCard'
import { applyEvenSplit, fromServerList, UIParticipant } from '../utils/participants'

type CreateProps = {
  mode?: 'create'
  onClose: () => void
  groupId: number
}

type DetailProps = {
  mode: 'detail'
  detailId: number
  onClose: () => void
  groupId: number
}

type Props = CreateProps | DetailProps

const categoryList = ['식비', '생활용품', '문화생활', '기타']

export default function SettlementCreateModal(props: Props) {
  const { groupId } = props
  const readOnly = props.mode === 'detail'
  const detailId = readOnly ? (props as DetailProps).detailId : undefined

  // 글자수 카운트
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState<number | ''>('')

  const [participants, setParticipants] = useState<UIParticipant[]>([])

  // 카테고리
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 참여자 선택 모달
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 균등 분배 on/off
  const [evenSplitOn, setEvenSplitOn] = useState(false)

  /*{ 영수증 사진 업로드 }*/
  // 영수증 사진 보관
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  // 사진 미리보기
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  // 이미지 아닌 파일 선택 시 에러메시지
  const [receiptError, setReceiptError] = useState<string | null>(null)

  // 미리보기 URL 정리하는 함수
  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    }
  }, [receiptPreview])

  // 사진 파일 선택 핸들러
  const onPickReceipt: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || readOnly) return
    setReceiptError(null)

    const f = e.target.files[0]
    if (!f) return

    if (!f.type.startsWith('image/')) {
      setReceiptError('이미지 파일만 업로드할 수 있어요.')
      e.currentTarget.value = ''
      return
    }

    // 기존 미리보기 URL 해제 후 교체
    if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    setReceiptFile(f)
    setReceiptPreview(URL.createObjectURL(f))

    // 같은 파일 다시 선택 가능하도록 초기화
    e.currentTarget.value = ''
  }

  // 선택 취소(로컬 초기화)
  const clearReceipt = () => {
    setReceiptFile(null)
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview)
      setReceiptPreview(null)
    }
  }

  const { data, isLoading, error } = useSettlementDetail(detailId)

  // 상세조회 화면 데이터 매핑
  useEffect(() => {
    if (!data) return
    setTitle(data.title ?? '')
    setDesc(data.description ?? '')
    setAmount(data.settlementAmount ?? '')
    setSelectedCategory(fromCategory(data.category))
    setEvenSplitOn(!!data.equalDistribution)
    setParticipants(fromServerList(data.participants))
  }, [data])

  // 균등분배 재계산
  useEffect(() => {
    if (readOnly) return
    if (!evenSplitOn) return
    if (!participants.length) return
    const total = typeof amount === 'number' ? amount : Number(amount || 0)
    if (total <= 0) return
    setParticipants((prev) => applyEvenSplit(prev, total))
  }, [evenSplitOn, amount, participants.length, readOnly])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorCard />
  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-h-[90vh] overflow-y-auto rounded-lg">
          <button
            onClick={props.onClose}
            className="absolute right-2 top-2 bg-transparent border-none mt-2 mr-2"
            aria-label="닫기"
          >
            <XCircle size={15} />
          </button>

          <div className="flex flex-col h-full">
            {/* 헤더 */}
            <h3 className="font-bold text-xl text-center mb-3">
              {readOnly ? '정산 상세' : '정산 등록'}
            </h3>

            {/* 본문 */}
            <div className="flex flex-col">
              {/* 제목 */}
              <label className="form-control">
                <span className="label-text text-base mb-2 font-semibold">제목</span>
                <input
                  type="text"
                  placeholder="정산 제목을 입력해주세요."
                  className="input input-bordered text-sm rounded-lg h-10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={readOnly}
                />
                <span className="label-text-alt text-end mr-2 text-gray-400 pt-1">
                  {title.length}/30
                </span>
              </label>

              {/* 설명 */}
              <label className="form-control">
                <span className="label-text text-base mb-2 font-semibold">설명</span>
                <input
                  type="text"
                  placeholder="정산에 대한 설명을 입력해주세요."
                  className="input input-bordered text-sm rounded-lg h-10"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  disabled={readOnly}
                />
                <span className="label-text-alt text-end mr-2 text-gray-400 pt-1">
                  {desc.length}/100
                </span>
              </label>

              {/* 카테고리 */}
              <label className="form-control">
                <span className="label-text text-base mb-2 font-semibold">카테고리</span>

                <div className="relative w-full z-30">
                  <div
                    onClick={() => !readOnly && setOpen(!open)}
                    role="button"
                    className={`w-full border border-gray-300 rounded-lg px-4 py-2 bg-white ${
                      open
                        ? 'max-h-64 absolute z-[1000] overflow-visible'
                        : 'max-h-10 overflow-hidden'
                    }`}
                  >
                    {/* 타이틀 */}
                    <div className="flex justify-between items-center">
                      <span className={`${!selectedCategory ? 'text-gray-400' : ''} text-sm `}>
                        {selectedCategory ?? '카테고리 선택'}
                      </span>
                      <CaretDown
                        className={`transition-transform ${open ? 'rotate-180' : ''} text-gray-400`}
                      />
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
                            e.stopPropagation() // 상위 onClick 토글 방지\
                            if (readOnly) return
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
                  className={`${open ? 'mt-[2rem] pt-5' : ''} label-text text-base mt-3 mb-2 font-semibold`}
                >
                  총 정산 금액
                </span>
                <div className="flex w-full items-center gap-2 mb-2">
                  <label
                    className="relative flex border border-dashed rounded-lg h-10 w-16 justify-center items-center no-spinner"
                    title={readOnly ? '' : '영수증 이미지 선택'}
                  >
                    {!readOnly && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onPickReceipt}
                        className="absolute inset-0 opacity-0 cursor-pointer rounded-lg"
                        aria-label="영수증 이미지 선택"
                      />
                    )}
                    {receiptPreview ? (
                      <>
                        <img
                          src={receiptPreview}
                          alt="영수증 미리보기"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              clearReceipt()
                            }}
                            className="absolute -top-2 -right-2 btn btn-xs rounded-full"
                            aria-label="영수증 선택 취소"
                          >
                            ✕
                          </button>
                        )}
                      </>
                    ) : (
                      <Images size={22} className="text-base-300" />
                    )}
                  </label>

                  <input
                    type="number"
                    placeholder="정산 금액을 입력해주세요"
                    className="input input-bordered text-sm rounded-lg flex-1 min-w-0 h-10 no-spinner"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={readOnly}
                  />
                </div>
                {receiptError && <span className="text-xs text-error">{receiptError}</span>}
              </div>

              {/* 참여자 선택 */}
              <div className="form-control">
                <div className="flex items-center justify-between mt-3 mb-2">
                  <span className="label-text text-base font-semibold">참여자</span>
                  {!readOnly && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="border rounded-lg border-black text-xs px-2 h-6"
                    >
                      참여자 선택
                    </button>
                  )}
                </div>

                {participants.length > 0 ? (
                  <>
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span>균등 분배</span>
                      <Toggle
                        checked={evenSplitOn}
                        onChange={(v) => {
                          if (readOnly) return
                          setEvenSplitOn(v)
                        }}
                        disabled={readOnly}
                      />
                    </div>
                    <div
                      className={`border rounded-xl p-3 flex flex-col gap-2 ${readOnly ? 'bg-white' : ''}`}
                    >
                      {participants.map((p) => (
                        <div
                          key={p.memberId}
                          className="text-sm flex items-center justify-between gap-6"
                        >
                          <div className="flex items-center gap-3 ml-2">
                            <img
                              src={p.avatar ?? '/placeholder-avatar.png'}
                              alt="avatar"
                              className="rounded-full w-6 h-6"
                            />
                            <span>{p.memberName}</span>
                          </div>
                          <input
                            type="number"
                            placeholder="금액 입력"
                            value={p.shareAmount ?? ''}
                            className="input input-bordered text-sm rounded-lg w-28 h-8 no-spinner mr-2"
                            disabled={readOnly}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex border border-dashed h-[7rem] w-full justify-center items-center rounded-lg">
                    <span className="text-sm text-gray-400">참여자를 선택해주세요</span>
                  </div>
                )}
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex justify-center items-center h-16">
              {readOnly ? (
                <button
                  className="font-bold bg-secondary rounded-lg text-white btn-sm w-32 mt-4"
                  onClick={props.onClose}
                >
                  닫기
                </button>
              ) : (
                <button className="font-bold bg-secondary rounded-lg text-white btn-sm w-32 mt-4">
                  등록
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {!readOnly && isModalOpen && (
        <ParticipantsSelectModal
          onClose={() => setIsModalOpen(false)}
          onSelect={(list) => {
            setParticipants(list)
          }}
          groupId={groupId}
        />
      )}
    </>
  )
}
