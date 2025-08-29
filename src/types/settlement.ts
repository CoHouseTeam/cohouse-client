// 정산 상태
export type SettlementStatus = 'PENDING' | 'COMPLETED' | 'CANCELED'

// 송금 상태
export type TransferStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED' | 'CANCELED'

// 정산 카테고리
export type SettlementCategory = 'FOOD' | 'DAILY_SUPPLIES' | 'CULTURE' | 'ETC'

// 정산 참여자 정보
export interface SettlementParticipant {
  id: number // 정산-참여자 ID
  memberId: number // 그룹 내 멤버 ID (전역 유저ID 아님)
  memberName: string // 멤버 이름
  shareAmount: number // 해당 참여자가 부담해야 할 금액
  status: TransferStatus // 송금 상태
}

// 정산 등록 후 받아오는 정산 정보
export interface Settlement {
  id: number // 정산 ID
  payerId: number // 결제자 ID(group member)
  payerName: string // 결제자 이름
  category: SettlementCategory
  title: string
  description?: string | null
  settlementAmount: number // 정산 총 금액
  status: SettlementStatus
  imageUrl: string | null // 영수증 이미지
  platformSupportAmount: number // 플랫폼 지원 금액
  equalDistribution: boolean // 균등분배 여부
  participants: SettlementParticipant[]
  createdAt: string
  updatedAt: string
}

// 정산 내역
export type SettlementListItem = Pick<
  Settlement,
  'id' | 'category' | 'title' | 'settlementAmount' | 'status' | 'createdAt'
>

// 정산 등록
// - 균등 분배 / 직접 분배 모두 지원
type CreateSettlementBase = {
  title: string
  description?: string
  settlementAmount: number
  category: SettlementCategory
}

export type CreateSettlementBody =
  | (CreateSettlementBase & {
      equalDistribution: true
      participantIds: number[]
    })
  | (CreateSettlementBase & {
      equalDistribution: false
      manualShares: Record<number, number>
    })

export type CreateSettlementResp = {
  id: number
  category: string
  title: string
  description: string
  settlementAmount: number
  status: string
  imageUrl: string | null
  payerId: number
  payerName: string
  platformSupportAmount: number
  equalDistribution: boolean
  participants: SettlementParticipant[]
  createdAt: string
  updatedAt: string
}

export interface MessageResponse {
  message: string
}

// 송금 내역(히스토리)
export interface PaymentHistoryItem {
  paymentHistoryId: number // 송금 기록 PK
  settlementId: number // Settlement.id
  senderId: number // 송금자(그룹 멤버 ID)
  receiverId: number // 수신자(그룹 멤버 ID)
  amount: number
  status: TransferStatus
  transferAt: string // 송금 시각
}
