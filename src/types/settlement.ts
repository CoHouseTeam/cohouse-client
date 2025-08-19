// 정산 상태
export type SettlementStatus = 'PENDING' | 'COMPLETED' | 'CANCELED'

// 송금 상태
export type TransferStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'

// 정산 카테고리
export type SettlementCategory = 'FOOD' | 'DAILY_SUPPLIES' | 'CULTURE' | 'ETC'

// 정산 참여자 정보
export interface SettlementParticipant {
  id: number // 정산-참여자 ID
  group_member_id: number // 그룹 내 멤버 ID (전역 유저ID 아님)
  per_person_amount: number // 해당 참여자가 부담해야 할 금액
  status: TransferStatus // 송금 상태
  paidAt: string | null // 송금 완료 시각
}

// 정산 등록 후 받아오는 정산 정보
export interface Settlement {
  id: number // 정산 ID
  payerId: number // 결제자 ID(group_member_id)
  category: SettlementCategory
  title: string
  description?: string | null
  total_amount: number // 정산 총 금액
  status: SettlementStatus
  imageUrl: string | null // 영수증 이미지
  createdAt: string
  completedAt: string | null
  participants: SettlementParticipant[]
}

// 정산 내역
export type SettlementListItem = Pick<
  Settlement,
  'id' | 'category' | 'title' | 'total_amount' | 'status' | 'createdAt'
>

// 정산 등록
export type CreateSettlementSpecDTO = {
  title: string
  description?: string | null
  category: string
  settlementAmount: number
  participantIds: number[]
}

export interface CreateSettlementBody {
  payerId: number // 결제자 ID(group_member_id)
  category: SettlementCategory | string
  title: string
  description?: string
  total_amount: number
  participants: Array<{
    group_member_id: number // 그룹 멤버 ID
    per_person_amount: number
  }>
}

export interface MessageResponse {
  message: string
}

// 정산 내역(히스토리)
export interface SettlementHistoryItem {
  historyId: number // 정산내역 ID
  settlementId: number // 정산 ID
  group_member_id: number // 그룹 멤버 ID
  total_amount_before: number
  total_amount_after: number
  per_person_before: number
  per_person_after: number
  statusBefore: SettlementStatus
  statusAfter: SettlementStatus
  createdAt: string
}

// 송금 내역(히스토리)
export interface PaymentHistoryItem {
  paymentHistoryId: number // 송금 기록 PK
  settlementId: number // Settlement.id
  senderId: number // 그룹 멤버 ID
  receiverId: number // 그룹 멤버 ID
  amount: number
  status: TransferStatus
  createdAt: string
}
