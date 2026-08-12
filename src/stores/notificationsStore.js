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
