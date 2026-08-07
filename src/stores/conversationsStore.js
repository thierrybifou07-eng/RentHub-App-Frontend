import { create } from "zustand"
import { getConversations, getUnreadCount, getMessages, sendMessage } from "../api/conversationsApi"
import { useAuthStore } from "./authStore"

export const useConversationsStore = create((set, get) => ({
  conversations: [],
  unreadCount: 0,
  activeConversation: null,
  activeMessages: [],

  async fetchConversations(params = {}) {
    try {
      const data = await getConversations(params)
      const items = data?.items || data || []
      set({ conversations: items })
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
    set({ activeConversation: conv || { id: conversationId }, activeMessages: [] })
    
    try {
      const data = await getMessages(conversationId)
      const messages = data?.items || data || []
      set({ activeMessages: messages })
      
      // Update unread count as the API marks them read
      get().fetchUnreadCount()
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  },

  async sendMessage(conversationId, content) {
    try {
      const newMsg = await sendMessage(conversationId, content)
      // Optimistic or real append
      const msgData = newMsg?.data || newMsg
      set(state => ({
        activeMessages: [...state.activeMessages, msgData]
      }))
      return msgData
    } catch (err) {
      console.error("Failed to send message:", err)
      throw err
    }
  },
}))
