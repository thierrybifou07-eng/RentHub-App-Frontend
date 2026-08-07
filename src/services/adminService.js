import { MOCK_USERS } from "../models/user.js"
import { MOCK_LISTINGS } from "../models/listing.js"
import { MOCK_CONVERSATIONS } from "../models/conversation.js"
import { MOCK_REPORTS } from "../models/report.js"
import { updateListingStatus } from "./ownerService.js"

export async function getDashboardStats() {
  await new Promise((r) => setTimeout(r, 100))
  return {
    users: MOCK_USERS.length,
    publishedListings: MOCK_LISTINGS.filter((l) => l.status === "published")
      .length,
    pendingReports: MOCK_REPORTS.filter((r) => r.status === "pending").length,
    activeConversations: MOCK_CONVERSATIONS.length,
  }
}

export async function getAllUsers() {
  await new Promise((r) => setTimeout(r, 150))
  return MOCK_USERS.map((u) => ({ ...u }))
}

export async function banUser(userId) {
  await new Promise((r) => setTimeout(r, 100))
  const user = MOCK_USERS.find((u) => u.id === userId)
  if (!user) throw new Error("Utilisateur introuvable")
  user.status = "banned"
  return user
}

export async function unbanUser(userId) {
  await new Promise((r) => setTimeout(r, 100))
  const user = MOCK_USERS.find((u) => u.id === userId)
  if (!user) throw new Error("Utilisateur introuvable")
  user.status = "active"
  return user
}

export async function changeUserRole(userId, newRole) {
  await new Promise((r) => setTimeout(r, 100))
  const user = MOCK_USERS.find((u) => u.id === userId)
  if (!user) throw new Error("Utilisateur introuvable")
  user.role = newRole
  return user
}

export async function getModerationListings() {
  await new Promise((r) => setTimeout(r, 150))
  return MOCK_LISTINGS.filter(
    (l) => l.status === "pending" || l.status === "rejected"
  )
}

export async function approveListing(listingId) {
  return updateListingStatus(listingId, "published")
}

export async function rejectListing(listingId) {
  return updateListingStatus(listingId, "rejected")
}

export async function deleteListing(listingId) {
  await new Promise((r) => setTimeout(r, 100))
  const idx = MOCK_LISTINGS.findIndex((l) => l.id === listingId)
  if (idx === -1) throw new Error("Annonce introuvable")
  MOCK_LISTINGS.splice(idx, 1)
  return true
}

export async function getReports() {
  await new Promise((r) => setTimeout(r, 150))
  return [...MOCK_REPORTS]
}

export async function resolveReport(reportId) {
  await new Promise((r) => setTimeout(r, 100))
  const report = MOCK_REPORTS.find((r) => r.id === reportId)
  if (!report) throw new Error("Signalement introuvable")
  report.status = "resolved"
  return report
}

export async function dismissReport(reportId) {
  await new Promise((r) => setTimeout(r, 100))
  const report = MOCK_REPORTS.find((r) => r.id === reportId)
  if (!report) throw new Error("Signalement introuvable")
  report.status = "dismissed"
  return report
}
