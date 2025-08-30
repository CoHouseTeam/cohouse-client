// 정산 상태
export type SettlementStatus = 'PENDING' | 'COMPLETED' | 'CANCELED'

// 송금 상태
export type TransferStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED' | 'CANCELED'

// 정산 카테고리
export type SettlementCategory = 'FOOD' | 'DAILY_SUPPLIES' | 'CULTURE' | 'ETC'

// 정산 참여자 정보
export interface SettlementParticipant {
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
  category: SettlementCategory
  title: string
  description: string
  settlementAmount: number
  status: SettlementStatus
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

// 날짜 문자열 alias
export type ISODate = string // '2025-08-29'
export type ISODateTime = string // '2025-08-29T16:10:22.118Z'

// 송금 히스토리
export interface PaymentHistoryRequest {
  groupId?: number
  settlementId?: number
  fromDate?: ISODate
  toDate?: ISODate
  fromDateTime?: ISODateTime
  toDateTime?: ISODateTime
}

// 송금 히스토리 응답
export interface PaymentHistoryItem {
  id: number
  settlementId: number
  senderId: number
  receiverId: number
  amount: number
  status: TransferStatus
  transferAt: ISODateTime
}

// 페이지 요청 파라미터(요청)
export type PageParams = {
  page: number // 0부터 시작
  size: number // 페이지 크기
  sort?: string | string[] // 'createdAt,desc' 또는 ['createdAt,desc','id,asc']
}

// 페이지네이션 공통(응답)
export interface Pageable<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first?: boolean
  last?: boolean
  empty?: boolean
  numberOfElements?: number
  sort?: unknown
  pageable?: unknown
}
