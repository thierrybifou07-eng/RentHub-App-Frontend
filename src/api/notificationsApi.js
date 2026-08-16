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

// DELETE /notifications/:id — Supprimer une notification (après lecture)
export async function deleteNotification(id) {
  const response = await apiClient.delete(`/notifications/${id}`)
  return response.data
}

// DELETE /notifications/read-all — Supprimer toutes les notifications
export async function deleteAllNotifications() {
  const response = await apiClient.delete("/notifications/read-all")
  return response.data
}
