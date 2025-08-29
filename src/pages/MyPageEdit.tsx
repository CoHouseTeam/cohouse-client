import { ChangeEvent, useState } from 'react'
import { CameraFill, ChevronLeft, PersonCircle } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import {
  useDeleteProfileImage,
  useProfile,
  useUploadProfileImage,
} from '../libs/hooks/mypage/useProfile'
import LoadingSpinner from '../features/common/LoadingSpinner'
import ConfirmModal from '../features/common/ConfirmModal'
import ImageViewer from '../features/common/ImageViewer'

registerLocale('ko', ko)

export default function MyPageEdit() {
  const [pwOpen, setPwOpen] = useState(false)

  // 알림 컴포넌트
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

  // 생년월일
  const [selectedBtdDate, setSelectedBtdDate] = useState<Date | null>(null)

  // 프로필 미리보기
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 프로필 이미지 삭제
  const [deleteOpen, setDeleteOpen] = useState(false)

  const showAlert = (msg: string) => {
    setAlertMsg(msg)
    setAlertOpen(true)
  }

  const closeAlert = () => {
    setAlertOpen(false)
    setAlertMsg('')
  }

  // 프로필 사진
  const { data: me, isLoading } = useProfile()

  // 프로필 서버 업로드 API
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadProfileImage()
  // 프로필 이미지 삭제 API
  const { mutateAsync: deleteImage, isPending: deleting } = useDeleteProfileImage()

  const askDelete = () => {
    // 처리 중에는 열지 않기
    if (uploading || deleting) return

    // 삭제할 사진이 없으면 무시
    if (!previewUrl && !me?.profileImageUrl) return

    setDeleteOpen(true)
  }

  // 사진 파일 선택 핸들러
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    // 업로드 중이면 바로 리턴해서 동시 업로드를 막기
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
        e.currentTarget.value = '' // 같은 파일 재선택 허용
        return
      }

      // 이전 미리보기 URL 정리(있는 경우)
      if (previewUrl) URL.revokeObjectURL(previewUrl)

      // 새 미리보기 URL 생성
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // 서버 업로드
      await uploadImage(file)
    } catch (err) {
      showAlert('업로드에 실패했어요. 잠시 후 다시 시도해 주세요.')
      // 실패 시 미리보기 되돌리고 싶다면:
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } finally {
      // 같은 파일 재선택 허용
      input.value = ''
    }
  }

  const confirmDelete = async () => {
    try {
      // 서버에서 프로필 이미지 삭제
      await deleteImage()
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } catch (err) {
      showAlert('사진 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDeleteOpen(false)
    }
  }

  // 이미지 보기
  const [viewerOpen, setViewerOpen] = useState(false)
  const currentImageSrc = previewUrl ?? me?.profileImageUrl ?? null
  const openViewer = () => {
    if (!currentImageSrc) return
    if (uploading || deleting) return
    setViewerOpen(true)
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
                  // 로딩 중
                  <LoadingSpinner />
                ) : previewUrl ? (
                  <button
                    type="button"
                    onClick={openViewer}
                    className="block focus:outline-none"
                    aria-label="프로필 큰 이미지 보기"
                  >
                    <img
                      src={previewUrl}
                      alt="프로필 미리보기"
                      className="w-20 h-20 rounded-full object-cover border cursor-zoom-in hover:opacity-90 transition"
                    />
                  </button>
                ) : me?.profileImageUrl ? (
                  // 이미지가 있을 때
                  <button
                    type="button"
                    onClick={openViewer}
                    className="block focus:outline-none"
                    aria-label="프로필 큰 이미지 보기"
                  >
                    <img
                      src={me.profileImageUrl}
                      alt="프로필"
                      className="w-20 h-20 rounded-full object-cover border cursor-zoom-in hover:opacity-90 transition"
                    />
                  </button>
                ) : (
                  // 이미지가 없을 때 기본 아이콘
                  <PersonCircle size={60} />
                )}
                {/* 숨겨진 파일 인풋 */}
                <input
                  id="profileFile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
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
            {(me?.profileImageUrl || previewUrl) && (
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
                value={'홍길동'}
                className="input input-bordered bg-base-200 h-10 w-full md:max-w-md text-sm rounded-lg"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm">이메일</span>
              <input
                value={'asdfesd@gmail.com'}
                className="input input-bordered bg-base-200 h-10 md:max-w-md text-sm rounded-lg"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm ">생년월일</span>
              <DatePicker
                selected={selectedBtdDate}
                onChange={(date: Date | null) => setSelectedBtdDate(date)}
                locale="ko"
                dateFormat="yyyy년 MM월 dd일"
                // withPortal // 모바일에서 전체화면 모달로 띄우기
                popperPlacement="bottom" // 달력 위치
                showPopperArrow={false} // 화살표 숨김
                maxDate={new Date()} // 오늘 이후(미래) 선택 못 하게
                showYearDropdown
                showMonthDropdown
                dropdownMode="scroll"
                scrollableYearDropdown // ← 스크롤 가능
                yearDropdownItemNumber={85} // 보이는 연도 개수
                className="input input-bordered h-10 w-full md:max-w-md text-sm rounded-lg"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 justify-between mb-5 md:max-w-md">
              <span className="text-sm font-semibold text-neutral-500">보안</span>
              <button
                className="border border-neutral rounded-full h-fit w-fit py-1 px-2 text-sm"
                onClick={() => setPwOpen(!pwOpen)}
              >
                {pwOpen ? '변경 취소' : '비밀번호 변경'}
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ${
                pwOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm">현재 비밀번호</span>
                  <input
                    type="password"
                    className="input input-bordered h-10 md:max-w-md text-sm rounded-lg"
                    placeholder="비밀번호를 입력해 주세요"
                  />
                </div>
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
            </div>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="sticky bottom-0 bg-white px-5 pb-[env(safe-area-inset-bottom)]">
        <div className="h-16 flex items-center justify-center">
          <button type="button" className="btn bg-secondary text-white btn-sm w-32 rounded-lg">
            저장
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
