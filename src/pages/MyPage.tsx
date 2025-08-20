import { Cake2, Gear, PersonCircle } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'

export default function MyPage() {
  // TODO: Use user data from store when authentication is implemented
  // const { user } = useAppStore()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral">마이페이지</h1>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body relative">
            {/* 프로필 편집 버튼 */}
            <div className="flex justify-end absolute right-5 top-5">
              <button>
                <Gear />
              </button>
            </div>

            {/* 프로필 영역 */}
            <div className="flex items-center space-x-4">
              <div className="avatar placeholder">
                <div className="rounded-full w-16">
                  <PersonCircle size={60} />
                </div>
              </div>

              <div>
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

      {/* 마이페이지 리스트 목록 */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          to={'/settlements/history'}
          className="h-14 flex items-center justify-center rounded-xl border bg-base-200"
        >
          정산 히스토리
        </Link>

        <Link
          to={'/payments/history'}
          className="h-14 flex items-center justify-center rounded-xl border bg-base-200"
        >
          송금 히스토리
        </Link>

        <Link
          to={'/tasks'}
          className="h-14 flex items-center justify-center rounded-xl border bg-base-200"
        >
          할 일 내역
        </Link>

        <Link
          to={'/board'}
          className="h-14 flex items-center justify-center rounded-xl border bg-base-200"
        >
          공지사항
        </Link>
      </section>

      <section>
        <h3>계정</h3>
        <div className="card bg-base-200 border p-2">
          <div className="card-body px-3 py-1">
            <Link to={'/board'} className="py-1">
              알림 설정
            </Link>
            <button className="text-start py-1">로그아웃</button>
            <button className="text-start py-1">그룹 탈퇴</button>
            <button className="text-start py-1">회원 탈퇴</button>
          </div>
        </div>
      </section>
    </div>
  )
}
