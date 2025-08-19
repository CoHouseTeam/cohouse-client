import SettlementListItem from './SettlementListItem'

export default function OngoingSettlements() {
  return (
    // 데이터가 없을 경우 UI
    // <section className="card border-2 border-dashed bg-base-200 shadow-sm">
    //   <div className="card-body p-4">
    //     <div className="flex justify-between items-center">
    //       <h2 className="card-title text-xl text-[oklch(44%_0.043_257.281)]">진행 중인 정산</h2>
    //       <button>
    //         <ThreeDotsVertical size={20} />
    //       </button>
    //     </div>
    //     <div className="flex flex-col justify-center text-center mt-4">
    //       <img
    //         src={'/src/assets/icons/settlementIcon.svg'}
    //         alt="empty icon"
    //         className="h-10 w-10 mx-auto"
    //       />
    //       <p className="text-sm font-medium text-neutral-400 text-center p-3">
    //         진행 중인 정산이 없어요
    //       </p>
    //     </div>
    //   </div>
    // </section>

    // 데이터가 있을 경우 UI
    <section className="card">
      <div className="card-body p-4 bg-base-200 shadow rounded-xl">
        <div className="flex justify-between items-center">
          <h2 className="card-title text-xl text-[oklch(44%_0.043_257.281)]">진행 중인 정산</h2>
        </div>
        <SettlementListItem />
      </div>
    </section>
  )
}
