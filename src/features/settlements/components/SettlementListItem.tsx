// src/features/settlements/components/SettlementListItem.tsx
import { useEffect, useRef, useState } from 'react'
import { ThreeDotsVertical, ChevronCompactDown } from 'react-bootstrap-icons'
import settlementIcon from '../../../assets/icons/settlementIcon.svg'

import { formatDateWithWeekday, formatPriceKRW } from '../../../libs/utils/format'

import type { Settlement } from '../../../types/settlement'

import {
  usePaySettlement,
  useCancelSettlement,
} from '../../../libs/hooks/settlements/useSettlementMutations'
import { fromCategory } from '../../../libs/utils/categoryMapping'
import SettlementCreateModal from './SettlementCreateModal'

type SettlementListItemProps = {
  item: Settlement
  viewerId: number
}

export default function SettlementListItem({ item, viewerId }: SettlementListItemProps) {
  if (!item) return null

  const [cardOpen, SetCardOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleDown = (e: MouseEvent) => {
      const target = e.target as Node
      const menuEl = menuRef.current
      const btnEl = menuBtnRef.current

      if (menuEl && !menuEl.contains(target) && btnEl && !btnEl.contains(target)) {
        setMenuOpen(false)
      }
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleDown)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [menuOpen])

  const payMut = usePaySettlement()
  const cancelMut = useCancelSettlement()

  const settlement = item
  const isPayer = settlement.payerId === viewerId
  const me = settlement.participants.find((p) => p.memberId === viewerId)
  const myDue = me?.shareAmount ?? 0
  const isMyPaymentDone = me?.status === 'PAID'
  const isPendingSettlement = settlement.status === 'PENDING'

  const handlePayClick = () => {
    if (isPayer) return
    if (!isPendingSettlement) return
    if (isMyPaymentDone) return
    if (payMut.isPending) return
    payMut.mutate(settlement.id)
  }

  const handleCancelClick = () => {
    if (!isPayer) return
    if (!isPendingSettlement) return
    if (cancelMut.isPending) return
    cancelMut.mutate(settlement.id)
  }

  let pill: { text: string; bg: string }
  if (settlement.status === 'COMPLETED') {
    pill = { text: '정산 완료', bg: '#B3B3B3' }
  } else if (isPayer && isPendingSettlement) {
    pill = { text: '진행 중', bg: '#ffd877' }
  } else if (settlement.status === 'CANCELED') {
    pill = { text: '정산 취소', bg: '#C6ADD5' }
  } else if (isMyPaymentDone) {
    pill = { text: '송금 완료', bg: '#B3B3B3' }
  } else {
    pill = { text: '송금하기', bg: '#d26c6c' }
  }

  return (
    <>
      <div
        className={`flex flex-col border-2 border-gray-100 bg-gray-50 rounded-xl pl-4 pr-1 py-3 shadow-md
                          overflow-hidden transition-[max-height] duration-500 ease-in-out 
                          ${cardOpen ? 'max-h-screen' : isPayer ? 'max-h-40' : 'max-h-44'}`}
      >
        {/* 요약 카드 */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">{formatDateWithWeekday(settlement.createdAt)}</span>
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
                className="py-1 text-sm"
                onClick={() => {
                  setMenuOpen(false)
                  setDetailOpen(true)
                }}
              >
                정산 상세
              </button>
              {isPendingSettlement && (
                <>
                  <div className="border-t w-full"></div>
                  <button
                    className="py-1 text-sm"
                    onClick={handleCancelClick}
                    disabled={cancelMut.isPending}
                  >
                    정산 취소
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <span className="border border-neutral-400 rounded-xl w-fit h-5 px-1 text-cent text-gray-500 text-xs text-center">
                {fromCategory(settlement.category)}
              </span>
              <span className="font-bold text-base">{settlement.title}</span>
            </div>
            <div className="flex flex-col pl-1 gap-1">
              <span className="text-sm">금액: {formatPriceKRW(settlement.settlementAmount)}</span>
              <span
                className={`block overflow-hidden text-sm transition-[max-height, opacity] duration-500 ease-in-out ${cardOpen ? 'opacity-0' : 'opacity-100 delay-300 max-h-10'}`}
              >
                참여자 {settlement.participants.length}명
              </span>
              {!isPayer && (
                <span className="text-base font-bold mb-1">
                  송금 금액 : {formatPriceKRW(myDue)}
                </span>
              )}
            </div>
          </div>

          <div
            className={`flex justify-center items-center transition-[opacity, max-height] duration-200 ${cardOpen ? 'max-h-0 max-w-0 opacity-0 overflow-hidden' : 'h-8 w-20 opacity-100'} rounded-badge text-sm text-white font-bold mr-3`}
            style={{ backgroundColor: pill.bg }}
            onClick={handlePayClick}
            aria-disabled={isPayer || isMyPaymentDone || !isPendingSettlement || payMut.isPending}
          >
            {payMut.isPending ? '처리 중…' : pill.text}
          </div>
        </div>

        {/* 참여자 상세 */}
        <div
          className={`transition-opacity duration-500 overflow-hidden ${cardOpen ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex flex-col gap-2">
            <div className="text-sm ml-1 w-fit bg-[linear-gradient(transparent_65%,#fde68a_0)]">
              결제자: {settlement.payerName}
            </div>
            {settlement.participants
              .filter((p) => p.memberId !== settlement.payerId)
              .map((p) => {
                const badge =
                  p.status === 'PAID'
                    ? { text: '송금 완료', bg: '#B3B3B3' }
                    : { text: '송금 대기', bg: '#ffd15e' }

                return (
                  <div key={p.id} className="flex pl-1 gap-2 justify-center items-center">
                    <img src={settlementIcon} alt="프로필 사진" className="w-9 h-9" />
                    <div className="flex flex-col flex-1 justify-center text-sm">
                      <span>{p.memberName}</span>
                      <span>{formatPriceKRW(p.shareAmount)}</span>
                      {p.status === 'PAID' && <span></span>}
                    </div>
                    <div
                      className="flex justify-center items-center h-8 w-20 rounded-badge text-sm text-white font-bold mr-3"
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

      {detailOpen && (
        <SettlementCreateModal
          onClose={() => setDetailOpen(false)}
          mode="detail"
          detailId={settlement.id}
        />
      )}
    </>
  )
}
