import { Link, Outlet, useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../constants/routes"
import { useAuthStore } from "../stores/authStore"

const ROLE_DASHBOARD_LABEL = {
  tenant: "Mon espace",
  owner: "Mon espace",
  admin: "Administration",
}

const ROLE_DASHBOARD_ROUTE = {
  tenant: APP_ROUTES.tenantDashboard,
  owner: APP_ROUTES.ownerDashboard,
  admin: APP_ROUTES.adminDashboard,
}

function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate(APP_ROUTES.home, { replace: true })
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg sticky-top bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold text-success" to={APP_ROUTES.home}>
            RentHub
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#publicNav"
            aria-controls="publicNav"
            aria-expanded="false"
            aria-label="Menu de navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="publicNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to={APP_ROUTES.listings}>
                  Annonces
                </Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto gap-2 align-items-center">
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link
                      className="btn btn-outline-success btn-sm"
                      to={ROLE_DASHBOARD_ROUTE[user.role] || APP_ROUTES.home}
                    >
                      {ROLE_DASHBOARD_LABEL[user.role] || "Espace"}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <span className="text-secondary small d-none d-sm-inline">
                      {user.name}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="btn btn-outline-success btn-sm" to={APP_ROUTES.login}>
                      Connexion
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-success btn-sm" to={APP_ROUTES.register}>
                      Inscription
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="bg-dark text-white-50 py-4 mt-auto">
        <div className="container text-center small">
          &copy; {new Date().getFullYear()} RentHub &mdash; Location immobilière au Cameroun
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
