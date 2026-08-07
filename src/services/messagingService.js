import { MOCK_CONVERSATIONS } from "../models/conversation"
import { MOCK_MESSAGES, sendMessage as mockSendMessage } from "../models/message"
import { getListingById } from "../models/listing"
import { getUserById } from "../models/user"

export async function getConversationsByUser(userId) {
  const conversations = MOCK_CONVERSATIONS.filter((c) => c.participants.includes(userId))

  return conversations.map((conv) => {
    const listing = getListingById(conv.listingId)
    const otherParticipantId = conv.participants.find((p) => p !== userId)
    const otherParticipant = getUserById(otherParticipantId)

    const messages = MOCK_MESSAGES.filter((m) => m.conversationId === conv.id)
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

    return {
      ...conv,
      listing: listing ? { id: listing.id, title: listing.title, city: listing.city } : null,
      otherParticipant: otherParticipant
        ? { id: otherParticipant.id, name: otherParticipant.name }
        : null,
      lastMessage: lastMessage ? { text: lastMessage.text, createdAt: lastMessage.createdAt } : null,
    }
  })
}

export async function getMessagesByConversation(conversationId) {
  return MOCK_MESSAGES.filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((msg) => {
      const sender = getUserById(msg.senderId)
      return {
        ...msg,
        senderName: sender ? sender.name : "Inconnu",
      }
    })
}

export async function sendMessage(conversationId, senderId, text) {
  return mockSendMessage(conversationId, senderId, text)
}

export async function startConversation(listingId, senderId, receiverId) {
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
