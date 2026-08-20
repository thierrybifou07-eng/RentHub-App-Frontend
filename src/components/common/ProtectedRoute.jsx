import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import { APP_ROUTES } from "../../constants/routes"
import { USER_STATUS } from "../../constants/apiStatuses"

const ROLE_DASHBOARD = {
  tenant: APP_ROUTES.tenantDashboard,
  owner: APP_ROUTES.ownerDashboard,
  admin: APP_ROUTES.adminDashboard,
  root: APP_ROUTES.rootDashboard,
}

function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to={APP_ROUTES.login} replace />
  }

  if (user.userStatus === USER_STATUS.SUSPENDED.id) {
    return <Navigate to={APP_ROUTES.accountSuspended} replace />
  }
  if (user.userStatus === USER_STATUS.INACTIVE.id) {
    return <Navigate to={APP_ROUTES.accountInactive} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROLE_DASHBOARD[user?.role] || APP_ROUTES.home} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
