import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../constants/routes"
import { useAuthStore } from "../stores/authStore"

const NAV_SECTIONS = {
  tenant: [
    { to: APP_ROUTES.tenantDashboard, label: "Tableau de bord" },
    { to: APP_ROUTES.tenantFavorites, label: "Favoris" },
    { to: APP_ROUTES.tenantMessages, label: "Messages" },
  ],
  owner: [
    { to: APP_ROUTES.ownerDashboard, label: "Tableau de bord" },
    { to: APP_ROUTES.ownerListings, label: "Mes annonces" },
    { to: APP_ROUTES.ownerMessages, label: "Messages" },
  ],
  admin: [
    { to: APP_ROUTES.adminDashboard, label: "Tableau de bord" },
    { to: APP_ROUTES.adminModeration, label: "Mod\u00e9ration" },
    { to: APP_ROUTES.adminUsers, label: "Utilisateurs" },
    { to: APP_ROUTES.adminReports, label: "Signalements" },
  ],
}

const SECTION_LABELS = {
  tenant: "Locataire",
  owner: "Propri\u00e9taire",
  admin: "Administration",
}

function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate(APP_ROUTES.home, { replace: true })
  }

  const links = user ? NAV_SECTIONS[user.role] || [] : []
  const sectionLabel = user ? SECTION_LABELS[user.role] || "" : ""

  return (
    <div className="d-flex min-vh-100">
      <aside className="dashboard-sidebar bg-dark text-white d-flex flex-column">
        <div className="p-3 border-bottom border-secondary">
          <Link to={APP_ROUTES.home} className="text-white text-decoration-none fw-bold h5 mb-0">
            RentHub
          </Link>
        </div>

        <nav className="flex-grow-1 overflow-auto p-3">
          {sectionLabel && (
            <h6 className="text-uppercase text-secondary small fw-semibold mb-2">
              {sectionLabel}
            </h6>
          )}
          <ul className="nav flex-column gap-1">
            {links.map((link) => {
              const active = location.pathname === link.to
              return (
                <li key={link.to} className="nav-item">
                  <Link
                    className={`nav-link rounded px-3 py-2 small ${active ? "bg-success text-white" : "text-white-50"}`}
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      <div className="d-flex flex-column flex-grow-1">
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
          <span className="fw-semibold">
            {user ? `${sectionLabel} \u2014 ${user.name}` : "Espace de travail"}
          </span>
          <div className="d-flex gap-2">
            <Link to={APP_ROUTES.home} className="btn btn-outline-secondary btn-sm">
              Accueil
            </Link>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
