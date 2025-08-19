export default function MyPage() {
  // TODO: Use user data from store when authentication is implemented
  // const { user } = useAppStore()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral">마이페이지</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-16">
                  <span className="text-xl">김</span>
                </div>
              </div>
              <div>
                <h2 className="card-title">김철수</h2>
                <p className="text-base-content/70">101동 1001호</p>
                <p className="text-sm text-base-content/50">입주민</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-neutral">내 활동</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>완료한 할일</span>
                <span className="font-bold text-success">12개</span>
              </div>
              <div className="flex justify-between">
                <span>참여한 정산</span>
                <span className="font-bold text-secondary">8건</span>
              </div>
              <div className="flex justify-between">
                <span>작성한 글</span>
                <span className="font-bold text-accent">5개</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-neutral">설정</h2>
            <div className="space-y-2">
              <button className="btn btn-sm btn-ghost w-full justify-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                프로필 수정
              </button>
              <button className="btn btn-sm btn-ghost w-full justify-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                비밀번호 변경
              </button>
              <button className="btn btn-sm btn-ghost w-full justify-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM10 7h10V5H10v2zM10 11h10V9H10v2zM10 15h10v-2H10v2z" />
                </svg>
                알림 설정
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-neutral">최근 활동</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-base-100 rounded-lg">
              <div className="avatar placeholder">
                <div className="bg-success text-success-content rounded-full w-8">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">공동 구역 청소 완료</p>
                <p className="text-sm text-base-content/70">2024-01-15 14:30</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-base-100 rounded-lg">
              <div className="avatar placeholder">
                <div className="bg-secondary text-secondary-content rounded-full w-8">
                  <span className="text-xs">₩</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">관리비 정산 참여</p>
                <p className="text-sm text-base-content/70">2024-01-12 10:15</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-base-100 rounded-lg">
              <div className="avatar placeholder">
                <div className="bg-accent text-accent-content rounded-full w-8">
                  <span className="text-xs">📝</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">건의사항 작성</p>
                <p className="text-sm text-base-content/70">2024-01-10 16:45</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
