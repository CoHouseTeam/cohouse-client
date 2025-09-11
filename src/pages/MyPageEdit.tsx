import { ChangeEvent, useEffect, useState } from 'react'
import { CameraFill, ChevronLeft } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import {
  useDeleteProfileImage,
  useProfile,
  useUpdateProfile,
  useUploadProfileImage,
} from '../libs/hooks/mypage/useProfile'
import LoadingSpinner from '../features/common/LoadingSpinner'
import ConfirmModal from '../features/common/ConfirmModal'
import ImageViewer from '../features/common/ImageViewer'
import { formatYYYYMMDDLocal, parseLocalYYYYMMDD } from '../libs/utils/date-local'
import axios, { AxiosError } from 'axios'
import { isDefaultProfileUrl } from '../libs/utils/profile-image'
import { api, AUTH_ENDPOINTS } from '../libs/api'

registerLocale('ko', ko)

const MAX_IMAGE_BYTES = 1 * 1024 * 1024

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 ** 2).toFixed(1)} MB`
}

type ApiErrorField = { field?: string; defaultMessage?: string; message?: string }
type ApiErrorData = { message?: string; errors?: ApiErrorField[] }

export default function MyPageEdit() {
  // 알림 컴포넌트
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

  const navigate = useNavigate()
  const [lastActionSuccess, setLastActionSuccess] = useState(false)

  // 생년월일
  const [selectedBtdDate, setSelectedBtdDate] = useState<Date | null>(null)

  // 프로필 미리보기
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 저장 시 업로드/삭제 보류 상태
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingDelete, setPendingDelete] = useState(false)

  // 프로필 이미지 삭제
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [gender, setGender] = useState<'남자' | '여자' | ''>('')
  const GENDER_OPTIONS = [
    { value: '남자' as const, label: '남자' },
    { value: '여자' as const, label: '여자' },
  ]

  const showAlert = (msg: string) => {
    setAlertMsg(msg)
    setAlertOpen(true)
  }

  const closeAlert = () => {
    setAlertOpen(false)
    setAlertMsg('')

    if (lastActionSuccess) {
      setLastActionSuccess(false)
      navigate('/mypage')
    }
  }

  // 프로필 사진
  const { data: me, isLoading } = useProfile()
  const { mutateAsync: updateMe } = useUpdateProfile()

  // 프로필 기본 이미지 판별
  const serverUrl = me?.profileImageUrl ?? null
  const displayUrl = previewUrl ?? (pendingDelete ? null : serverUrl)
  const isDefault = isDefaultProfileUrl(serverUrl)

  // 기본 이미지거나 미리보기 중이면 삭제 버튼 숨김
  const canDeleteServerImage = !!serverUrl && !isDefault && !previewUrl && !pendingDelete

  // 의존성 배열 추가 + me 로드 후 초기값 주입
  useEffect(() => {
    if (!me) return
    setSelectedBtdDate(me.birthDate ? parseLocalYYYYMMDD(me.birthDate) : null)
    setGender((me.gender as '남자' | '여자') ?? '')
  }, [me])

  // 미리보기 URL 메모리 정리
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // 프로필 서버 업로드 API
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadProfileImage()
  // 프로필 이미지 삭제 API
  const { mutateAsync: deleteImage, isPending: deleting } = useDeleteProfileImage()

  //삭제 버튼
  const askDelete = () => {
    // 처리 중에는 열지 않기
    if (uploading || deleting) return

    // 삭제할 사진이 없으면 무시
    if (!previewUrl && !me?.profileImageUrl) return

    setDeleteOpen(true)
  }

  // 사진 파일 선택 핸들러
  // 미리보기만 + 예약
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (uploading) {
      e.currentTarget.value = ''
      return
    }

    const input = e.currentTarget
    const file = input.files?.[0]
    try {
      if (!file) return

      // 이미지 타입만 허용
      if (!file.type.startsWith('image/')) {
        showAlert('이미지 파일만 업로드 할 수 있어요')
        input.value = '' // 같은 파일 재선택 허용
        return
      }

      // 1MB 용량 체크 추가
      if (file.size > MAX_IMAGE_BYTES) {
        showAlert(`프로필 이미지는 1MB 이하만 가능합니다. (현재: ${formatBytes(file.size)})`)
        input.value = ''
        return
      }

      // 이전 미리보기 URL 정리(있는 경우)
      if (previewUrl) URL.revokeObjectURL(previewUrl)

      // 새 미리보기 URL 생성
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // 서버 업로드는 저장 버튼에서 → 파일만 예약
      setPendingFile(file)

      // 새 파일을 선택하면 과거의 삭제 보류는 무시
      setPendingDelete(false)
    } catch (err) {
      showAlert('미리보기에 실패했어요. 잠시 후 다시 시도해 주세요.')
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } finally {
      // 같은 파일 재선택 허용
      input.value = ''
    }
  }

  // 삭제 확인(저장 지연형 로직)
  // 미리보기 중이면: 미리보기/보류 업로드만 취소 (서버 호출 X)
  // 서버 이미지만 있으면: pendingDelete = true로 표시 (서버 호출 X, 저장 시 실제 삭제)
  const confirmDelete = async () => {
    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        setPendingFile(null) // 업로드 보류 취소
      } else if (serverUrl) {
        setPendingDelete(true) // 삭제 보류
      }
    } finally {
      setDeleteOpen(false)
    }
  }
  // 이미지 보기
  const [viewerOpen, setViewerOpen] = useState(false)
  const currentImageSrc = displayUrl ?? null
  const openViewer = () => {
    if (!currentImageSrc) return
    if (uploading || deleting) return
    setViewerOpen(true)
  }

  // 이메일 발송 버튼(비밀번호 변경)
  const onClickSendResetMail = async () => {
    if (!me?.email) {
      showAlert('이메일 정보를 불러오지 못했습니다.')
      return
    }

    try {
      await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email: me.email })
      showAlert('비밀번호 변경 이메일을 발송했습니다. 메일함을 확인해주세요.')
    } catch (e) {
      showAlert('메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  // 저장 버튼에서만 실제 업로드 실행
  // 우선순위
  // 1) pendingFile 이 있으면 → 업로드(이 경우 삭제 보류는 무시)
  // 2) pendingFile 이 없고 pendingDelete === true → 삭제
  // 3) 이미지 변경 없으면 → 프로필 정보만 업데이트 or 변경 없음 안내
  const onSave = async () => {
    try {
      if (!me) {
        setLastActionSuccess(false)
        showAlert('프로필 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      // 이미지 먼저 처리(있을 때만)
      if (pendingFile) {
        await uploadImage(pendingFile)
        setPendingFile(null)
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
          setPreviewUrl(null)
        }
        setPendingDelete(false) // 업로드가 우선이므로 삭제 보류 해제
      } else if (pendingDelete) {
        await deleteImage()
        setPendingDelete(false)
      }

      const nextBirth = selectedBtdDate
        ? formatYYYYMMDDLocal(selectedBtdDate) // "YYYY-MM-DD"
        : (me.birthDate ?? '')

      if (!nextBirth) {
        setLastActionSuccess(false)
        showAlert('생년월일을 선택해 주세요.')
        return
      }

      const nextGender = (gender || me.gender || '').toString().trim()

      if (nextGender !== '남자' && nextGender !== '여자') {
        setLastActionSuccess(false)
        showAlert('성별을 선택해 주세요.')
        return
      }

      // 변경 여부 판단
      const imageChanged = !!pendingFile || pendingDelete
      const profileChanged = nextBirth !== me.birthDate || nextGender !== me.gender

      if (!imageChanged && !profileChanged) {
        setLastActionSuccess(false)
        showAlert('변경된 내용이 없습니다.')
        return
      }

      if (profileChanged) {
        await updateMe({ birthDate: nextBirth, gender: nextGender })
      }

      setLastActionSuccess(true)
      showAlert('저장되었습니다.')
    } catch (e: unknown) {
      setLastActionSuccess(false)
      if (axios.isAxiosError(e)) {
        const d = (e as AxiosError<ApiErrorData>).response?.data
        const fieldMsg = d?.errors
          ?.map((er) => `${er.field ?? ''}: ${er.defaultMessage ?? er.message ?? ''}`)
          .join('\n')
        showAlert(fieldMsg || d?.message || '요청 중 오류가 발생했어요.')
      } else {
        showAlert('알 수 없는 오류가 발생했어요.')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col w-full md:max-w-5xl mx-auto">
      {/* 헤더 */}
      <header className="relative h-12 flex items-center justify-center px-4">
        <Link to="/mypage" className="absolute left-4" aria-label="뒤로가기">
          <ChevronLeft size={14} />
        </Link>
        <h1 className="text-lg font-bold">내 정보 수정</h1>
      </header>

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto px-5 py-5">
        {/* 1) 프로필 */}
        <div className="mx-auto w-full max-w-md">
          <section className="mb-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <button
                    type="button"
                    onClick={openViewer}
                    className="block focus:outline-none"
                    aria-label="프로필 큰 이미지 보기"
                  >
                    <img
                      src={displayUrl ?? ''}
                      alt="프로필"
                      className="w-20 h-20 rounded-full object-cover border cursor-zoom-in hover:opacity-90 transition"
                    />
                  </button>
                )}
                {/* 숨겨진 파일 인풋 */}
                <input
                  id="profileFile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange} //업로드 호출 안 함
                />

                <label
                  htmlFor="profileFile"
                  className="absolute -right-3 -bottom-1 w-8 h-8 rounded-full bg-base-300 flex justify-center items-center cursor-pointer"
                  aria-label="프로필 이미지 변경"
                >
                  <CameraFill size={14} />
                </label>

                {/* 업로드/삭제 중 오버레이 */}
                {(uploading || deleting) && (
                  <div className="absolute inset-0 rounded-full bg-black/35 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="loading loading-spinner loading-xs text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* 사진 삭제 버튼 (이미지/미리보기 있을 때만 노출) */}
            {(canDeleteServerImage || previewUrl || pendingDelete) && (
              <div className="flex justify-center mt-3">
                <button
                  type="button"
                  className="text-xs border border-gray-400 p-1 rounded-lg text-gray-400 disabled:no-underline disabled:opacity-50"
                  onClick={askDelete}
                  disabled={uploading || deleting}
                  title={deleting ? '삭제 중…' : '프로필 사진 삭제'}
                >
                  {deleting ? '삭제 중…' : '프로필 사진 삭제'}
                </button>
              </div>
            )}
          </section>

          {/* 기본 정보 */}
          <section className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm">이름</span>
              <input
                value={me?.name}
                className="input input-bordered bg-base-200 h-10 w-full md:max-w-md text-sm rounded-lg"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm">이메일</span>
              <input
                value={me?.email}
                className="input input-bordered bg-base-200 h-10 md:max-w-md text-sm rounded-lg"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm">성별</span>

              <div className="flex items-center gap-6">
                {GENDER_OPTIONS.map((opt) => (
                  <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      className="radio"
                      value={opt.value}
                      checked={gender === opt.value}
                      onChange={() => setGender(opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm ">생년월일</span>
              <DatePicker
                selected={selectedBtdDate}
                onChange={(date: Date | null) => setSelectedBtdDate(date)}
                locale="ko"
                dateFormat="yyyy년 MM월 dd일"
                // withPortal
                popperPlacement="bottom"
                showPopperArrow={false}
                maxDate={new Date()}
                showYearDropdown
                showMonthDropdown
                dropdownMode="scroll"
                scrollableYearDropdown
                yearDropdownItemNumber={85}
                className="input input-bordered h-10 w-full md:max-w-md text-sm rounded-lg"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 justify-between mb-5 md:max-w-md">
              <span className="text-sm font-semibold text-neutral-500">보안</span>
              <button
                className="border border-neutral rounded-full h-fit w-fit py-1 px-2 text-sm"
                onClick={onClickSendResetMail}
              >
                비밀번호 변경
              </button>
            </div>

            {/* <div
              className={`overflow-hidden transition-all duration-500 ${
                pwOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm p-1">새 비밀번호</span>
                  <input
                    type="password"
                    className="input input-bordered h-10 md:max-w-md text-sm rounded-lg"
                    placeholder="새 비밀번호를 입력해 주세요"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm">새 비밀번호 확인</span>
                  <input
                    type="password"
                    className="input input-bordered h-10 md:max-w-md text-sm rounded-lg"
                    placeholder="새 비밀번호를 다시 입력해 주세요"
                  />
                </div>
              </div>
            </div> */}
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="sticky bottom-0 bg-white px-5 pb-[env(safe-area-inset-bottom)]">
        <div className="h-16 flex items-center justify-center">
          <button
            type="button"
            className="btn bg-secondary text-white btn-sm w-32 rounded-lg"
            onClick={onSave} // 저장에서만 업로드 실행
            disabled={isLoading || uploading || deleting} // 진행 중 비활성화
          >
            {uploading || deleting ? '저장 중…' : '저장'}
          </button>
        </div>
      </footer>

      <ConfirmModal
        open={alertOpen}
        title="안내"
        message={alertMsg}
        confirmText="확인"
        cancelText="취소"
        onConfirm={closeAlert}
        onCancel={closeAlert}
      />

      <ConfirmModal
        open={deleteOpen}
        title="프로필 사진 삭제"
        message="프로필 사진을 삭제할까요?"
        confirmText={deleting ? '삭제 중…' : '삭제'}
        cancelText="취소"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ImageViewer
        open={viewerOpen && !!currentImageSrc}
        src={currentImageSrc ?? ''}
        alt="프로필 이미지"
        onClose={() => setViewerOpen(false)}
      />
    </div>
  )
}
