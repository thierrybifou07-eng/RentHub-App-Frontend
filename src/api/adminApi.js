import apiClient from "./client"

export async function getStats() {
  const response = await apiClient.get("/admin/stats")
  return response.data || response
}

export async function getStatsEvolution(days = 30) {
  const response = await apiClient.get("/admin/stats/evolution", { params: { days } })
  return response.data || response
}

export async function getPendingCounts() {
  const response = await apiClient.get("/admin/pending-counts")
  return response.data || response
}

export async function getRecentActivity() {
  const response = await apiClient.get("/admin/recent-activity")
  return response.data || response
}

export async function manageAnnouncementStatus(id, newStatus) {
  const response = await apiClient.patch(`/admin/manage-announcements-status/${id}`, { newStatus })
  return response.data || response
}

export async function manageUserStatus({ userId, currentStatus, newStatus }) {
  const response = await apiClient.patch(`/admin/users/${userId}/status`, { currentStatus, newStatus })
  return response.data || response
}

export async function manageUserRole({ userId, currentRole, newRole }) {
  const response = await apiClient.patch(`/admin/users/${userId}/role`, { currentRole, newRole })
  return response.data || response
}

export async function verifyUser(userId) {
  const response = await apiClient.patch(`/admin/users/${userId}/verify`)
  return response.data || response
}

export async function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient.get(`/admin/users?${query}`)
  return { items: response.data || [], pagination: response.pagination || {} }
}

export async function getUserById(id) {
  const response = await apiClient.get(`/admin/users/${id}`)
  return response.data || response
}

export async function getModerationListingById(id) {
  const response = await apiClient.get(`/announcements/admin/${id}`)
  return response.data || response
}
