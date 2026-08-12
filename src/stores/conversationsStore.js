import { create } from "zustand"
import { getConversations, getUnreadCount, getMessages, sendMessage } from "../api/conversationsApi"
import { useAuthStore } from "./authStore"
import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_NETWORK_BASE_URL || "http://localhost:3000"

export const useConversationsStore = create((set, get) => ({
  conversations: [],
  unreadCount: 0,
  activeConversation: null,
  activeMessages: [],
  socket: null,

  connectSocket: (userId) => {
    if (get().socket) return;
    
    const socket = io(SOCKET_URL);
    
    socket.on("connect", () => {
      socket.emit("authenticate", userId);
    });

    socket.on("new_message", (message) => {
      const { activeConversation, activeMessages } = get();
      
      const convId = message.conversation_id || message.conversationId;
      if (activeConversation && activeConversation.id === convId) {
        set({ activeMessages: [...activeMessages, message] });
        get().fetchUnreadCount();
      } else {
        get().fetchUnreadCount();
        get().fetchConversations();
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

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
    set({ activeConversation: conv || { id: conversationId }, activeMessages: [] })

    try {
      const data = await getMessages(conversationId)
      const messages = data || []
      set({ activeMessages: messages })

      // Update unread count as the API marks them read
      get().fetchUnreadCount()
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  },

  closeConversation() {
    set({ activeConversation: null, activeMessages: [] })
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
