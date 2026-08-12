import apiClient from "./client"

// GET /notifications — Liste paginée
export async function getNotifications(params = {}) {
  const response = await apiClient.get("/notifications", { params })
  return response.data
}

// GET /notifications/unread-count — Nombre de notifications non lues
export async function getUnreadCount() {
  const response = await apiClient.get("/notifications/unread-count")
  return response.data
}

// PATCH /notifications/:id/read — Marquer une notification comme lue
export async function markNotificationRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`)
  return response.data
}

// PATCH /notifications/read-all — Tout marquer comme lu
export async function markAllNotificationsRead() {
  const response = await apiClient.patch("/notifications/read-all")
  return response.data
}
