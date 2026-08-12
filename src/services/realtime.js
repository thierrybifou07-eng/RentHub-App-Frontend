import { connectSocket, disconnectSocket, onSocketEvent } from "./socketService"
import { useConversationsStore } from "../stores/conversationsStore"

let wired = false

/**
 * Abonne une seule fois les événements socket aux stores de l'application.
 */
function wireEvents() {
  if (wired) return
  wired = true

  onSocketEvent("connect", () => {
    useConversationsStore.getState().fetchUnreadCount()
    useConversationsStore.getState().fetchConversations()
  })

  onSocketEvent("message:new", (payload) => {
    useConversationsStore.getState().handleIncomingMessage(payload)
  })

  onSocketEvent("conversation:new", () => {
    useConversationsStore.getState().fetchConversations()
    useConversationsStore.getState().fetchUnreadCount()
  })
}

/** Démarre la connexion temps réel et branche les événements. */
export function startRealtime() {
  wireEvents()
  connectSocket()
}

/** Arrête la connexion temps réel (déconnexion utilisateur). */
export function stopRealtime() {
  disconnectSocket()
}
