import { KorDay } from '../libs/utils/dayMapping'

export interface Member {
  name: string
  profileUrl: string
}

export interface Template {
  templateId: number
  groupId: number
  category: string
  createdAt: string
  updatedAt: string
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
