import { create } from 'zustand'
import { Assignment, GroupMember, RepeatDay, Template } from '../types/tasks'

interface CalendarState {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))

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
}))
