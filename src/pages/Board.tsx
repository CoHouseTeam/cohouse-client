export default function Board() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">보드</h1>
        <div className="flex gap-2">
          <button className="btn btn-accent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            새 글 작성
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed">
        <a className="tab tab-active">공지사항</a>
        <a className="tab">기념일</a>
        <a className="tab">건의사항</a>
      </div>

      {/* Announcements */}
      <div className="space-y-4">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="card-title text-accent">월간 관리비 납부 안내</h2>
                <p className="text-sm text-base-content/70">작성자: 관리자 | 작성일: 2024-01-15</p>
              </div>
              <span className="badge badge-accent">공지</span>
            </div>
            <p className="mt-3">
              2024년 1월 관리비 납부 기한이 1월 25일까지입니다. 
              늦지 않게 납부해 주시기 바랍니다.
            </p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-sm btn-ghost">상세보기</button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="card-title text-warning">엘리베이터 점검 안내</h2>
                <p className="text-sm text-base-content/70">작성자: 관리자 | 작성일: 2024-01-12</p>
              </div>
              <span className="badge badge-warning">점검</span>
            </div>
            <p className="mt-3">
              1월 20일 오전 9시부터 12시까지 엘리베이터 점검이 예정되어 있습니다. 
              이용에 불편을 드려 죄송합니다.
            </p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-sm btn-ghost">상세보기</button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="card-title text-success">분기별 입주민 회의 안내</h2>
                <p className="text-sm text-base-content/70">작성자: 관리자 | 작성일: 2024-01-10</p>
              </div>
              <span className="badge badge-success">회의</span>
            </div>
            <p className="mt-3">
              2024년 1분기 입주민 회의가 1월 30일 오후 7시에 예정되어 있습니다. 
              많은 참여 부탁드립니다.
            </p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-sm btn-ghost">상세보기</button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="join">
          <button className="join-item btn">«</button>
          <button className="join-item btn btn-active">1</button>
          <button className="join-item btn">2</button>
          <button className="join-item btn">3</button>
          <button className="join-item btn">»</button>
        </div>
      </div>
    </div>
  )
}
