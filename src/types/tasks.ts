import React from 'react'
import { KorDay } from '../libs/utils/dayMapping'

export interface Member {
  memberId?: number
  name: string
  profileImageUrl: string
}

export interface GroupMemberListProps {
  members: Member[]
}

export interface Template {
  templateId: number
  groupId: number
  category: string
  createdAt: string
  updatedAt: string
}

export interface ExchangeModalProps {
  open: boolean
  members: Member[]
  selected: number[]
  currentUserId: number
  onSelect: (selected: number[]) => void
  onRequest: () => void
  onClose: () => void
}

export interface CheckProps {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface RepeatDay {
  repeatDayId: number
  templateId: number
  dayOfWeek: string
}

export interface DaySelectModalProps {
  days: KorDay[]
  templateId: number
  onClose: () => void
  positionClass?: string
}

//POST 요청으로 받는
export interface AssignmentBody {
  groupId: number
  groupMemberId?: number[]
  templateId: number
  randomEnabled: boolean
  fixedAssigneeId?: number
  get_compatAssigneeId?: number
  get_compatCandidateIds?: number[]
  get_compatAssignType?: string
  date: string
  status?: string
  repeatType?: string
  updatedAt?: string
}

export interface Assignment {
  assignmentId: number
  groupId: number
  groupMemberId?: number
  templateId: number
  date?: string
  dayOfWeek: string
  status: string
  repeatType?: string
  createdAt?: string
  updatedAt?: string
  category: string
}

export interface RandomProps {
  onClick: () => void
  disabled?: boolean
}

export interface TaskTableProps {
  assignments: Assignment[]
  groupMembers: GroupMember[]
  isLeader: boolean
}

export interface TaskHistory {
  date: string
  task: string
  status: 'COMPLETED' | 'PENDING'
  category: string
}

export interface HistoryModalProps {
  open: boolean
  onClose: () => void
}

export interface GroupMember {
  id: number
  groupId: number
  memberId: number
  isLeader: boolean
  nickname: string
  profileImageUrl: string
  status: string
  joinedAt: string
  leavedAt: string | null
}

export interface MyRoleResponse {
  isLeader: boolean
}

// 교환 요청
export interface OverrideRequestBody {
  assignmentId: number
  targetId: number
  targetIds: number[]
  requesterId: number
  swapAssignmentId: number
}

// 세팅 모달
export interface SettingModalProps {
  onSelectDay: () => void
  onDeleteTemplate: () => void
  onClose: () => void
  positionClass?: string
}

// 미이행 모달
export interface UncompletedAssignment {
  assignmentId: number
  groupMemberId: number
  templateId: number
  date: string
  status: string
  createdAt: string
  repeatType: string
  category: string
}

export interface UncompletedMember {
  memberId: number
  nickname: string
  profileImageUrl: string
}
