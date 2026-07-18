import { create } from 'zustand'

interface BgStore {
  bgUrl: string | null
  weatherType: string | null
  setBg: (bgUrl: string, weatherType: string) => void
}

export const useBgStore = create<BgStore>((set) => ({
  bgUrl: '/assets/regions/Analamanga.jpg',
  weatherType: 'highlands',
  setBg: (bgUrl, weatherType) => set({ bgUrl, weatherType })
}))
