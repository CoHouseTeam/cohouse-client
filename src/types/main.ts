export interface CalendarDateDetailsProps {
  selectedDate: Date
  events: string[]
}

export interface CalendarDotsProps {
  colors: string[]
  dayLength?: number
}

export interface Todo {
  text: string
  checked: boolean
}

export interface Member {
  name: string
  role: string
  avatar: string
}

export interface Group {
  date: string
  members: Member[]
}

export interface CalendarBoxProps {
  onDateSelect?: (date: Date) => void
  value?: Date
}

export interface UncompletedTasksModalProps {
  onClose: () => void
}
