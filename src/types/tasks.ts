import React from 'react'
import { KorDay } from '../libs/utils/dayMapping'

export interface Member {
  name: string
  profileUrl: string
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
  selected: number | null
  onSelect: (idx: number | null) => void
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
  groupMemberId?: number
  templateId: number
  date: string
  status?: string
  dayOfWeek: string
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
}

export interface RandomProps {
  onClick: () => void
  disabled?: boolean
}

export interface TaskTableProps {
  assignments: Assignment[]
}

export interface TaskHistory {
  date: string
  task: string
  status: '완료' | '미완료'
}

export interface HistoryModalProps {
  open: boolean
  onClose: () => void
  items: TaskHistory[]
}

export interface GroupMember {
  id: number
  groupId: number
  memberId: number
  isLeader: boolean
  nickname: string
  profileUrl: string
  status: string
  joinedAt: string
  leavedAt: string | null
}

export interface MyRoleResponse {
  isLeader: boolean
}
