import { useState } from 'react'
import { Cake2, Gear, PersonCircle } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import AlarmSettingModal from '../features/mypage/components/AlarmSettingModal'

export default function MyPage() {
  const [alarmSettingModalOpen, setAlarmSettingModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-6 w-full md:max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral">마이페이지</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Profile Card */}
          <section>
            <div className="card bg-base-200 shadow-md md:h-40">
              <div className="card-body relative flex justify-center px-10">
                {/* 프로필 편집 버튼 */}
                <div className="flex justify-end absolute right-5 top-5">
                  <Link to={'/mypage/edit'}>
                    <Gear />
                  </Link>
                </div>

                {/* 프로필 영역 */}
                <div className="flex items-center gap-6">
                  <div className="pl-2">
                    <Link to={'/'} className="rounded-full w-16">
                      <PersonCircle size={60} />
                    </Link>
                  </div>

                  <div className="flex flex-col">
                    <h2 className="card-title">김철수</h2>
                    <p className="text-base-content/70">101동 1001호</p>
                    <div className="flex text-sm text-base-content items-center gap-2">
                      <Cake2 />
                      <p>2000.00.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            {/* 마이페이지 리스트 목록 */}
            <section className="grid grid-cols-2 gap-3">
              {[
                { to: '/settlements/history', label: '정산 히스토리' },
                { to: '/payments/history', label: '송금 히스토리' },
                { to: '/tasks', label: '할 일 내역' },
                { to: '/board', label: '공지사항' },
              ].map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="h-14 md:h-24 flex items-center justify-center rounded-xl border bg-base-200 hover:bg-base-300 transition"
                >
                  {label}
                </Link>
              ))}
            </section>

            {/* 설정 & 로그아웃 */}
            <section>
              <div className="card bg-base-200 border p-2 md:p-0">
                <div className="card-body px-3 py-1 md:py-4">
                  <button
                    onClick={() => setAlarmSettingModalOpen(true)}
                    className="text-start py-1 md:pb-2 md:px-5 hover:bg-base-300 transition rounded-xl"
                  >
                    알림 설정
                  </button>

                  <button className="text-start py-1 md:pb-2 md:px-5 hover:bg-base-300 transition rounded-xl">
                    로그아웃
                  </button>
                  <button className="text-start py-1 md:pb-2 md:px-5 hover:bg-base-300 transition rounded-xl">
                    그룹 탈퇴
                  </button>
                  <button className="text-start py-1 md:pb-2 md:px-5 hover:bg-base-300 transition rounded-xl">
                    회원 탈퇴
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      {alarmSettingModalOpen && (
        <AlarmSettingModal onClose={() => setAlarmSettingModalOpen(false)} />
      )}
    </>
  )
}
