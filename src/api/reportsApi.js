import apiClient from "./client"

// POST /reports — Créer un signalement
export async function createReport(data) {
  // data: { announcementId, reason }
  const response = await apiClient.post("/reports", data)
  return response.data || response
}

export async function getAdminReports(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient.get(`/admin/reports?${query}`)
  return response.data || response
}

export async function getAdminReportById(id) {
  const response = await apiClient.get(`/admin/reports/${id}`)
  return response.data || response
}

export async function reviewReport(id) {
  const response = await apiClient.post(`/admin/reports/${id}/review`)
  return response.data || response
}

export async function dismissReport(id, adminNote) {
  const response = await apiClient.post(`/admin/reports/${id}/dismiss`, { adminNote })
  return response.data || response
}

export async function takeActionReport(id, adminNote) {
  const response = await apiClient.post(`/admin/reports/${id}/take-action`, { adminNote })
  return response.data || response
}
