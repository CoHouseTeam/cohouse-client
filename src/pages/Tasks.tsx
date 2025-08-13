export default function Tasks() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">할일 관리</h1>
        <button className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          새 할일 추가
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">전체 할일</h2>
            <p className="text-3xl font-bold">15개</p>
            <p className="text-sm text-base-content/70">이번 주</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-warning">진행중</h2>
            <p className="text-3xl font-bold">8개</p>
            <p className="text-sm text-base-content/70">처리 중</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-success">완료</h2>
            <p className="text-3xl font-bold">7개</p>
            <p className="text-sm text-base-content/70">완료됨</p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-warning">진행중인 할일</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">공동 구역 청소</h3>
                  <p className="text-sm text-base-content/70">담당: 김철수 | 마감: 2024-01-20</p>
                </div>
                <span className="badge badge-warning">진행중</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">분기별 관리비 정산</h3>
                  <p className="text-sm text-base-content/70">담당: 이영희 | 마감: 2024-01-25</p>
                </div>
                <span className="badge badge-warning">진행중</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">엘리베이터 점검</h3>
                  <p className="text-sm text-base-content/70">담당: 박민수 | 마감: 2024-01-22</p>
                </div>
                <span className="badge badge-warning">진행중</span>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-success">완료된 할일</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg opacity-75">
                <input type="checkbox" className="checkbox checkbox-success" checked readOnly />
                <div className="flex-1">
                  <h3 className="font-semibold line-through">월간 안전점검</h3>
                  <p className="text-sm text-base-content/70">담당: 김철수 | 완료: 2024-01-15</p>
                </div>
                <span className="badge badge-success">완료</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg opacity-75">
                <input type="checkbox" className="checkbox checkbox-success" checked readOnly />
                <div className="flex-1">
                  <h3 className="font-semibold line-through">공동 구역 소독</h3>
                  <p className="text-sm text-base-content/70">담당: 이영희 | 완료: 2024-01-12</p>
                </div>
                <span className="badge badge-success">완료</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg opacity-75">
                <input type="checkbox" className="checkbox checkbox-success" checked readOnly />
                <div className="flex-1">
                  <h3 className="font-semibold line-through">분기별 회의</h3>
                  <p className="text-sm text-base-content/70">담당: 박민수 | 완료: 2024-01-10</p>
                </div>
                <span className="badge badge-success">완료</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
