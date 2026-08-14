import apiClient from "./client"

// GET /media — Récupérer les médias de l'utilisateur connecté
export async function getMyMedia() {
  const response = await apiClient.get("/media")
  return response.data || response
}

// POST /media/avatar — Upload d'un avatar
export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append("avatar", file)

  // On laisse le navigateur définir le Content-Type (boundary)
  const response = await apiClient.post("/media/avatar", formData)
  return response.data || response
}

// DELETE /media/avatar — Suppression de l'avatar
export async function deleteAvatar() {
  const response = await apiClient.delete("/media/avatar")
  return response.data || response
}

// POST /media/announcements/:id/images — Upload d'images (max 10)
export async function uploadAnnouncementImages(announcementId, files) {
  const formData = new FormData()
  // "images" est le nom du champ attendu par l'API
  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i])
  }

  const response = await apiClient.post(`/media/announcements/${announcementId}/images`, formData)
  return response.data || response
}

// POST /media/announcements/:id/videos — Upload de vidéos (max 3)
export async function uploadAnnouncementVideos(announcementId, files) {
  const formData = new FormData()
  // "videos" est le nom du champ attendu par l'API
  for (let i = 0; i < files.length; i++) {
    formData.append("videos", files[i])
  }

  const response = await apiClient.post(`/media/announcements/${announcementId}/videos`, formData)
  return response.data || response
}

// DELETE /media/:mediaId — Suppression d'un média spécifique
export async function deleteMedia(mediaId) {
  const response = await apiClient.delete(`/media/${mediaId}`)
  return response.data || response
}
