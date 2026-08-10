import { create } from "zustand"
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from "../api/favoritesApi"
import { useAuthStore } from "./authStore"

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
      const response = await getFavorites({ limit: 100 }) // Get a large chunk to have the IDs locally
      // Assuming response.data.items or response.data contains the list of favorite announcements
      const items = response || []
      // We extract the announcement IDs. The API might return the announcement object directly, or a favorite object containing an announcement_id or announcement object.
      // Usually it's `announcement_id` or the `id` of the announcement if the list is just announcements. Let's assume the items are announcement objects with `id` or favorite objects with `announcement_id`.
      const ids = items.map(item => item.announcement_id)      
      set({ favorites: ids })
    } catch (err) {
      console.error("Failed to fetch favorites:", err)
      set({ favorites: [] })
    }
  },

  async addFavorite(listingId) {
    const { favorites } = get()
    if (favorites.includes(listingId)) return

    // Optimistic update
    set({ favorites: [...favorites, listingId] })
    try {
      await apiAddFavorite(listingId)
    } catch (err) {
      // Revert on error
      console.error("Failed to add favorite:", err)
      set({ favorites: favorites })
    }
  },

  async removeFavorite(listingId) {
    const { favorites } = get()
    if (!favorites.includes(listingId)) return

    // Optimistic update
    set({ favorites: favorites.filter(id => id !== listingId) })
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
    return get().favorites.includes(listingId)
  },
}))
