import apiClient from "./client"

// ── Audit Logs ──────────────────────────────────────────────────

export async function getAuditLogs(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient.get(`/super-admin/audit-logs?${query}`)
  return { items: response.data || [], pagination: response.pagination || {} }
}

export async function getAuditLogById(id) {
  const response = await apiClient.get(`/super-admin/audit-logs/${id}`)
  return response.data || response
}

export async function getAuditStats() {
  const response = await apiClient.get(`/super-admin/audit-logs/stats`)
  return response.data || response
}

// ── User Management ─────────────────────────────────────────────

export async function getUsersAllRoles(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient.get(`/super-admin/users?${query}`)
  return { items: response.data || [], pagination: response.pagination || {} }
}

export async function getSuperUserDetail(id) {
  const response = await apiClient.get(`/super-admin/users/${id}`)
  return response.data || response
}

export async function changeUserRole(id, newRoleId) {
  const response = await apiClient.patch(`/super-admin/users/${id}/role`, { newRoleId })
  return response.data || response
}

export async function changeUserStatus(id, newStatusId) {
  const response = await apiClient.patch(`/super-admin/users/${id}/status`, { newStatusId })
  return response.data || response
}

export async function adminResetPassword(id) {
  const response = await apiClient.patch(`/super-admin/users/${id}/password-reset`)
  return response.data || response
}

export async function softDeleteUser(id) {
  const response = await apiClient.delete(`/super-admin/users/${id}`)
  return response.data || response
}
