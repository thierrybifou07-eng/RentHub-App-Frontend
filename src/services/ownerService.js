import {
  getMyAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  resubmitAnnouncement,
} from "../api/announcementsApi"
import { ANNOUNCEMENT_STATUS } from "../constants/apiStatuses"

export async function getOwnerListings(params = {}) {
  const response = await getMyAnnouncements(params)
  // L'enveloppe paginée du backend : { status, data: rows, pagination }
  return { items: response.data || [], pagination: response.pagination || {} }
}

export async function createListing(data) {
  // data peut être un objet JSON simple ou un FormData si images
  const response = await createAnnouncement(data)
  return response.data
}

export async function updateListing(listingId, data) {
  const response = await updateAnnouncement(listingId, data)
  return response.data
}

export async function removeListing(listingId) {
  await deleteAnnouncement(listingId)
}

export async function updateListingStatus(listingId, statusId) {
  // statusId correspond aux id de ANNOUNCEMENT_STATUS
  if (statusId === ANNOUNCEMENT_STATUS.ARCHIVED.id) {
    const response = await archiveAnnouncement(listingId)
    return response.data
  } else if (statusId === ANNOUNCEMENT_STATUS.PENDING_REVIEW.id) {
    const response = await resubmitAnnouncement(listingId)
    return response.data
  } else {
    throw new Error("Action non supportée par le propriétaire pour ce statut.")
  }
}
