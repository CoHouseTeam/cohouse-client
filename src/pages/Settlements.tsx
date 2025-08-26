import { useState } from 'react'
import { PlusCircle } from 'react-bootstrap-icons'
import SettlementCreateModal from '../features/settlements/components/SettlementCreateModal'
import OngoingSettlements from '../features/settlements/components/OngoingSettlements'
import RecentSettlements from '../features/settlements/components/RecentSettlements'

export default function Settlements() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-6 w-full md:max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-secondary">정산하기</h1>
        </div>

        <section className="card bg-base-200 shadow">
          <div className="card-body flex flex-col items-center justify-center px-3 py-4 gap-3 ">
            <p className="text-base font-semibold h-fit text-[#835e5e]">
              그룹원과 투명하게 정산해요
            </p>
            <button
              className="btn bg-secondary btn-sm mt-2 text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle />
              정산 등록
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          {/* 진행 중인 정산 */}
          <OngoingSettlements />

          {/* 정산 내역 */}
          <RecentSettlements />
        </div>
      </div>

      {isModalOpen && <SettlementCreateModal onClose={() => setIsModalOpen(false)} mode="create" />}
    </>
  )
}
