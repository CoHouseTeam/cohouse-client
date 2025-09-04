import { create } from 'zustand'

interface User {
  id: number
  name: string
  email: string
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
}

interface CalendarState {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

interface GroupState {
  hasGroups: boolean
  setHasGroups: (val: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))

export const useGroupStore = create<GroupState>((set) => ({
  hasGroups: false,
  setHasGroups: (val) => set({ hasGroups: val }),
}))

// useGroupStore와 useAuth 훅을 동기화하는 함수
export const syncGroupStoreWithAuth = (hasGroups: boolean) => {
  useGroupStore.getState().setHasGroups(hasGroups)
}
