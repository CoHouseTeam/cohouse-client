import { useState } from 'react'
import { CameraFill, ChevronLeft } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('ko', ko)

export default function MyPageEdit() {
  const [pwOpen, setPwOpen] = useState(false)

  const [selectedBtdDate, setSelectedBtdDate] = useState<Date | null>(null)

  return (
    <div className="min-h-screen flex flex-col w-full md:max-w-5xl mx-auto">
      {/* 헤더 */}
      <header className="relative h-12 flex items-center justify-center px-4">
        <Link to="/mypage" className="absolute left-4" aria-label="뒤로가기">
          <ChevronLeft size={14} />
        </Link>
        <h1 className="text-base font-bold">내 정보 수정</h1>
      </header>

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto px-5 py-5">
        {/* 1) 프로필 */}
        <div className="mx-auto w-full max-w-md">
          <section className="mb-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                <img
                  src="/avatars/default.png"
                  alt="프로필"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <button
                  type="button"
                  className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-base-300 flex justify-center items-center"
                  aria-label="프로필 이미지 변경"
                >
                  <CameraFill size={14} />
                </button>
              </div>
            </div>
          </section>

          {/* 기본 정보 */}
          <section className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm">이름</span>
              <input
                value={'홍길동'}
                className="input input-bordered bg-base-200 h-10 w-full md:max-w-md text-sm"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm">이메일</span>
              <input
                value={'asdfesd@gmail.com'}
                className="input input-bordered bg-base-200 h-10 md:max-w-md text-sm"
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
                className="input input-bordered h-10 w-full md:max-w-md text-sm"
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
                    className="input input-bordered h-10 md:max-w-md text-sm"
                    placeholder="비밀번호를 입력해 주세요"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm p-1">새 비밀번호</span>
                  <input
                    type="password"
                    className="input input-bordered h-10 md:max-w-md text-sm"
                    placeholder="새 비밀번호를 입력해 주세요"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm">새 비밀번호 확인</span>
                  <input
                    type="password"
                    className="input input-bordered h-10 md:max-w-md text-sm "
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
          <button
            type="button"
            className="btn bg-[oklch(44%_0.043_257.281)] text-white btn-sm w-32"
          >
            저장
          </button>
        </div>
      </footer>
    </div>
  )
}
