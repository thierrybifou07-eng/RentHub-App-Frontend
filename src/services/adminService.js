import * as adminApi from "../api/adminApi"
import * as announcementsApi from "../api/announcementsApi"

export async function getDashboardStats() {
  return adminApi.getStats()
}

export async function getAllUsers(params = {}) {
  return adminApi.getUsers(params)
}

export async function banUser(userId) {
  // Optionnel : passer par currentStatus si l'API l'exige
  return adminApi.manageUserStatus({ userId, currentStatus: "ACTIVE", newStatus: "BANNED" })
}

export async function unbanUser(userId) {
  return adminApi.manageUserStatus({ userId, currentStatus: "BANNED", newStatus: "ACTIVE" })
}

export async function changeUserRole(userId, newRole) {
  return adminApi.manageUserRole({ userId, currentRole: "ANY", newRole })
}

export async function getModerationListings() {
  return announcementsApi.getPendingAnnouncements()
}

export async function approveListing(listingId) {
  return announcementsApi.approveAnnouncement(listingId)
}

export async function rejectListing(listingId, reason = "Non conforme") {
  return announcementsApi.rejectAnnouncement(listingId, reason)
}

export async function deleteListing(listingId) {
  return announcementsApi.deleteAnnouncement(listingId)
}
