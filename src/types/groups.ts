export interface Group {
  id: number
  name: string
}

export interface GroupMember {
  id: number
  nickname: string
  role: string
}

export interface GroupInviteResponse {
  code: string
  expiredAt: string
}

export interface GroupJoinParams {
  inviteCode: string
  nickname: string
}

export interface MyRoleResponse {
  isLeader: boolean
}
