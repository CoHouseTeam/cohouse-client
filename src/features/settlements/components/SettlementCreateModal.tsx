import { ChangeEvent, useEffect, useMemo, useState } from 'react' // [ADD useMemo]
import { XCircle, Images, CaretDown } from 'react-bootstrap-icons'
import ParticipantsSelectModal from './ParticipantsSelectModal'
import { useSettlementDetail } from '../../../libs/hooks/settlements/useMySettlements'
import { fromCategory, toCategory } from '../../../libs/utils/categoryMapping'
import LoadingSpinner from '../../common/LoadingSpinner'
import Toggle from '../../common/Toggle'
import {
  applyEvenSplit,
  computePlatformRemainder,
  fromServerList,
  UIParticipant,
} from '../utils/participants'
import {
  useCreateSettlement,
  useOcrSettlementReceipt,
  useUploadSettlementReceipt,
} from '../../../libs/hooks/settlements/useSettlementMutations'
import ConfirmModal from '../../common/ConfirmModal'
import ImageViewer from '../../common/ImageViewer'
import ErrorCard from '../../common/ErrorCard'
import { DEFAULT_PROFILE_URL } from '../../../libs/utils/profile-image'

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

const categoryList = ['식비', '생활용품', '문화생활', '기타'] // [그대로]

