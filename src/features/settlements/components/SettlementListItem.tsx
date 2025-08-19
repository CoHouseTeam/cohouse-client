import { useState } from 'react'
import { ThreeDotsVertical, ChevronCompactDown } from 'react-bootstrap-icons'
import settlementIcon from '../../../assets/icons/settlementIcon.svg'

export default function SettlementListItem() {
  const [cardOpen, SetCardOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const currentUserId = 1 // 로그인 유저 가정
  const settlement = {
    id: 10,
    category: '식비',
    title: '배달비',
    description: '저녁 식사 비용',
    totalAmount: 60000,
    status: 'PENDING',
    imageUrl: null,
    payerId: 1,
    payerName: '홍길동',
    participants: [
      {
        id: 100,
        memberId: 2,
        memberName: '김철수',
        shareAmount: 20000,
        status: 'PENDING',
        paidAt: null,
      },
      {
        id: 101,
        memberId: 3,
        memberName: '신짱구',
        shareAmount: 20000,
        status: 'PAID',
        paidAt: null,
      },
    ],
    createdAt: '2025-08-05T14:45:00',
    updatedAt: '2025-08-05T14:45:00',
  }

  const isPayer = settlement.payerId === currentUserId
  const me = settlement.participants.find((p) => p.memberId === currentUserId)
  const myDue = me?.shareAmount ?? 0

  const pill = isPayer
    ? { text: '진행 중', bg: '#ffd877' } // 결제자
    : { text: '송금하기', bg: '#d26c6c' } // 참여자

  return (
    <div
      className={`flex flex-col border-2 border-gray-100 bg-gray-50 rounded-xl pl-4 pr-1 py-3 shadow-md
                        overflow-hidden transition-[max-height] duration-500 ease-in-out 
                        ${cardOpen ? 'max-h-screen' : isPayer ? 'max-h-40' : 'max-h-44'}`}
    >
      {/* 요약 카드 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm">{settlement.createdAt}</span>
        <div className="relative ">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
          >
            <ThreeDotsVertical size={20} />
          </button>
          <div
            role="menu"
            className={`flex flex-col border border-neutral-400 rounded-lg shadow-md items-center justify-center absolute right-0 w-28 h-fit bg-white p-2 ${menuOpen ? 'opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <button className="py-1 text-sm">정산 상세</button>
            <div className="border-t w-full"></div>
            <button className="py-1 text-sm">정산 취소</button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <span className="border border-neutral-400 rounded-xl w-fit h-5 px-1 text-cent text-gray-500 text-xs text-center">
              {settlement.category}
            </span>
            <span className="font-bold text-base">{settlement.title}</span>
          </div>
          <div className="flex flex-col pl-1 gap-1">
            <span className="text-sm">금액: {settlement.totalAmount.toLocaleString()}원</span>
            <span
              className={`block overflow-hidden text-sm transition-[max-height, opacity] duration-500 ease-in-out ${cardOpen ? 'opacity-0 max-h-0' : 'opacity-100 delay-300 max-h-10'}`}
            >
              참여자 {settlement.participants.length + 1}명
            </span>
            {!isPayer && (
              <span className="text-base font-bold mb-1">
                송금할 금액 : {myDue.toLocaleString()}원
              </span>
            )}
          </div>
        </div>
        <div
          className={`flex justify-center items-center transition-[opacity, max-height] duration-200 ${cardOpen ? 'max-h-0 max-w-0 opacity-0 overflow-hidden' : 'h-8 w-20 opacity-100'} rounded-badge text-sm text-white font-bold mr-3`}
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
            결제자: {settlement.payerName}
          </div>
          {/* 참여자 상세 */}
          {settlement.participants.map((p) => {
            const badge =
              p.status === 'PAID'
                ? { text: '송금 완료', bg: '#B3B3B3' }
                : { text: '송금 대기', bg: '#ffd15e' }

            return (
              <div className="flex pl-1 gap-2 justify-center items-center">
                <img src={settlementIcon} alt="프로필 사진" className="w-9 h-9" />
                <div className="flex flex-col flex-1 justify-center text-sm">
                  <span>{p.memberName}</span>
                  <div className="flex">
                    <span>{p.shareAmount.toLocaleString()}원</span>
                  </div>
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
  )
}
