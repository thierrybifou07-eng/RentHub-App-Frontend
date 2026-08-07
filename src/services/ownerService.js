import { MOCK_LISTINGS, getListingsByOwner } from "../models/listing"

let nextId = MOCK_LISTINGS.length + 1

export async function getOwnerListings(ownerId) {
  return getListingsByOwner(ownerId)
}

export async function createListing(data, ownerId) {
  const listing = {
    id: `listing-${nextId++}`,
    title: data.title,
    type: data.type,
    price: data.price,
    city: data.city,
    neighborhood: data.neighborhood,
    rooms: data.rooms,
    status: "draft",
    image: null,
    description: data.description,
    ownerId,
    createdAt: new Date().toISOString(),
  }
  MOCK_LISTINGS.push(listing)
  return listing
}

export async function updateListing(listingId, data) {
  const idx = MOCK_LISTINGS.findIndex((l) => l.id === listingId)
  if (idx === -1) throw new Error("Annonce introuvable")
  MOCK_LISTINGS[idx] = { ...MOCK_LISTINGS[idx], ...data }
  return MOCK_LISTINGS[idx]
}

export async function deleteListing(listingId) {
  const idx = MOCK_LISTINGS.findIndex((l) => l.id === listingId)
  if (idx === -1) throw new Error("Annonce introuvable")
  MOCK_LISTINGS.splice(idx, 1)
}

export async function updateListingStatus(listingId, status) {
  const idx = MOCK_LISTINGS.findIndex((l) => l.id === listingId)
  if (idx === -1) throw new Error("Annonce introuvable")
  MOCK_LISTINGS[idx].status = status
  return MOCK_LISTINGS[idx]
}
