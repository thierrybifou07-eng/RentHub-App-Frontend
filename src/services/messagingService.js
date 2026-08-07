import {
  startConversation as apiStartConversation,
  getConversations,
  getMessages,
  sendMessage as apiSendMessage
} from "../api/conversationsApi"

export async function getConversationsByUser(userId) {
  // Le backend s'occupe de filtrer par utilisateur connecté, on passe juste des params si besoin
  const res = await getConversations()
  // Normaliser pour renvoyer le tableau
  return res.items || res || []
}

export async function getMessagesByConversation(conversationId) {
  const res = await getMessages(conversationId)
  return res.items || res || []
}

export async function sendMessage(conversationId, senderId, text) {
  // senderId n'est plus utile, le backend sait qui envoie le message via le token
  const res = await apiSendMessage(conversationId, text)
  return res
}

export async function startConversation(listingId, senderId, receiverId, content) {
  // L'API attend announcementId et content. 
  // senderId/receiverId sont gérés par le backend.
  const res = await apiStartConversation({ announcementId: listingId, content })
  return res
}

