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

interface GroupState {
  hasGroups: boolean
  setHasGroups: (val: boolean) => void
  myMemberId: number | null
  setMyMemberId: (id: number | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

export const useGroupStore = create<GroupState>((set) => ({
  hasGroups: false,
  setHasGroups: (val) => set({ hasGroups: val }),
  myMemberId: null,
  setMyMemberId: (id) => set({ myMemberId: id }),
}))
