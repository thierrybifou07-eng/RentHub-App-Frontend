import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { APP_ROUTES } from "../constants/routes"
import { useAuthStore } from "../stores/authStore"
import { Building2, Menu, X } from "lucide-react"
import AppFooter from "../components/common/AppFooter"

const ROLE_DASHBOARD_ROUTE = {
  tenant: APP_ROUTES.tenantDashboard,
  owner:  APP_ROUTES.ownerDashboard,
  admin:  APP_ROUTES.adminDashboard,
}

const ROLE_DASHBOARD_LABEL = {
  tenant: "Mon espace",
  owner:  "Mon espace",
  admin:  "Administration",
}

const NAV_LINKS = [
  { to: APP_ROUTES.listings, label: "Annonces" },
]

function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const closeTimer = useRef(null)

  // Hover menu mobile : ouverture au survol du burger, fermeture à la sortie.
  // Délai de grâce de 150ms pour éviter le clignotement entre burger et menu.
  const openMenu = () => {
    clearTimeout(closeTimer.current)
    setMobileOpen(true)
  }
  const scheduleMenuClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setMobileOpen(false), 150)
  }
  const closeMenu = () => {
    clearTimeout(closeTimer.current)
    setMobileOpen(false)
  }

  useEffect(() => {
    return () => clearTimeout(closeTimer.current)
  }, [])

  // Navbar scroll effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Fermer le menu mobile au changement de route
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate(APP_ROUTES.home, { replace: true })
  }

  function getInitials(u) {
    if (!u) return "?"
    const first = (u.firstname || u.name || "?")[0] || ""
    const last  = u.lastname ? u.lastname[0] : ""
    return (first + last).toUpperCase() || "?"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav
        className={`navbar-renthub${scrolled ? " scrolled" : ""}`}
        style={{
          position: "sticky",
          top: 0,
          zIndex: "var(--z-sticky)",
          padding: "0 max(20px, calc((100% - 1200px) / 2))",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          height: 64,
          gap: "var(--space-6)",
        }}>

          {/* Logo */}
          <Link to={APP_ROUTES.home} className="navbar-renthub" style={{ border: "none", boxShadow: "none" }}>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}>
              <span style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                boxShadow: "0 2px 8px rgba(15,81,50,0.30)",
                flexShrink: 0,
              }}><Building2 size={18} color="#fff" /></span>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl)",
                fontWeight: 800,
                background: "var(--gradient-text-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "var(--tracking-tight)",
              }}>
                RentHub
              </span>
            </span>
          </Link>

          {/* Nav links desktop */}
          <div
            className="d-none d-lg-flex"
            style={{ alignItems: "center", gap: "var(--space-1)", flex: 1 }}
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link-custom${location.pathname === link.to ? " active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} className="d-lg-none" />

          {/* Actions desktop */}
          <div className="d-none d-lg-flex" style={{ alignItems: "center", gap: "var(--space-3)" }}>
            {isAuthenticated ? (
              <>
                <Link
                  to={ROLE_DASHBOARD_ROUTE[user?.role] || APP_ROUTES.home}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-primary-50)",
                    color: "var(--color-primary-600)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1.5px solid var(--color-primary-100)",
                    transition: "background var(--transition-fast), border-color var(--transition-fast)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary-100)"; e.currentTarget.style.borderColor = "var(--color-primary-300)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--color-primary-50)"; e.currentTarget.style.borderColor = "var(--color-primary-100)" }}
                >
                  {ROLE_DASHBOARD_LABEL[user?.role] || "Mon espace"}
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: "var(--radius-full)",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    letterSpacing: "var(--tracking-wider)",
                    cursor: "default",
                    boxShadow: "var(--shadow-sm)",
                  }}>
                    {getInitials(user)}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-full)",
                      background: "transparent",
                      color: "var(--color-text-muted)",
                      border: "1.5px solid var(--color-border)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "border-color var(--transition-fast), color var(--transition-fast)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-danger)"; e.currentTarget.style.color = "var(--color-danger)" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)" }}
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to={APP_ROUTES.login}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "var(--radius-full)",
                    background: "transparent",
                    color: "var(--color-primary-600)",
                    border: "1.5px solid var(--color-primary-200)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background var(--transition-fast), border-color var(--transition-fast)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary-50)"; e.currentTarget.style.borderColor = "var(--color-primary-400)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--color-primary-200)" }}
                >
                  Connexion
                </Link>
                <Link
                  to={APP_ROUTES.register}
                  className="btn-primary-gradient"
                  style={{ textDecoration: "none" }}
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button
            type="button"
            className="d-lg-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleMenuClose}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "7px 10px",
              cursor: "pointer",
              fontSize: 18,
              color: "var(--color-text)",
              lineHeight: 1,
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* ── Menu mobile dropdown ──────────────────────────── */}
        {mobileOpen && (
          <div
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
            style={{
              borderTop: "1px solid var(--color-border)",
              padding: "var(--space-4)",
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "var(--glass-blur-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              animation: "slide-in-top 200ms ease-out both",
            }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link-custom${location.pathname === link.to ? " active" : ""}`}
                style={{ display: "block" }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ height: 1, background: "var(--color-border)", margin: "var(--space-2) 0" }} />

            {isAuthenticated ? (
              <>
                <Link
                  to={ROLE_DASHBOARD_ROUTE[user?.role] || APP_ROUTES.home}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-primary-50)",
                    color: "var(--color-primary-600)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  {ROLE_DASHBOARD_LABEL[user?.role] || "Mon espace"}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-danger-light)",
                    color: "var(--color-danger-dark)",
                    border: "none",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to={APP_ROUTES.login}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--color-primary-200)",
                    color: "var(--color-primary-600)",
                    textDecoration: "none",
                    display: "block",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Connexion
                </Link>
                <Link
                  to={APP_ROUTES.register}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--gradient-primary)",
                    color: "white",
                    textDecoration: "none",
                    display: "block",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Contenu ───────────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <AppFooter />
    </div>
  )
}

export default PublicLayout
