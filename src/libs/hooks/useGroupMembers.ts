import { useQuery } from '@tanstack/react-query'
import { UIParticipant } from '../../features/settlements/utils/participants'
import { fetchGroupMembers } from '../api/groups'
import { useProfile } from './mypage/useProfile'

type MemberResp = {
  id: number
  groupId: number
  memberId: number
  isLeader: boolean
  nickname: string
  status: 'ACTIVE' | 'INACTIVE' | string
  joinedAt: string
  leavedAt?: string | null
  profileImageUrl?: string | null
}

export function useGroupMembers(groupId: number | null) {
  return useQuery<UIParticipant[]>({
    queryKey: ['groups', groupId, 'members'],
    enabled: !!groupId,
    queryFn: async (): Promise<UIParticipant[]> => {
      if (!groupId) return []
      const members = (await fetchGroupMembers(groupId)) as MemberResp[]
      return members
        .filter((m) => m.status === 'ACTIVE')
        .map<UIParticipant>((m) => ({
          memberId: m.memberId,
          memberName: m.nickname ?? `멤버 ${m.memberId}`,
          profileImageUrl: m.profileImageUrl,
        }))
    },
  })
}

export function useMyMemberId(groupId: number | null) {
  const { data: me } = useProfile()

  return useQuery<number | undefined>({
    queryKey: ['groups', groupId, 'myMemberId', me?.id],
    enabled: !!groupId && !!me?.id,
    queryFn: async () => {
      const members = (await fetchGroupMembers(groupId!)) as MemberResp[]
      const mine = members.find((m) => m.status === 'ACTIVE' && m.memberId === me!.id)
      return mine?.memberId
    },
    staleTime: 30000,
  })
}
