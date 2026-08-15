import { create } from "zustand"
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from "../api/favoritesApi"
import { useAuthStore } from "./authStore"

function extractFavoriteId(item) {
  const id =
    item?.announcement_id ??
    item?.announcementId ??
    item?.announcement?.id ??
    item?.Announcement?.id ??
    item?.id
  return String(id)
}

function unwrapItems(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.items)) return response.data.items
  return []
}

export const useFavoritesStore = create((set, get) => ({
  favorites: [],

  async hydrate() {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (isAuthenticated) {
      await get().fetchFavorites()
    } else {
      set({ favorites: [] })
    }
  },

  async fetchFavorites() {
    try {
      const response = await getFavorites({ limit: 100 })
      const items = unwrapItems(response)
      const ids = items.map(extractFavoriteId).filter(Boolean)
      set({ favorites: ids })
    } catch (err) {
      console.error("Failed to fetch favorites:", err)
      set({ favorites: [] })
    }
  },

  async addFavorite(listingId) {
    const normalized = String(listingId)
    const { favorites } = get()
    if (favorites.includes(normalized)) return

    // Optimistic update
    set({ favorites: [...favorites, normalized] })
    try {
      await apiAddFavorite(listingId)
    } catch (err) {
      // Revert on error
      console.error("Failed to add favorite:", err)
      set({ favorites: favorites })
    }
  },

  async removeFavorite(listingId) {
    const normalized = String(listingId)
    const { favorites } = get()
    if (!favorites.includes(normalized)) return

    // Optimistic update
    set({ favorites: favorites.filter(id => id !== normalized) })
    try {
      await apiRemoveFavorite(listingId)
    } catch (err) {
      // Revert on error
      console.error("Failed to remove favorite:", err)
      set({ favorites: favorites })
    }
  },

  toggleFavorite(listingId) {
    if (get().isFavorite(listingId)) {
      return get().removeFavorite(listingId)
    } else {
      return get().addFavorite(listingId)
    }
  },

  isFavorite(listingId) {
    return get().favorites.includes(String(listingId))
  },
}))
