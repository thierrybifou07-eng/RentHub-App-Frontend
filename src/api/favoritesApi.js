import apiClient from "./client"

// GET /favorites — Liste paginée des annonces favorites
export async function getFavorites(params = {}) {
  const response = await apiClient.get("/favorites", { params })
  return response.data
}

// POST /favorites/:announcementId — Ajouter aux favoris
export async function addFavorite(announcementId) {
  const response = await apiClient.post(`/favorites/${announcementId}`)
  return response.message
}

// DELETE /favorites/:announcementId — Retirer des favoris
export async function removeFavorite(announcementId) {
  const response = await apiClient.delete(`/favorites/${announcementId}`)
  return response.message
}
