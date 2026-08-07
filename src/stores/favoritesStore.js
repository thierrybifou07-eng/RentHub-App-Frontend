import { create } from "zustand"

const STORAGE_KEY = "renthub-favorites"

export const useFavoritesStore = create((set, get) => ({
  favorites: [],

  hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const favorites = JSON.parse(raw)
        set({ favorites })
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  toggleFavorite(listingId) {
    const { favorites } = get()
    const next = favorites.includes(listingId)
      ? favorites.filter((id) => id !== listingId)
      : [...favorites, listingId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    set({ favorites: next })
  },

  isFavorite(listingId) {
    return get().favorites.includes(listingId)
  },
}))
