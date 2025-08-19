import { Link } from 'react-router-dom'
import SettlementListItem from './SettlementListItem'

export default function RecentSettlements() {
  return (
    // 데이터가 없을 경우
    // <section className="card border-2 border-dashed bg-base-200 shadow-sm">
    //   <div className="card-body p-4">
    //     <div className="flex items-baseline gap-1 text-center">
    //       <h2 className="card-title text-success">정산 내역</h2>
    //       <span className="text-[0.7rem] text-neutral-400">(최근 내역 2개)</span>
    //     </div>

    //     <div className="flex flex-col justify-center text-center mt-4">
    //       <img
    //         src="/src/assets/icons/settlementIcon.svg"
    //         alt="empty icon"
    //         className="h-10 w-10 mx-auto"
    //       />
    //       <p className="text-sm font-medium text-neutral-400 text-center p-3">정산 내역이 없어요</p>
    //     </div>
    //   </div>
    // </section>

    // 데이터가 있을 경우
    <section className="card">
      <div className="card-body p-4 bg-base-200 shadow rounded-xl">
        <div className="flex items-baseline gap-1 text-center">
          <h2 className="card-title text-success">정산 내역</h2>
          <div className="flex flex-1 justify-between">
            <span className="text-[0.7rem] text-neutral-400">(최근 내역 2개)</span>
            <Link to="/settlements/history" className="text-[0.7rem] pr-1 text-neutral-400">
              전체보기
            </Link>
          </div>
        </div>

        {/* 리스트 */}
        <SettlementListItem />
      </div>
    </section>
  )
}
