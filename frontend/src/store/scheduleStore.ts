import { create } from 'zustand'
import type { ScheduleRun, ScheduledSection } from '../types'

interface ScheduleStore {
  activeRun: ScheduleRun | null
  sections: ScheduledSection[]
  setActiveRun: (run: ScheduleRun | null) => void
  setSections: (sections: ScheduledSection[]) => void
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  activeRun: null,
  sections: [],
  setActiveRun: (run) => set({ activeRun: run }),
  setSections: (sections) => set({ sections }),
}))
