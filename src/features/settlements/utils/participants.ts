// libs/utils/participants.ts
import { users } from '../../../mocks/db/users'
import { SettlementParticipant, TransferStatus } from '../../../types/settlement'

// UI에서 쓰는 참가자 타입(이미 컴포넌트에 있다면 import해서 쓰세요)
export type UIParticipant = {
  memberId: number
  memberName: string
  shareAmount?: number
  status?: TransferStatus
  settlementParticipantId?: number
  avatar?: string
}

// 모달이 올려주는 멤버
export type BasicMember = {
  memberId: number
  memberName: string
  avatar?: string
}

export function getAvatarByMemberId(memberId: number): string {
  const user = users.find((u) => u.id === memberId)
  return user?.profileImageUrl ?? '/placeholder-avatar.png'
}

// 서버 응답(상세조회 participants) -> UI 모델
export function fromServerList(list: SettlementParticipant[] = []): UIParticipant[] {
  return list.map((p) => ({
    memberId: p.memberId,
    memberName: p.memberName,
    shareAmount: p.shareAmount,
    status: p.status,
    settlementParticipantId: p.memberId,
    avatar: getAvatarByMemberId(p.memberId),
  }))
}

// 모달 선택 결과 -> UI 모델
export function fromMembers(list: BasicMember[] = []): UIParticipant[] {
  return list.map((m) => ({
    memberId: m.memberId,
    memberName: m.memberName,
    avatar: m.avatar ?? getAvatarByMemberId(m.memberId),
    shareAmount: undefined, // 초기값 비움
  }))
}

// 균등분배 적용
export function applyEvenSplit(participants: UIParticipant[], total: number): UIParticipant[] {
  const n = participants.length
  if (n <= 0 || total <= 0) {
    return participants.map((p) => ({ ...p, shareAmount: 0 }))
  }
  const divisor = n + 1 // 참여자 + 결제자
  const base = Math.floor(total / divisor)
  return participants.map((p) => ({ ...p, shareAmount: base }))
}

// 플랫폼 부담 금액 계산 헬퍼
export function computePlatformRemainder(participants: UIParticipant[], total: number): number {
  const n = participants.length
  if (n <= 0 || total <= 0) return 0
  const divisor = n + 1
  const base = Math.floor(total / divisor)
  return total - base * divisor
}
