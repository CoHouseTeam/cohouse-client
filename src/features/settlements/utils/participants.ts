// libs/utils/participants.ts
import { TransferStatus } from '../../../types/settlement'

// UI에서 쓰는 참가자 타입(이미 컴포넌트에 있다면 import해서 쓰세요)
export type UIParticipant = {
  memberId: number
  memberName: string
  shareAmount?: number
  status?: TransferStatus
  settlementParticipantId?: number
  profileImageUrl?: string | null
}

export function fromServerList(
  list: Array<{
    memberId: number
    memberName?: string
    shareAmount?: number | null
    status?: TransferStatus | null
    settlementParticipantId?: number | null
    profileImageUrl?: string | null
  }> = []
): UIParticipant[] {
  return list.map((p) => ({
    memberId: p.memberId,
    memberName: p.memberName ?? `멤버 ${p.memberId}`,
    shareAmount: p.shareAmount ?? undefined,
    status: p.status ?? undefined,
    settlementParticipantId: p.settlementParticipantId ?? undefined,
    profileImageUrl: p.profileImageUrl ?? null,
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
