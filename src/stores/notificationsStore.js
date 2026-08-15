import { create } from "zustand"
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationsApi"

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  async fetchNotifications(params = {}) {
    set({ loading: true })
    try {
      const data = await getNotifications(params)
      set({ notifications: data || [] })
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      set({ loading: false })
    }
  },

  async fetchUnreadCount() {
    try {
      const data = await getUnreadCount()
      const count = typeof data.count !== "undefined" ? data.count : (data || 0)
      set({ unreadCount: count })
    } catch (err) {
      console.error("Failed to fetch notification count:", err)
    }
  },

  async markRead(id) {
    try {
      await markNotificationRead(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          String(n.id) === String(id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ),
      }))
      get().fetchUnreadCount()
    } catch (err) {
      console.error("Failed to mark notification read:", err)
    }
  },

  /** Marque la notification comme lue côté serveur puis la retire de la liste. */
  async removeNotification(id) {
    const target = get().notifications.find((n) => String(n.id) === String(id))
    const wasUnread = target && !target.is_read
    try {
      await markNotificationRead(id)
    } catch (err) {
      console.error("Failed to mark notification read:", err)
    }
    set((state) => ({
      notifications: state.notifications.filter((n) => String(n.id) !== String(id)),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }))
  },

  /** Retire toutes les notifications "new_message" d'une conversation (lecture directe du chat). */
  async clearConversationNotifications(conversationId) {
    const matches = get().notifications.filter(
      (n) => n.type === "new_message" && String(n.data?.conversationId) === String(conversationId)
    )
    if (matches.length === 0) return
    const unreadRemoved = matches.filter((n) => !n.is_read).length
    matches.forEach((n) => {
      markNotificationRead(n.id).catch((err) => console.error("Failed to mark notification read:", err))
    })
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => !matches.some((m) => String(m.id) === String(n.id))
      ),
      unreadCount: Math.max(0, state.unreadCount - unreadRemoved),
    }))
  },

  async markAllRead() {
    try {
      await markAllNotificationsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })),
        unreadCount: 0,
      }))
    } catch (err) {
      console.error("Failed to mark all notifications read:", err)
    }
  },

  /** Notification reçue en temps réel (événement "notification:new"). */
  handleIncomingNotification(notification) {
    if (!notification) return
    set((state) => {
      const exists = state.notifications.some((n) => String(n.id) === String(notification.id))
      if (exists) return state
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }
    })
  },
}))
