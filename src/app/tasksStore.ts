import { create } from 'zustand'
import { Assignment, GroupMember, RepeatDay, Template } from '../types/tasks'
import { AnnouncementSummary } from '../types/main'

interface CalendarState {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarState>((set) => {
  const now = new Date()
  const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // 자정 시각

  return {
    selectedDate: localToday,
    setSelectedDate: (date) => set({ selectedDate: date }),
  }
})

interface TaskState {
  assignments: Assignment[]
  setAssignments: (assignments: Assignment[]) => void

  templates: Template[]
  setTemplates: (templates: Template[]) => void

  repeatDays: RepeatDay[]
  setRepeatDays: (repeatDays: RepeatDay[]) => void

  groupMembers: GroupMember[]
  setGroupMembers: (members: GroupMember[]) => void

  isLeader: boolean | null
  setIsLeader: (val: boolean | null) => void

  groupId: number | null
  setGroupId: (id: number | null) => void

  loadingAssignments: boolean
  setLoadingAssignments: (loading: boolean) => void

  errorAssignments: string
  setErrorAssignments: (error: string) => void

  myAssignments: string[]
  setMyAssignments: (assignments: string[]) => void

  repeat: boolean
  setRepeat: (val: boolean) => void

  showHistory: boolean
  setShowHistory: (val: boolean) => void

  exchangeSelected: number[]
  setExchangeSelected: (selected: number[]) => void

  modalOpen: boolean
  setModalOpen: (open: boolean) => void

  error: string
  setError: (error: string) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),

  templates: [],
  setTemplates: (templates) => set({ templates }),

  repeatDays: [],
  setRepeatDays: (repeatDays) => set({ repeatDays }),

  groupMembers: [],
  setGroupMembers: (groupMembers) => set({ groupMembers }),

  isLeader: null,
  setIsLeader: (val) => set({ isLeader: val }),

  groupId: null,
  setGroupId: (id) => set({ groupId: id }),

  loadingAssignments: false,
  setLoadingAssignments: (loading) => set({ loadingAssignments: loading }),

  errorAssignments: '',
  setErrorAssignments: (error) => set({ errorAssignments: error }),

  myAssignments: [],
  setMyAssignments: (assignments) => set({ myAssignments: assignments }),

  repeat: true,
  setRepeat: (val) => set({ repeat: val }),

  showHistory: false,
  setShowHistory: (val) => set({ showHistory: val }),

  exchangeSelected: [],
  setExchangeSelected: (selected) => set({ exchangeSelected: selected }),

  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open }),

  error: '',
  setError: (error) => set({ error }),
}))

interface AnnouncementState {
  announcements: AnnouncementSummary[]
  setAnnouncements: (announcements: AnnouncementSummary[]) => void
  loadingAnnouncements: boolean
  setLoadingAnnouncements: (loading: boolean) => void
  errorAnnouncements: string
  setErrorAnnouncements: (error: string) => void
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  setAnnouncements: (announcements) => set({ announcements }),
  loadingAnnouncements: false,
  setLoadingAnnouncements: (loading) => set({ loadingAnnouncements: loading }),
  errorAnnouncements: '',
  setErrorAnnouncements: (error) => set({ errorAnnouncements: error }),
}))
