import apiClient from "./client"

// POST /conversations — Démarrer une nouvelle conversation
export async function startConversation(data) {
  // data: { announcementId, content }
  const response = await apiClient.post("/conversations", data)
  return response.data
}

// GET /conversations — Liste des conversations
export async function getConversations(params = {}) {
  const response = await apiClient.get("/conversations", { params })
  return response.data
}

// GET /conversations/unread-count — Compteur de messages non lus
export async function getUnreadCount() {
  const response = await apiClient.get("/conversations/unread-count")
  return response.data
}

// GET /conversations/:id/messages — Liste des messages d'une conversation (les marque comme lus)
export async function getMessages(conversationId, params = {}) {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`, { params })
  return response.data
}

// POST /conversations/:id/messages — Envoyer un message
export async function sendMessage(conversationId, content) {
  const response = await apiClient.post(`/conversations/${conversationId}/messages`, { content })
  return response.data
}