export default function SettlementCreateModal(props: Props) {
  const { groupId } = props
  const readOnly = props.mode === 'detail'
  const detailId = readOnly ? (props as DetailProps).detailId : undefined

  // 알림 컴포넌트
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

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
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)

  // 정산 생성(등록) API
  const { mutateAsync: createSettlement, isPending: creating } = useCreateSettlement()

  // 영수증  API
  const { mutateAsync: uploadReceipt, isPending: uploadingReceipt } = useUploadSettlementReceipt()

  // 영수증 OCR
  const { mutateAsync: ocrRecognize, isPending: ocrPending } = useOcrSettlementReceipt()

  const showAlert = (msg: string) => {
    setAlertMsg(msg)
    setAlertOpen(true)
  }

  const closeAlert = () => {
    setAlertOpen(false)
    setAlertMsg('')
  }

  // 미리보기 URL 정리하는 함수
  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    }
  }, [receiptPreview])

  // 사진 파일 선택 핸들러
  const onPickReceipt = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || readOnly) return
    setReceiptError(null)

    const f = e.target.files[0]
    // 같은 파일 다시 선택 가능하도록 초기화
    e.currentTarget.value = ''
    if (!f) return

    if (!f.type.startsWith('image/')) {
      setReceiptError('이미지 파일만 업로드할 수 있어요.')
      return
    }

    // 이전 미리보기 URL 해제
    if (receiptPreview) URL.revokeObjectURL(receiptPreview)

    // 새 미리보기 적용 (URL 한 번만 생성해서 재사용)
    const previewUrl = URL.createObjectURL(f)
    setReceiptFile(f)
    setReceiptPreview(previewUrl)

    // 중복 OCR 방지
    if (ocrPending) return

    try {
      const resp = await ocrRecognize(f)

      // 서버가 가공한 이미지 URL 내려주면 교체
      if (resp?.imageUrl) {
        URL.revokeObjectURL(previewUrl)
        setReceiptPreview(resp.imageUrl)
      }

      // 금액 자동 반영 (+ 균등 분배 자동 재계산)
      const amt = resp?.settlementAmount
      if (typeof amt === 'number' && amt > 0) {
        setAmount(amt)
        if (evenSplitOn && participants.length > 0) {
          setParticipants((prev) => applyEvenSplit(prev, amt)) // [추가] OCR 시 즉시 재분배
        }
      } else {
        setReceiptError('영수증에서 금액을 인식하지 못했어요. 직접 입력해주세요.')
      }
    } catch {
      setReceiptError('영수증 인식에 실패했어요. 직접 입력해주세요.')
    }
  }

  // 선택 취소(로컬 초기화)
  const clearReceipt = () => {
    setReceiptFile(null)
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview)
      setReceiptPreview(null)
    }
  }

  // 이미지 크게 보기
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerSrc, setViewerSrc] = useState<string>('')

  const openViewer = (src: string) => {
    setViewerSrc(src)
    setViewerOpen(true)
  }

  // 상세조회 API
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

  // 균등분배 계산 (1인 부담 금액)
  useEffect(() => {
    if (readOnly) return
    if (!evenSplitOn) return
    if (!participants.length) return
    const total = typeof amount === 'number' ? amount : Number(amount || 0)
    if (total <= 0) return
    setParticipants((prev) => applyEvenSplit(prev, total))
  }, [evenSplitOn, amount, participants.length, readOnly])

  const receiptImageSrc = receiptPreview ?? data?.imageUrl ?? null

  // 총액 숫자화
  const total = typeof amount === 'number' ? amount : Number(amount || 0)

  // 플랫폼 부담
  const platformRemainder = useMemo(
    () => (evenSplitOn ? computePlatformRemainder(participants, total) : 0),
    [evenSplitOn, participants, total]
  )

  // 수동 분배 입력 변경 핸들러
  const updateShare = (memberId: number, next: number | '') => {
    if (readOnly) return
    if (evenSplitOn) return // 균등 분배 중엔 직접 수정 불가
    setParticipants((prev) =>
      prev.map((p) =>
        p.memberId === memberId ? { ...p, shareAmount: next === '' ? 0 : Number(next) } : p
      )
    )
  }

  // 제출 전 유효성 검사 (수동 분배 시 합계 일치)
  const validateBeforeSubmit = () => {
    const total = typeof amount === 'number' ? amount : Number(amount || 0)
    if (!title.trim()) {
      showAlert('제목을 입력해주세요.')
      return false
    }
    if (total <= 0) {
      showAlert('총 정산 금액을 0원보다 크게 입력해주세요.')
      return false
    }
    if (participants.length === 0) {
      showAlert('참여자를 선택해주세요.')
      return false
    }
    if (!evenSplitOn) {
      const sum = participants.reduce((acc, p) => acc + (Number(p.shareAmount) || 0), 0)
      if (sum !== total) {
        showAlert(
          `수동 분배 총합(${sum.toLocaleString()}원)가 총 금액(${total.toLocaleString()}원)과 일치해야 해요.`
        )
        return false
      }
    }
    return true
  }

  // 정산 등록 제출
  const onSubmit = async () => {
    if (readOnly) return

    // 내용 작성 검증
    if (!validateBeforeSubmit()) return

    const total = typeof amount === 'number' ? amount : Number(amount || 0)

    try {
      // 정산 생성
      const created = await createSettlement(
        evenSplitOn
          ? {
              title: title.trim(),
              description: (desc || '').trim(),
              settlementAmount: total,
              category: toCategory(selectedCategory ?? '기타'),
              equalDistribution: true,
              participantIds: participants.map((p) => p.memberId),
            }
          : {
              title: title.trim(),
              description: (desc || '').trim(),
              settlementAmount: total,
              category: toCategory(selectedCategory ?? '기타'),
              equalDistribution: false,
              manualShares: participants.reduce<Record<number, number>>((acc, p) => {
                acc[p.memberId] = Number(p.shareAmount ?? 0)
                return acc
              }, {}),
            }
      )

      // 2) 영수증 업로드(+OCR 반영)
      if (receiptFile) {
        const resp = await uploadReceipt({
          settlementId: created.id,
          groupId,
          file: receiptFile,
          method: 'POST',
        })

        // 이미지 주소가 오면 미리보기 교체
        if (resp?.imageUrl) {
          setReceiptPreview(resp.imageUrl)
        }
      }

      // 모달 닫기
      props.onClose()
    } catch (e: unknown) {
      const error = e as { response?: { status?: number; data?: unknown }; message?: string }
      console.error(
        'Create settlement error:',
        error?.response?.status,
        error?.response?.data || error?.message
      )
      showAlert('정산 등록에 실패했어요. 다시 시도해 주세요.')
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorCard message="정산 정보를 불러오는 중 오류가 발생했습니다." />

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
                  maxLength={30}
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
                  maxLength={100}
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
                            e.stopPropagation() // 상위 onClick 토글 방지
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
                  {readOnly ? (
                    // 읽기 전용
                    <div className="relative flex border border-dashed rounded-lg overflow-hidden h-10 w-16 justify-center items-center">
                      {receiptImageSrc ? (
                        <button
                          type="button"
                          onClick={() => openViewer(receiptImageSrc)}
                          className="block focus:outline-none"
                          aria-label="영수증 크게 보기"
                          title="클릭하여 크게 보기"
                        >
                          <img
                            src={receiptImageSrc}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <Images size={22} className="text-base-300" />
                      )}
                    </div>
                  ) : (
                    // 작성/등록 모드
                    <label
                      className="relative flex border border-dashed rounded-lg h-10 w-16 justify-center items-center no-spinner"
                      title="영수증 이미지 선택"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onPickReceipt}
                        className="absolute inset-0 opacity-0 cursor-pointer rounded-lg"
                        aria-label="영수증 이미지 선택"
                      />
                      {receiptImageSrc ? (
                        <>
                          <img
                            src={receiptImageSrc}
                            alt="영수증 미리보기"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {receiptPreview && (
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
                  )}

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
                              src={
                                p.profileImageUrl && p.profileImageUrl.trim() !== ''
                                  ? p.profileImageUrl
                                  : DEFAULT_PROFILE_URL
                              }
                              onError={(e) => {
                                // 잘못된/만료된 URL이면 백엔드 기본 이미지로 교체
                                if (e.currentTarget.src !== DEFAULT_PROFILE_URL) {
                                  e.currentTarget.src = DEFAULT_PROFILE_URL
                                }
                              }}
                              alt={`${p.memberName}의 프로필`}
                              className="rounded-full w-6 h-6 object-cover"
                            />
                            <span>{p.memberName}</span>
                          </div>
                          <input
                            type="number"
                            placeholder="금액 입력"
                            value={p.shareAmount ?? ''}
                            onChange={(e) =>
                              updateShare(
                                p.memberId,
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            } // 수동 분배 입력
                            className="input input-bordered text-sm rounded-lg w-28 h-8 no-spinner mr-2"
                            disabled={readOnly || evenSplitOn} // 균등 분배 중엔 비활성화
                          />
                        </div>
                      ))}
                    </div>

                    {/* 균등 분배 오차(플랫폼 부담) 표시 */}
                    {evenSplitOn && participants.length > 0 && total > 0 && (
                      <div className="text-right text-xs text-gray-500 mt-1">
                        플랫폼 부담: {platformRemainder.toLocaleString()}원
                      </div>
                    )}
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
                <button
                  onClick={onSubmit}
                  className="font-bold bg-secondary rounded-lg text-white btn-sm w-32 mt-4"
                  disabled={creating || uploadingReceipt}
                >
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
            // 균등 분배 ON & 총액 존재 시 즉시 재분배
            if (evenSplitOn) {
              const total = typeof amount === 'number' ? amount : Number(amount || 0)
              setParticipants(total > 0 ? applyEvenSplit(list, total) : list)
            } else {
              setParticipants(list)
            }
          }}
          groupId={groupId}
        />
      )}

      <ConfirmModal
        open={alertOpen}
        title="안내"
        message={alertMsg}
        confirmText="확인"
        cancelText="취소"
        onConfirm={closeAlert}
        onCancel={closeAlert}
      />

      <ImageViewer
        open={viewerOpen}
        src={viewerSrc}
        alt="프로필 이미지"
        onClose={() => setViewerOpen(false)}
      />
    </>
  )
}
