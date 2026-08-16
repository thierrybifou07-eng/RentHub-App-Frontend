import { create } from "zustand"
import { getConversations, getUnreadCount, getMessages, sendMessage } from "../api/conversationsApi"
import { useAuthStore } from "./authStore"

export const useConversationsStore = create((set, get) => ({
  conversations: [],
  unreadCount: 0,
  activeConversation: null,
  activeMessages: [],
  // Métadonnées de pagination du fil ouvert (page = dernière page chargée, ordre DESC côté API)
  messagesMeta: { page: 0, limit: 50, total: 0, totalPages: 0 },
  loadingOlder: false,

  async fetchConversations(params = {}) {
    try {
      const data = await getConversations(params)
      set({ conversations: data || [] })
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
    }
  },

  async fetchUnreadCount() {
    if (!useAuthStore.getState().isAuthenticated) return
    try {
      const data = await getUnreadCount()
      // API might return { count: X } or just the number
      const count = typeof data.count !== "undefined" ? data.count : (data || 0)
      set({ unreadCount: count })
    } catch (err) {
      console.error("Failed to fetch unread count:", err)
    }
  },

  async openConversation(conversationId) {
    // Set active conversation from list if possible
    const conv = get().conversations.find(c => c.id === conversationId)
    set({
      activeConversation: conv || { id: conversationId },
      activeMessages: [],
      messagesMeta: { page: 0, limit: 50, total: 0, totalPages: 0 },
      loadingOlder: false,
    })

    try {
      const { messages, pagination } = await getMessages(conversationId, { page: 1, limit: 50 })
      // L'API renvoie les plus récents d'abord ; on inverse pour afficher du plus ancien au plus récent.
      set({
        activeMessages: [...messages].reverse(),
        messagesMeta: {
          page: 1,
          limit: 50,
          total: pagination?.total ?? 0,
          totalPages: pagination?.totalPages ?? 0,
        },
      })

      // Update unread count as the API marks them read
      get().fetchUnreadCount()
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  },

  /**
   * Charge la page suivante (messages plus anciens) et les préfixe dans le fil.
   */
  async loadOlderMessages(conversationId) {
    const { page, limit, totalPages } = get().messagesMeta
    if (!conversationId || get().loadingOlder || page >= totalPages) return
    set({ loadingOlder: true })
    try {
      const nextPage = page + 1
      const { messages, pagination } = await getMessages(conversationId, { page: nextPage, limit })
      // Le lot (DESC) est inversé pour l'affichage puis inséré devant le fil existant (ASC).
      const older = [...messages].reverse()
      set(state => ({
        activeMessages: [...older, ...state.activeMessages],
        messagesMeta: {
          page: pagination?.page ?? nextPage,
          limit,
          total: pagination?.total ?? state.messagesMeta.total,
          totalPages: pagination?.totalPages ?? totalPages,
        },
      }))
    } catch (err) {
      console.error("Failed to load older messages:", err)
    } finally {
      set({ loadingOlder: false })
    }
  },

  closeConversation() {
    set({ activeConversation: null, activeMessages: [] })
  },

  /**
   * Message reçu en temps réel (événement "message:new").
   * Si la conversation est ouverte : append (sans doublon).
   * Sinon : on rafraîchit la liste + le compteur non-lus.
   */
  handleIncomingMessage({ conversationId, message }) {
    if (!message) return
    const state = get()
    const isActive =
      state.activeConversation &&
      String(state.activeConversation.id) === String(conversationId)

    if (isActive) {
      const exists = state.activeMessages.some(
        (m) => String(m.id) === String(message.id)
      )
      if (!exists) {
        set({ activeMessages: [...state.activeMessages, message] })
      }
      get().fetchUnreadCount()
    } else {
      get().fetchUnreadCount()
      get().fetchConversations()
    }
  },

  async sendMessage(conversationId, content) {
    try {
      const msgData = await sendMessage(conversationId, content)
      // Optimistic or real append
/*       const msgData = newMsg?.data || newMsg
 */      set(state => ({
        activeMessages: [...state.activeMessages, msgData]
      }))
      return msgData
    } catch (err) {
      console.error("Failed to send message:", err)
      throw err
    }
  },
}))
