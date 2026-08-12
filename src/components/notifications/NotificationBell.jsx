import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { APP_ROUTES, getListingDetailPath } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { useNotificationsStore } from "../../stores/notificationsStore"
import { formatRelativeTime } from "../../utils/formatters"

const NOTIFICATION_META = {
  new_message:               { icon: "💬", color: "#3b82f6" },
  new_pending_announcement:  { icon: "🏡", color: "#f59f00" },
  announcement_approved:     { icon: "✅", color: "#10b981" },
  announcement_rejected:     { icon: "❌", color: "#ef4444" },
  announcement_archived:     { icon: "📁", color: "#64748b" },
  new_report:                { icon: "🚨", color: "#ef4444" },
  report_reviewed:           { icon: "📝", color: "#3b82f6" },
  report_dismissed:          { icon: "📭", color: "#64748b" },
  report_action_taken:       { icon: "⚖️", color: "#8b5cf6" },
  new_subscription_request:  { icon: "💳", color: "#f59f00" },
  subscription_activated:    { icon: "✨", color: "#10b981" },
  subscription_rejected:     { icon: "🚫", color: "#ef4444" },
  subscription_failed:       { icon: "⚠️", color: "#ef4444" },
}

function getNotificationTarget(notification, role) {
  const type = notification.type
  const data = notification.data || {}

  switch (type) {
    case "new_message":
      return role === "owner" ? APP_ROUTES.ownerMessages : APP_ROUTES.tenantMessages
    case "new_pending_announcement":
      return APP_ROUTES.adminModeration
    case "new_report":
      return APP_ROUTES.adminReports
    case "new_subscription_request":
      return APP_ROUTES.adminSubscriptions
    case "announcement_approved":
      return data.announcementId ? getListingDetailPath(data.announcementId) : APP_ROUTES.ownerListings
    case "announcement_rejected":
    case "announcement_archived":
      return APP_ROUTES.ownerListings
    case "report_reviewed":
    case "report_dismissed":
    case "report_action_taken":
      return data.announcementId ? getListingDetailPath(data.announcementId) : APP_ROUTES.home
    case "subscription_activated":
    case "subscription_rejected":
    case "subscription_failed":
      return APP_ROUTES.ownerSubscription
    default:
      return APP_ROUTES.home
  }
}

function NotificationBell() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const notifications = useNotificationsStore((s) => s.notifications)
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications)
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  // Fermeture au clic extérieur / touche Échap
  useEffect(() => {
    if (!open) return
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeydown(event) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeydown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeydown)
    }
  }, [open])

  const role = user?.role?.toLowerCase() || "tenant"

  function handleSelect(notification) {
    setOpen(false)
    if (!notification.is_read) markRead(notification.id)
    const target = getNotificationTarget(notification, role)
    if (notification.type === "new_message" && notification.data?.conversationId) {
      navigate(`${target}?conversation=${notification.data.conversationId}`)
    } else {
      navigate(target)
    }
  }

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span className="notification-panel-title">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className="notification-mark-all" onClick={markAllRead}>
                Tout marquer comme lu
              </button>
            )}
          </div>

          <ul className="notification-list">
            {notifications.length === 0 && (
              <li className="notification-empty">Aucune notification</li>
            )}
            {notifications.slice(0, 20).map((notification) => {
              const meta = NOTIFICATION_META[notification.type] || { icon: "🔔", color: "#64748b" }
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    className={`notification-item${notification.is_read ? "" : " unread"}`}
                    onClick={() => handleSelect(notification)}
                  >
                    <span
                      className="notification-item-icon"
                      style={{ background: `${meta.color}1a`, color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                    <span className="notification-item-content">
                      <span className="notification-item-title">{notification.title}</span>
                      {notification.body && (
                        <span className="notification-item-body">{notification.body}</span>
                      )}
                      <span className="notification-item-time">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
