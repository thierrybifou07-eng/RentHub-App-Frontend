import apiClient from "./client"

// GET /announcements (public avec filtres)
export async function getAnnouncements(params = {}) {
  const response = await apiClient.get("/announcements", { params })
  return response
}

// GET /announcements/me (propriétaire/agence)
export async function getMyAnnouncements(params = {}) {
  const response = await apiClient.get("/announcements/me", { params })  
  return response
}

// GET /announcements/admin/pending (admin - liste des annonces en attente)
export async function getPendingAnnouncements() {
  const response = await apiClient.get("/announcements/admin/pending")
  return response
}

// GET /announcements/:id (public)
export async function getAnnouncementById(id) {
  const response = await apiClient.get(`/announcements/${id}`)
  return response.data
}

// POST /announcements (propriétaire/agence - supporte FormData)
export async function createAnnouncement(data) {
  // Pour un FormData, on laisse axios définir le Content-Type (avec boundary)
  const response = await apiClient.post("/announcements", data)
  return response
}

// PUT /announcements/:id (propriétaire/agence)
export async function updateAnnouncement(id, data) {
  const response = await apiClient.put(`/announcements/${id}`, data)
  return response
}

// DELETE /announcements/:id (propriétaire/agence/admin)
export async function deleteAnnouncement(id) {
  const response = await apiClient.delete(`/announcements/${id}`)
  return response
}

// PATCH /announcements/:id/archive (propriétaire/agence)
export async function archiveAnnouncement(id) {
  const response = await apiClient.patch(`/announcements/${id}/archive`)
  return response
}

// PATCH /announcements/:id/resubmit (propriétaire/agence)
export async function resubmitAnnouncement(id) {
  const response = await apiClient.patch(`/announcements/${id}/resubmit`)
  return response
}

// PUT /announcements/admin/:id/approve (admin)
export async function approveAnnouncement(id) {
  const response = await apiClient.put(`/announcements/admin/${id}/approve`)
  return response
}

// PUT /announcements/admin/:id/reject (admin)
export async function rejectAnnouncement(id, reason) {
  const response = await apiClient.put(`/announcements/admin/${id}/reject`, { reason })
  return response
}
