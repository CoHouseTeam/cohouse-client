import { Settlement, PaymentHistoryItem, SettlementCategory } from '../../types/settlement'

/* ─────────────────────────────────────────────
   1) 멤버(표시용) & 그룹 멤버 ID 매핑
   ───────────────────────────────────────────── */
export const members = {
  1: { name: '홍길동', profileUrl: '/avatars/u1.png' },
  2: { name: '김지민', profileUrl: '/avatars/u2.png' },
  3: { name: '이서연', profileUrl: '/avatars/u3.png' },
  4: { name: '박준호', profileUrl: '/avatars/u4.png' },
  5: { name: '최민지', profileUrl: '/avatars/u5.png' },
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
   3) 정산 등록 후 받아오는 정산 정보(목록)
   - 명세서 예시 데이터로 구성
   - participants: id / memberId / memberName / shareAmount / status
   ───────────────────────────────────────────── */
export const settlements: Settlement[] = [
  {
    id: 8,
    category: 'FOOD',
    title: '마라탕 배달비3',
    description: '저녁 식사 비용',
    settlementAmount: 44500,
    status: 'COMPLETED',
    imageUrl:
      'https://cohouse-bucket.s3.ap-northeast-2.amazonaws.com/groups/1/settlements/8/receipt/0e8d76d5-756b-4221-9d7a-d59ec184a283_pizza.jpg',
    payerId: 1,
    payerName: members[1].name,
    platformSupportAmount: 0,
    equalDistribution: true,
    participants: [
      { id: 30, memberId: 1, memberName: members[1].name, shareAmount: 8900, status: 'PAID' },
      { id: 31, memberId: 2, memberName: members[2].name, shareAmount: 8900, status: 'PAID' },
      { id: 32, memberId: 3, memberName: members[3].name, shareAmount: 8900, status: 'PAID' },
      { id: 33, memberId: 4, memberName: members[4].name, shareAmount: 8900, status: 'PAID' },
      { id: 34, memberId: 5, memberName: members[5].name, shareAmount: 8900, status: 'PAID' },
    ],
    createdAt: '2025-08-19T19:53:15.560542Z',
    updatedAt: '2025-08-21T22:07:47.543158Z',
  },
  {
    id: 7,
    category: 'FOOD',
    title: '마라탕 배달비2',
    description: '저녁 식사 비용2',
    settlementAmount: 80000,
    status: 'PENDING',
    imageUrl: null,
    payerId: 1,
    payerName: members[1].name,
    platformSupportAmount: 0,
    equalDistribution: true,
    participants: [
      { id: 25, memberId: 1, memberName: members[1].name, shareAmount: 16000, status: 'PAID' },
      { id: 26, memberId: 2, memberName: members[2].name, shareAmount: 16000, status: 'PENDING' },
      { id: 27, memberId: 3, memberName: members[3].name, shareAmount: 16000, status: 'PENDING' },
      { id: 28, memberId: 4, memberName: members[4].name, shareAmount: 16000, status: 'PENDING' },
      { id: 29, memberId: 5, memberName: members[5].name, shareAmount: 16000, status: 'PENDING' },
    ],
    createdAt: '2025-08-19T14:32:34.538712Z',
    updatedAt: '2025-08-19T14:32:34.538712Z',
  },
  {
    id: 6,
    category: 'FOOD',
    title: '마라탕 배달비',
    description: '저녁 식사 비용',
    settlementAmount: 60000,
    status: 'CANCELED',
    imageUrl: null,
    payerId: 2,
    payerName: members[2].name,
    platformSupportAmount: 0,
    equalDistribution: true,
    // 명세서 예시: 일부는 CANCELED, 나머지는 REFUNDED
    participants: [
      { id: 21, memberId: 1, memberName: members[1].name, shareAmount: 15000, status: 'CANCELED' },
      { id: 22, memberId: 2, memberName: members[2].name, shareAmount: 15000, status: 'REFUNDED' },
      { id: 23, memberId: 3, memberName: members[3].name, shareAmount: 15000, status: 'REFUNDED' },
      { id: 24, memberId: 4, memberName: members[4].name, shareAmount: 15000, status: 'REFUNDED' },
    ],
    createdAt: '2025-08-18T20:39:46.746652Z',
    updatedAt: '2025-08-18T20:52:39.475619Z',
  },
]

/* ─────────────────────────────────────────────
   4) 나의 송금 내역(히스토리)
   - transferAt 사용 (명세서)
   ───────────────────────────────────────────── */
export const myPaymentHistory: PaymentHistoryItem[] = [
  {
    paymentHistoryId: 4,
    settlementId: 6,
    senderId: 3,
    receiverId: 2,
    amount: 15000,
    status: 'PAID',
    transferAt: '2025-08-18T20:40:02.306575Z',
  },
  {
    paymentHistoryId: 8,
    settlementId: 6,
    senderId: 3,
    receiverId: 2,
    amount: 15000,
    status: 'REFUNDED',
    transferAt: '2025-08-18T20:52:39.436124Z',
  },
  {
    paymentHistoryId: 11,
    settlementId: 8,
    senderId: 3,
    receiverId: 1,
    amount: 8900,
    status: 'PAID',
    transferAt: '2025-08-19T20:27:18.951895Z',
  },
]
