import { defineStore } from 'pinia'

interface Rocket {
  id: string
  name: string
  description: string
  flickr_images: string[]
  cost_per_launch: number
  country: string
  first_flight: string
}

interface RocketState {
  rockets: Rocket[]
  currentRocket: Rocket | null
  loading: boolean
  error: string | null
  customRockets: Rocket[]
}

const STORAGE_KEY = 'rockets-data'

export const useRocketStore = defineStore('rocket', {
  state: (): RocketState => ({
    rockets: [],
    currentRocket: null,
    loading: false,
    error: null,
    customRockets: []
  }),

  getters: {
    allRockets(state: RocketState): Rocket[] {
      return [...state.rockets, ...state.customRockets]
    },
    getRocketById: (state: RocketState) => (id: string): Rocket | undefined => {
      const allRockets = [...state.rockets, ...state.customRockets]
      return allRockets.find(rocket => rocket.id === id)
    }
  },

  actions: {
    async fetchRockets() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('https://api.spacexdata.com/v4/rockets')
        if (!response.ok) throw new Error('Failed to fetch rockets')
        this.rockets = await response.json()
        
        // Load custom rockets from localStorage
        const storedRockets = localStorage.getItem(STORAGE_KEY)
        if (storedRockets) {
          this.customRockets = JSON.parse(storedRockets)
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch rockets'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRocket(id: string) {
      this.loading = true
      this.error = null
      try {
        // First check in custom rockets
        const customRocket = this.customRockets.find(r => r.id === id)
        if (customRocket) {
          this.currentRocket = customRocket
          return
        }

        // If not found in custom rockets, fetch from API
        const response = await fetch(`https://api.spacexdata.com/v4/rockets/${id}`)
        if (!response.ok) throw new Error('Failed to fetch rocket')
        this.currentRocket = await response.json()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch rocket'
        throw error
      } finally {
        this.loading = false
      }
    },

    addRocket(rocket: Rocket) {
      this.loading = true
      try {
        this.customRockets.unshift(rocket)
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customRockets))
      } finally {
        this.loading = false
      }
    }
  }
})