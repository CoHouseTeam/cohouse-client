import {
  Settlement,
  SettlementParticipant,
  PaymentHistoryItem,
  SettlementCategory,
} from '../types/settlement'

/* ─────────────────────────────────────────────
   1) 멤버(표시용) & 그룹 멤버 ID 매핑
   ───────────────────────────────────────────── */
export const members = {
  1: { name: '최꿀꿀', profileUrl: '/avatars/u1.png' },
  2: { name: '이댕댕', profileUrl: '/avatars/u2.png' },
  3: { name: '김냥냥', profileUrl: '/avatars/u3.png' },
} as const
// ↑ UI에서 표시용으로만 참고(네임/아바타). API 타입에는 영향 없음

/* ─────────────────────────────────────────────
   2) 카테고리 변환
   ───────────────────────────────────────────── */
export function toCategory(input: string): SettlementCategory {
  const map: Record<string, SettlementCategory> = {
    식비: 'FOOD',
    식사: 'FOOD',
    생활용품: 'DAILY_SUPPLIES',
    문화생활: 'CULTURE',
    기타: 'ETC',
  }
  return map[input] ?? 'ETC'
}

/* ─────────────────────────────────────────────
   3) 참여자 목록
   ───────────────────────────────────────────── */
const p_ongoing: SettlementParticipant[] = [
  {
    id: 101,
    group_member_id: 1,
    per_person_amount: 200000,
    status: 'SENT',
    paidAt: '2025-08-13T01:00:00.000Z',
  },
  { id: 102, group_member_id: 2, per_person_amount: 200000, status: 'WAITING', paidAt: null },
  {
    id: 103,
    group_member_id: 3,
    per_person_amount: 200000,
    status: 'SENT',
    paidAt: '2025-08-13T01:15:00.000Z',
  },
]

const p_completed_chicken: SettlementParticipant[] = [
  {
    id: 201,
    group_member_id: 1,
    per_person_amount: 12500,
    status: 'SENT',
    paidAt: '2025-08-08T13:00:00.000Z',
  },
  { id: 202, group_member_id: 2, per_person_amount: 12500, status: 'SENT', paidAt: null }, // 결제자도 SENT로 표시 가능
  {
    id: 203,
    group_member_id: 3,
    per_person_amount: 12500,
    status: 'SENT',
    paidAt: '2025-08-08T13:32:00.000Z',
  },
]

const p_completed_lifestyle: SettlementParticipant[] = [
  { id: 301, group_member_id: 1, per_person_amount: 26500, status: 'SENT', paidAt: null }, // 결제자
  {
    id: 302,
    group_member_id: 2,
    per_person_amount: 26500,
    status: 'SENT',
    paidAt: '2025-08-03T09:15:00.000Z',
  },
  {
    id: 303,
    group_member_id: 3,
    per_person_amount: 26500,
    status: 'SENT',
    paidAt: '2025-08-03T09:16:00.000Z',
  },
]

/* ─────────────────────────────────────────────
   4) 정산(상세) 목록
   ───────────────────────────────────────────── */
export const settlements: Settlement[] = [
  {
    id: 1,
    payerId: 1, // 결제자: 그룹 멤버 ID
    category: 'FOOD',
    title: '회식비 정산',
    description: '삼겹살 + 후식',
    total_amount: 600000,
    status: 'PENDING',
    imageUrl: '/receipts/2025-08-13-01.png',
    createdAt: '2025-08-13T00:00:00.000Z',
    completedAt: null,
    participants: p_ongoing,
  },
  {
    id: 2,
    payerId: 2,
    category: 'FOOD',
    title: '치킨 배달 정산',
    description: null,
    total_amount: 37500,
    status: 'COMPLETED',
    imageUrl: '/receipts/2025-08-08-13.png',
    createdAt: '2025-08-08T12:00:00.000Z',
    completedAt: '2025-08-09T10:00:00.000Z',
    participants: p_completed_chicken,
  },
  {
    id: 3,
    payerId: 1,
    category: 'DAILY_SUPPLIES',
    title: '생활용품 공동구매 정산',
    description: null,
    total_amount: 79500,
    status: 'COMPLETED',
    imageUrl: null,
    createdAt: '2025-08-01T15:00:00.000Z',
    completedAt: '2025-08-03T09:30:00.000Z',
    participants: p_completed_lifestyle,
  },
]

/* ─────────────────────────────────────────────
   5) 내 송금 히스토리 
   ───────────────────────────────────────────── */
export const myPaymentHistory: PaymentHistoryItem[] = [
  {
    paymentHistoryId: 11,
    settlementId: 2, // 치킨 배달 정산 (id:2, payerId:2)
    senderId: 1, // 보낸 사람: 1
    receiverId: 2, // 받는 사람: 결제자 2
    amount: 12500, // p_completed_chicken에서 member 1의 per_person_amount
    status: 'SENT', // 송금 완료
    createdAt: '2025-08-08T13:00:00.000Z', // participants[1]의 paidAt과 일치
  },
  {
    paymentHistoryId: 13,
    settlementId: 3, // 생활용품 (id:3, payerId:1)
    senderId: 3,
    receiverId: 1, // 결제자 1
    amount: 26500, // p_completed_lifestyle에서 member 3의 per_person_amount
    status: 'REFUNDED', // 송금 취소
    createdAt: '2025-08-03T09:16:00.000Z', // 해당 참여자의 paidAt과 일치
  },
  {
    paymentHistoryId: 14,
    settlementId: 1, // 회식비 (id:1, payerId:1)
    senderId: 3,
    receiverId: 1, // 결제자 1  ← (수정) 원래 2로 되어있던 것 교정
    amount: 200000, // p_ongoing에서 member 3의 per_person_amount ← (수정) 50,000 → 200,000
    status: 'FAILED', // 송금 실패 (이후 2025-08-13에 성공 이력 존재)
    createdAt: '2025-08-04T11:20:00.000Z', // 실패 이력이 성공 이전 시각이라 자연스러움
  },
]
