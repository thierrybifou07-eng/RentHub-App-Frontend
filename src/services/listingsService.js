import { getAnnouncements, getAnnouncementById as fetchAnnouncement } from "../api/announcementsApi"

export async function getAllListings(filters = {}) {
  // Adaptation des filtres frontend (string/budget) en query params API
  const params = {
    search: filters.search || undefined,
    city_id: filters.city || filters.city_id || undefined, // peut nécessiter une adaptation côté composant si "city" est un nom
    property_type_id: filters.type || filters.property_type_id || undefined,
    sort: filters.sort || "newest",
    page: filters.page || 1,
    limit: filters.limit || 20,
  }

  if (filters.rooms) {
    params.minRooms = Number(filters.rooms)
  }

  if (filters.budget) {
    const [min, max] = parseBudgetRange(filters.budget)
    if (min > 0) params.minPrice = min
    if (max < Infinity) params.maxPrice = max
  }

  const response = await getAnnouncements(params)
  // apiClient retourne directement les data selon l'intercepteur, 
  // on retourne la propriété attendue (souvent response.data, response.items, etc.)
  // L'API renvoie { status, data: { items, meta } } ou { data: [...] }
  return response.data?.items || response.data || []
}

export async function getListingById(id) {
  try {
    const response = await fetchAnnouncement(id)
    // L'API renvoie { announcement, owner } ; on extrait l'annonce
    return response?.announcement || response || null
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

function parseBudgetRange(value) {
  const ranges = {
    "0-50000": [0, 50000],
    "50000-150000": [50000, 150000],
    "150000-300000": [150000, 300000],
    "300000-plus": [300000, Infinity],
  }
  return ranges[value] || [0, Infinity]
}
