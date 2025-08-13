export default function Settlements() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-secondary">정산 관리</h1>
        <button className="btn btn-secondary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          새 정산 추가
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-secondary">총 정산 금액</h2>
            <p className="text-3xl font-bold">₩1,250,000</p>
            <p className="text-sm text-base-content/70">이번 달</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-accent">미정산 건수</h2>
            <p className="text-3xl font-bold">5건</p>
            <p className="text-sm text-base-content/70">처리 대기 중</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-success">완료된 정산</h2>
            <p className="text-3xl font-bold">12건</p>
            <p className="text-sm text-base-content/70">이번 달</p>
          </div>
        </div>
      </div>

      {/* Settlement List */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">최근 정산 내역</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>항목</th>
                  <th>금액</th>
                  <th>담당자</th>
                  <th>상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2024-01-15</td>
                  <td>관리비</td>
                  <td>₩150,000</td>
                  <td>김철수</td>
                  <td><span className="badge badge-success">완료</span></td>
                  <td>
                    <button className="btn btn-sm btn-ghost">상세보기</button>
                  </td>
                </tr>
                <tr>
                  <td>2024-01-10</td>
                  <td>청소비</td>
                  <td>₩80,000</td>
                  <td>이영희</td>
                  <td><span className="badge badge-warning">진행중</span></td>
                  <td>
                    <button className="btn btn-sm btn-ghost">상세보기</button>
                  </td>
                </tr>
                <tr>
                  <td>2024-01-05</td>
                  <td>수도세</td>
                  <td>₩120,000</td>
                  <td>박민수</td>
                  <td><span className="badge badge-error">미정산</span></td>
                  <td>
                    <button className="btn btn-sm btn-ghost">상세보기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
