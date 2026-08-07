import apiClient from "./client"

// GET /announcements (public avec filtres)
export async function getAnnouncements(params = {}) {
  const response = await apiClient.get("/announcements", { params })
  return response
}

// GET /announcements/my-announcements (propriétaire/agence)
export async function getMyAnnouncements(params = {}) {
  const response = await apiClient.get("/announcements/my-announcements", { params })
  return response
}

// GET /announcements/pending (admin - liste des annonces en attente)
export async function getPendingAnnouncements() {
  const response = await apiClient.get("/announcements/pending")
  return response
}

// GET /announcements/:id (public)
export async function getAnnouncementById(id) {
  const response = await apiClient.get(`/announcements/${id}`)
  return response
}

// POST /announcements (propriétaire/agence - supporte FormData)
export async function createAnnouncement(data) {
  const isFormData = data instanceof FormData
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
  const response = await apiClient.post("/announcements", data, config)
  return response
}

// PUT /announcements/:id (propriétaire/agence/admin)
export async function updateAnnouncement(id, data) {
  const isFormData = data instanceof FormData
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
  const response = await apiClient.put(`/announcements/${id}`, data, config)
  return response
}

// DELETE /announcements/:id (propriétaire/agence/admin)
export async function deleteAnnouncement(id) {
  const response = await apiClient.delete(`/announcements/${id}`)
  return response
}

// POST /announcements/:id/archive (propriétaire/agence)
export async function archiveAnnouncement(id) {
  const response = await apiClient.post(`/announcements/${id}/archive`)
  return response
}

// POST /announcements/:id/resubmit (propriétaire/agence)
export async function resubmitAnnouncement(id) {
  const response = await apiClient.post(`/announcements/${id}/resubmit`)
  return response
}

// POST /announcements/:id/approve (admin)
export async function approveAnnouncement(id) {
  const response = await apiClient.post(`/announcements/${id}/approve`)
  return response
}

// POST /announcements/:id/reject (admin)
export async function rejectAnnouncement(id, reason) {
  const response = await apiClient.post(`/announcements/${id}/reject`, { reason })
  return response
}
