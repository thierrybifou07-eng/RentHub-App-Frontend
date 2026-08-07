import { Link, Outlet } from "react-router-dom"
import { APP_ROUTES } from "../constants/routes"

function AuthLayout() {
  return (
    <div className="auth-layout d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="w-100" style={{ maxWidth: 440 }}>
        <div className="text-center mb-4">
          <Link to={APP_ROUTES.home} className="h3 fw-bold text-success text-decoration-none">
            RentHub
          </Link>
        </div>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-secondary small mt-3">
          <Link to={APP_ROUTES.home} className="text-decoration-none">
            &larr; Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
