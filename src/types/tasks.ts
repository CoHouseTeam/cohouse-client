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

export interface Assignment {
  groupId: number
  groupMemberId?: number
  templateId: number
  date: string
  assignType: 'MANUAL' | 'AUTO'
  repeatType?: string
  updatedAt?: string
}
