export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">CoHouse 대시보드</h1>
        <p className="text-lg text-base-content">공동주택 관리 플랫폼에 오신 것을 환영합니다!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">할일 관리</h2>
            <p>공동 주택의 할일을 관리하고 추적하세요.</p>
            <div className="card-actions justify-end">
              <a href="/tasks" className="btn btn-primary">바로가기</a>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-secondary">정산 관리</h2>
            <p>공동 비용 정산을 효율적으로 관리하세요.</p>
            <div className="card-actions justify-end">
              <a href="/settlements" className="btn btn-secondary">바로가기</a>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-accent">보드</h2>
            <p>공지사항과 건의사항을 확인하세요.</p>
            <div className="card-actions justify-end">
              <a href="/board" className="btn btn-accent">바로가기</a>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-neutral">마이페이지</h2>
            <p>개인 정보와 설정을 관리하세요.</p>
            <div className="card-actions justify-end">
              <a href="/mypage" className="btn btn-neutral">바로가기</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
