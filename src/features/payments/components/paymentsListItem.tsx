// src/features/settlements/components/SettlementListItem.tsx
import { useState, useMemo, useRef } from 'react'
import { ThreeDotsVertical, ChevronCompactDown } from 'react-bootstrap-icons'
import settlementIcon from '../../../assets/icons/settlementIcon.svg'

import { formatDateTime, formatPriceKRW } from '../../../libs/utils/format'

import type { PaymentHistoryItem, Settlement, TransferStatus } from '../../../types/settlement'

import { fromCategory } from '../../../libs/utils/categoryMapping'
import { fromTransferStatus } from '../../../libs/utils/statusMapping'
import useOnClickOutside from '../../../libs/hooks/useOnClickOutside'
import SettlementCreateModal from '../../settlements/components/SettlementCreateModal'

type PaymentHistoryItemProps = {
  item: PaymentHistoryItem
  settlement?: Settlement
  groupId: number
}

// 상태별 배지 색상
const STATUS_COLOR: Record<TransferStatus, string> = {
  PENDING: '#ffd15e',
  PAID: '#757575',
  REFUNDED: '#C6ADD5',
  FAILED: '#EC221F',
  CANCELED: '#CE6B6B',
  REFUND_FAILED: '#725DE6',
}

export default function PaymentsListItem({ item, settlement, groupId }: PaymentHistoryItemProps) {
  if (!item) return null

  const [cardOpen, SetCardOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuBtnRef = useRef<HTMLButtonElement | null>(null)

  // 배지 텍스트/색
  const pill = useMemo(
    () => ({
      text: fromTransferStatus(item.status), // 'PAID' → '송금 완료'
      bg: STATUS_COLOR[item.status] ?? '#ffd15e',
    }),
    [item.status]
  )

  useOnClickOutside(menuRef, (e) => {
    if (e instanceof MouseEvent || e instanceof TouchEvent) {
      if (menuBtnRef.current?.contains(e.target as Node)) return
    }
    if (menuOpen) setMenuOpen(false)
  })

  return (
    <>
      <div
        className={`flex flex-col border-2 border-gray-100 bg-gray-50 rounded-xl pl-4 pr-1 py-3 shadow-md
                        overflow-hidden transition-[max-height] duration-500 ease-in-out 
                        ${cardOpen ? 'max-h-screen' : 'max-h-44'}`}
      >
        {/* 요약 카드 */}
        <div className="flex justify-between items-center mb-2">
          {/* 상단 */}
          <span className="text-sm">{formatDateTime(item.transferAt)}</span>
          <div className="relative ">
            <button
              ref={menuBtnRef}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
            >
              <ThreeDotsVertical size={20} />
            </button>
            <div
              role="menu"
              ref={menuRef}
              className={`flex flex-col border border-neutral-400 rounded-lg shadow-md items-center justify-center absolute right-0 w-28 h-fit bg-white p-2 ${menuOpen ? 'opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setDetailOpen(true)
                }}
                className="py-1 text-sm"
              >
                정산 상세
              </button>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <span className="border border-neutral-400 rounded-xl w-fit h-5 px-1 text-cent text-gray-500 text-xs text-center">
                {fromCategory(settlement?.category ?? 'ETC')}
              </span>
              <span className="font-bold text-base">{settlement?.title}</span>
            </div>
            <div className="flex flex-col pl-1 gap-1">
              <span className="text-sm">송금 금액: {formatPriceKRW(item.amount)}</span>
              <span
                className={`block overflow-hidden text-sm transition-[max-height, opacity] duration-500 ease-in-out ${cardOpen ? 'opacity-0' : 'opacity-100 delay-300 max-h-10'}`}
              >
                참여자 {settlement?.participants.length}명
              </span>
            </div>
          </div>

          <div
            className={`flex justify-center items-center rounded-full transition-[opacity, max-height] duration-200 ${cardOpen ? 'max-h-0 max-w-0 opacity-0 overflow-hidden' : 'h-8 w-20 opacity-100'} rounded-badge text-sm text-white font-bold mr-3`}
            style={{ backgroundColor: pill.bg }}
          >
            {pill.text}
          </div>
        </div>

        {/* 참여자 상세 */}
        <div
          className={`transition-opacity duration-500 overflow-hidden ${cardOpen ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex flex-col gap-2">
            <div className="text-sm ml-1 w-fit bg-[linear-gradient(transparent_65%,#fde68a_0)]">
              결제자: {settlement?.payerName}
            </div>
            {settlement?.participants
              .filter((p) => p.memberId !== settlement.payerId)
              .map((p) => {
                const badge =
                  p.status === 'PAID'
                    ? { text: '송금 완료', bg: '#B3B3B3' }
                    : { text: '송금 대기', bg: '#ffd15e' }

                return (
                  <div key={p.memberId} className="flex pl-1 gap-2 justify-center items-center">
                    <img src={settlementIcon} alt="프로필 사진" className="w-9 h-9" />
                    <div className="flex flex-col flex-1 justify-center text-sm">
                      <span>{p.memberName}</span>
                      <span>{formatPriceKRW(p.shareAmount)}</span>
                      {p.status === 'PAID' && <span></span>}
                    </div>
                    <div
                      className="flex justify-center items-center h-8 w-20 rounded-full text-sm text-white font-bold mr-3"
                      style={{ backgroundColor: badge.bg }}
                    >
                      {badge.text}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* 토글 버튼 */}
        <button onClick={() => SetCardOpen(!cardOpen)} className="flex items-center justify-center">
          <ChevronCompactDown
            size={15}
            className={`transition-transform ${cardOpen ? 'rotate-180' : ''} text-base-300`}
          />
        </button>
      </div>

      {detailOpen && settlement && (
        <SettlementCreateModal
          onClose={() => setDetailOpen(false)}
          mode="detail"
          detailId={settlement.id}
          groupId={groupId}
        />
      )}
    </>
  )
}
