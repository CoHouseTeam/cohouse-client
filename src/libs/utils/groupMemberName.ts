import { GroupMember, Member } from '../../types/tasks'

//그룹 닉네임과 이름 mapping
export function groupMembersName(groups: GroupMember[]): Member[] {
  return groups.map((m) => ({
    name: m.nickname,
    profileImageUrl: m.profileImageUrl || '', // API에 profileUrl 없으면 빈 문자열 처리
  }))
}
