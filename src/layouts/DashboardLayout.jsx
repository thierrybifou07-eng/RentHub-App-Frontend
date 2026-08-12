import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { APP_ROUTES } from "../constants/routes"
import { useAuthStore } from "../stores/authStore"
import { useConversationsStore } from "../stores/conversationsStore"
import { startRealtime, stopRealtime } from "../services/realtime"
import NotificationBell from "../components/notifications/NotificationBell"

/* ── Navigation par rôle ────────────────────────────────────── */

const NAV_SECTIONS = {
  tenant: [
    { to: APP_ROUTES.tenantDashboard, label: "Tableau de bord", icon: "🏠" },
    { to: APP_ROUTES.tenantFavorites, label: "Mes favoris",      icon: "❤️" },
    { to: APP_ROUTES.tenantMessages,  label: "Messages",         icon: "💬" },
  ],
  owner: [
    { to: APP_ROUTES.ownerDashboard, label: "Tableau de bord", icon: "📊" },
    { to: APP_ROUTES.ownerListings,  label: "Mes annonces",    icon: "🏡" },
    { to: APP_ROUTES.ownerMessages,  label: "Messages",        icon: "💬" },
  ],
  admin: [
    { to: APP_ROUTES.adminDashboard,   label: "Vue d'ensemble",  icon: "📈" },
    { to: APP_ROUTES.adminModeration,  label: "Modération",      icon: "🔍" },
    { to: APP_ROUTES.adminUsers,       label: "Utilisateurs",    icon: "👥" },
    { to: APP_ROUTES.adminReports,     label: "Signalements",    icon: "🚨" },
    { to: APP_ROUTES.adminSubscriptions, label: "Abonnements",   icon: "💳" },
  ],
}

const SECTION_LABELS = {
  tenant: "Locataire",
  owner:  "Propriétaire",
  admin:  "Administration",
}

const SECTION_COLORS = {
  tenant: { accent: "#10b981", bg: "rgba(16,185,129,0.15)", text: "#a7f3d0" },
  owner:  { accent: "#f59f00", bg: "rgba(245,159,0,0.15)",  text: "#fde68a" },
  admin:  { accent: "#3b82f6", bg: "rgba(59,130,246,0.15)", text: "#bfdbfe" },
}

/* ── Initiales utilisateur ──────────────────────────────────── */

function getInitials(user) {
  if (!user) return "?"
  const first = (user.firstname || user.name || "?")[0] || ""
  const last  = user.lastname ? user.lastname[0] : ""
  return (first + last).toUpperCase() || "?"
}

/* ── Composant ──────────────────────────────────────────────── */

