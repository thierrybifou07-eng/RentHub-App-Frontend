export const MOCK_CONVERSATIONS = [
  {
    id: "conv-1",
    listingId: "listing-1",
    participants: ["user-4", "user-2"],
    createdAt: "2025-07-12T09:00:00Z",
  },
  {
    id: "conv-2",
    listingId: "listing-3",
    participants: ["user-5", "user-2"],
    createdAt: "2025-07-14T14:30:00Z",
  },
  {
    id: "conv-3",
    listingId: "listing-6",
    participants: ["user-4", "user-3"],
    createdAt: "2025-07-16T11:00:00Z",
  },
]

export function getConversationsByUser(userId) {
  return MOCK_CONVERSATIONS.filter((c) => c.participants.includes(userId))
}

export function getConversationsByListing(listingId) {
  return MOCK_CONVERSATIONS.filter((c) => c.listingId === listingId)
}

export function getConversationById(id) {
  return MOCK_CONVERSATIONS.find((c) => c.id === id) || null
}

export function createConversation(listingId, senderId, receiverId) {
  const existing = MOCK_CONVERSATIONS.find(
    (c) =>
      c.listingId === listingId &&
      c.participants.includes(senderId) &&
      c.participants.includes(receiverId),
  )
  if (existing) return existing

  const newConv = {
    id: `conv-${MOCK_CONVERSATIONS.length + 1}`,
    listingId,
    participants: [senderId, receiverId],
    createdAt: new Date().toISOString(),
  }
  MOCK_CONVERSATIONS.push(newConv)
  return newConv
}
