import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import { APP_ROUTES } from "../../constants/routes"

const ROLE_DASHBOARD = {
  tenant: APP_ROUTES.tenantDashboard,
  owner: APP_ROUTES.ownerDashboard,
  admin: APP_ROUTES.adminDashboard,
}

function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={ROLE_DASHBOARD[user.role] || APP_ROUTES.home} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