function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const unreadCount = useConversationsStore(s => s.unreadCount)
  const fetchUnreadCount = useConversationsStore(s => s.fetchUnreadCount)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminPending, setAdminPending] = useState({ announcements: 0, reports: 0, subscriptions: 0 })
  const closeTimer = useRef(null)

  // Hover sidebar : ouverture au survol du burger, fermeture à la sortie.
  // Délai de grâce de 150ms pour éviter le clignotement entre burger et menu.
  const openSidebar = () => {
    clearTimeout(closeTimer.current)
    setSidebarOpen(true)
  }
  const scheduleSidebarClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setSidebarOpen(false), 150)
  }
  const closeSidebar = () => {
    clearTimeout(closeTimer.current)
    setSidebarOpen(false)
  }

  useEffect(() => {
    return () => clearTimeout(closeTimer.current)
  }, [])

  // Fetch unread messages periodically
  useEffect(() => {
    if (!user) {
      stopRealtime()
      return
    }
    startRealtime()
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user, fetchUnreadCount])

  // Fetch admin pending counts periodically
  useEffect(() => {
    const role = user?.role?.toLowerCase()
    if (role !== "admin") return

    let active = true
    const fetchAdminCounts = async () => {
      try {
        const { getPendingCounts } = await import("../api/adminApi")
        const data = await getPendingCounts()
        if (active) setAdminPending(data)
      } catch (err) {
        // silent
      }
    }
    
    fetchAdminCounts()
    const interval = setInterval(fetchAdminCounts, 60000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [user])

  const userRole = user?.role?.toLowerCase() || "tenant"
  const links        = user ? NAV_SECTIONS[userRole]   || [] : []
  const sectionLabel = user ? SECTION_LABELS[userRole] || "" : ""
  const colors       = user ? SECTION_COLORS[userRole] || SECTION_COLORS.tenant : SECTION_COLORS.tenant

  // Fermer la sidebar mobile au changement de route
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate(APP_ROUTES.home, { replace: true })
  }

  const sidebarContent = (
    <>
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div style={{
        padding: "24px 20px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <Link
          to={APP_ROUTES.home}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #3a9e6f, #0f5132)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(15,81,50,0.4)",
          }}>
            🏘️
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-lg)",
            fontWeight: 800,
            color: "white",
            letterSpacing: "var(--tracking-tight)",
          }}>
            RentHub
          </span>
        </Link>
      </div>

      {/* ── Badge rôle ─────────────────────────────────────── */}
      <div style={{ padding: "14px 20px 8px" }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: "var(--radius-full)",
          background: colors.bg,
          color: colors.text,
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.accent,
            boxShadow: `0 0 6px ${colors.accent}`,
          }} />
          {sectionLabel}
        </span>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 12px",
      }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {links.map((link) => {
            const active = location.pathname === link.to
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`sidebar-nav-link${active ? " active" : ""}`}
                >
                  <span className="sidebar-nav-icon">{link.icon}</span>
                  {link.label}
                  {link.label === "Messages" && unreadCount > 0 && (
                    <span className="badge bg-danger rounded-pill ms-auto px-2 py-1" style={{ fontSize: "0.7rem" }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {link.label === "Modération" && adminPending.announcements > 0 && (
                    <span className="badge bg-primary rounded-pill ms-auto px-2 py-1" style={{ fontSize: "0.7rem" }}>
                      {adminPending.announcements > 99 ? "99+" : adminPending.announcements}
                    </span>
                  )}
                  {link.label === "Signalements" && adminPending.reports > 0 && (
                    <span className="badge bg-warning text-dark rounded-pill ms-auto px-2 py-1" style={{ fontSize: "0.7rem" }}>
                      {adminPending.reports > 99 ? "99+" : adminPending.reports}
                    </span>
                  )}
                  {link.label === "Abonnements" && adminPending.subscriptions > 0 && (
                    <span className="badge bg-info text-dark rounded-pill ms-auto px-2 py-1" style={{ fontSize: "0.7rem" }}>
                      {adminPending.subscriptions > 99 ? "99+" : adminPending.subscriptions}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Profil utilisateur ─────────────────────────────── */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <Link 
          to={APP_ROUTES.profile} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            textDecoration: "none",
            flex: 1,
            minWidth: 0
          }}
          className="sidebar-profile-link"
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: "var(--tracking-wider)",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(15,81,50,0.5)",
          }}>
            {getInitials(user)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              margin: 0,
              color: "white",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {user?.name || `${user?.firstname || ""} ${user?.lastname || ""}`.trim()}
            </p>
            <p style={{
              margin: 0,
              color: "rgba(255,255,255,0.45)",
              fontSize: "var(--text-xs)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {user?.email}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          title="Se déconnecter"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            color: "rgba(255,255,255,0.55)",
            padding: "6px 8px",
            cursor: "pointer",
            fontSize: 14,
            transition: "background var(--transition-fast), color var(--transition-fast)",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; e.currentTarget.style.color = "#fca5a5" }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)" }}
        >
          ↪
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── Sidebar desktop ────────────────────────────────── */}
      <aside className="dashboard-sidebar d-none d-lg-flex" style={{ flexDirection: "column" }}>
        {sidebarContent}
      </aside>

      {/* ── Sidebar mobile/tablette (hover slide-in) ─────── */}
      <aside
        className="dashboard-sidebar d-flex d-lg-none"
        style={{
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: "var(--z-modal)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms cubic-bezier(0.4,0,0.2,1)",
        }}
        onMouseEnter={openSidebar}
        onMouseLeave={closeSidebar}
      >
        {sidebarContent}
      </aside>

      {/* ── Contenu principal ───────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header className="topbar">
          {/* Bouton burger mobile/tablette (hover + clic secours) */}
          <button
            type="button"
            className="d-lg-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            onMouseEnter={openSidebar}
            onMouseLeave={scheduleSidebarClose}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 18,
              color: "var(--color-text)",
              transition: "background var(--transition-fast)",
            }}
            aria-label="Menu"
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>

          {/* Breadcrumb / titre page */}
          <div style={{ flex: 1 }}>
            <p style={{
              margin: 0,
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-text)",
            }}>
              {sectionLabel}
            </p>
          </div>

          {/* Actions topbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              to={APP_ROUTES.home}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                background: "var(--color-primary-50)",
                color: "var(--color-primary-600)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background var(--transition-fast)",
                border: "1px solid var(--color-primary-100)",
              }}
            >
              🏘️ Accueil
            </Link>

            <NotificationBell />

            <Link 
              to={APP_ROUTES.profile} 
              style={{ textDecoration: "none" }}
            >
              <div className="topbar-avatar" title={user?.email}>
                {getInitials(user)}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main
          className="page-enter"
          style={{ flex: 1, padding: "var(--space-8) var(--space-6)", overflowY: "auto" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
