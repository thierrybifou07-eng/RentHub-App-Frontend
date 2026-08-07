import { MOCK_LISTINGS } from "../models/listing"

export async function getAllListings(filters = {}) {
  let results = [...MOCK_LISTINGS]

  if (filters.city) {
    results = results.filter((l) => l.city === filters.city)
  }
  if (filters.type) {
    results = results.filter((l) => l.type === filters.type)
  }
  if (filters.status) {
    results = results.filter((l) => l.status === filters.status)
  }
  if (filters.rooms) {
    results = results.filter((l) => l.rooms === Number(filters.rooms))
  }
  if (filters.budget) {
    const [min, max] = parseBudgetRange(filters.budget)
    results = results.filter((l) => l.price >= min && (max === Infinity ? true : l.price <= max))
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        (l.neighborhood && l.neighborhood.toLowerCase().includes(q)) ||
        (l.description && l.description.toLowerCase().includes(q)),
    )
  }

  return results
}

export async function getListingById(id) {
  return MOCK_LISTINGS.find((l) => l.id === id) || null
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
