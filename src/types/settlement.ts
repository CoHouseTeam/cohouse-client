// 정산 상태 상태 값 타입
export type SettlementStatus = 'ONGOING' | 'COMPLETED' | 'CANCELLED'

// 카테고리
export type Category = '식비' | '생활용품' | '문화생활' | '기타'

// 역할(Role)
export type Role = 'PAYER' | 'PARTICIPANT'

// 정산에 포함되는 참여자 정보
export interface Participant {
  userId: string // 사용자 고유 ID
  name: string // 이름
  profileUrl?: string // 프로필 이미지 URL
  shareAmount: number // 해당 참여자가 부담해야 할 금액
  hasPaid: boolean // 송금 완료 여부
  transferredAt?: string // 송금 시각
  cancelledAt?: string // 취소 시각
}

// 정산 내역 정보
export interface Settlement {
  id: string // 정산내역 ID
  title: string // 제목
  description?: string // 설명
  category: Category // 카테고리
  receiptImageUrl?: string //영수증 이미지(선택)
  totalAmount: number // 총 금액
  payerId: string // 결제자 ID(등록하는 사람의 ID)
  status: SettlementStatus // 상태
  participants: Participant[] // 참여자 목록
  createdAt: string // 정산 생성 시간
  completedAt?: string // 완료일
  cancelledAt?: string // 정산 취소 시간
}

// 로그인 되어있는 사용자 정보
export interface Me {
  userId: string
  name: string
}

// 정산등록 DTO(Data Transfer Object) - 정산 등록 시 서버로 보내는 정보
export interface CreateSettlementDTO {
  title: string
  description?: string
  category: Category
  totalAmount: number
  participants: Array<Pick<Participant, 'userId' | 'name' | 'shareAmount'>>
  receiptImageUrl?: string
}

// 참여자 선택 모달에 표시할 그룹원
export interface GroupMember {
  userId: string
  name: string
  profileUrl?: string
}

// 진행중인 카드
export interface OngoingSettlement {
  role: Role // 현재 사용자 역할
  settlement: Settlement | null // 진행중 없으면 null
  mine?: Pick<Participant, 'userId' | 'hasPaid' | 'shareAmount' | 'transferredAt'> // 참여자일 경우 내 상태 요약
}

// 정산 히스토리 상세 내역
export interface DetailSettlement {
  role: Role
  settlement: Settlement
  payer: {
    userId: string
    name: string
  }
  mine?: Pick<Participant, 'userId' | 'hasPaid' | 'shareAmount' | 'transferredAt'>
}

// 송금 상태 타입
export type TransferStatus = 'PAID' | 'FAILED' | 'CANCELLED'

// 송금 히스토리 상세 전용
export interface TransferDetailSettlement extends DetailSettlement {
  transferStatus: TransferStatus
}
