import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import { APP_ROUTES } from "../constants/routes"
import { ROLE_KEYS } from "../constants/roles"

import PublicLayout from "../layouts/PublicLayout"
import AuthLayout from "../layouts/AuthLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import ProtectedRoute from "../components/common/ProtectedRoute"
import LoadingState from "../components/feedback/LoadingState"

const lazyPage = (loader) => {
  const Component = lazy(loader)
  return function LazyPage(props) {
    return (
      <Suspense fallback={<LoadingState size="sm" message="Chargement de la page..." />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

const HomePage = lazyPage(() => import("../pages/public/HomePage"))
const ListingsPage = lazyPage(() => import("../pages/public/ListingsPage"))
const ListingDetailPage = lazyPage(() => import("../pages/public/ListingDetailPage"))
const AboutPage = lazyPage(() => import("../pages/public/AboutPage"))
const ContactPage = lazyPage(() => import("../pages/public/ContactPage"))
const TermsPage = lazyPage(() => import("../pages/public/TermsPage"))

const LoginPage = lazyPage(() => import("../pages/auth/LoginPage"))
const RegisterPage = lazyPage(() => import("../pages/auth/RegisterPage"))
const ForgotPasswordPage = lazyPage(() => import("../pages/auth/ForgotPasswordPage"))
const ResetPasswordPage = lazyPage(() => import("../pages/auth/ResetPasswordPage"))
const VerifyEmailPage = lazyPage(() => import("../pages/auth/VerifyEmailPage"))

const ProfilePage = lazyPage(() => import("../pages/profile/ProfilePage"))

const TenantDashboard = lazyPage(() => import("../pages/tenant/TenantDashboard"))
const TenantFavorites = lazyPage(() => import("../pages/tenant/TenantFavorites"))
const TenantMessages = lazyPage(() => import("../pages/tenant/TenantMessages"))

const OwnerDashboard = lazyPage(() => import("../pages/owner/OwnerDashboard"))
const OwnerListings = lazyPage(() => import("../pages/owner/OwnerListings"))
const OwnerMessages = lazyPage(() => import("../pages/owner/OwnerMessages"))
const OwnerSubscription = lazyPage(() => import("../pages/owner/OwnerSubscription"))
const CreateListingPage = lazyPage(() => import("../pages/owner/CreateListingPage"))
const EditListingPage = lazyPage(() => import("../pages/owner/EditListingPage"))
const OwnerListingDetailPage = lazyPage(() => import("../pages/owner/OwnerListingDetailPage"))

const AdminDashboard = lazyPage(() => import("../pages/admin/AdminDashboard"))
const AdminModeration = lazyPage(() => import("../pages/admin/AdminModeration"))
const AdminListingDetail = lazyPage(() => import("../pages/admin/AdminListingDetail"))
const AdminUsers = lazyPage(() => import("../pages/admin/AdminUsers"))
const AdminReports = lazyPage(() => import("../pages/admin/AdminReports"))
const AdminSubscriptions = lazyPage(() => import("../pages/admin/AdminSubscriptions"))

const RootDashboard = lazyPage(() => import("../pages/root/RootDashboard"))
const RootAuditLogs = lazyPage(() => import("../pages/root/RootAuditLogs"))
const RootUsers = lazyPage(() => import("../pages/root/RootUsers"))

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: APP_ROUTES.home, element: <HomePage /> },
      { path: APP_ROUTES.listings, element: <ListingsPage /> },
      { path: APP_ROUTES.listingDetail, element: <ListingDetailPage /> },
      { path: APP_ROUTES.about, element: <AboutPage /> },
      { path: APP_ROUTES.contact, element: <ContactPage /> },
      { path: APP_ROUTES.terms, element: <TermsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: APP_ROUTES.login, element: <LoginPage /> },
      { path: APP_ROUTES.register, element: <RegisterPage /> },
      { path: APP_ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: APP_ROUTES.resetPassword, element: <ResetPasswordPage /> },
      { path: APP_ROUTES.verifyEmail, element: <VerifyEmailPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        // Routes partagées par TOUS les utilisateurs connectés
        element: <DashboardLayout />,
        children: [
          { path: APP_ROUTES.profile, element: <ProfilePage /> },
        ]
      },
      {
        element: <ProtectedRoute requiredRole={ROLE_KEYS.tenant} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: APP_ROUTES.tenantDashboard, element: <TenantDashboard /> },
              { path: APP_ROUTES.tenantFavorites, element: <TenantFavorites /> },
              { path: APP_ROUTES.tenantMessages, element: <TenantMessages /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requiredRole={ROLE_KEYS.owner} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: APP_ROUTES.ownerDashboard, element: <OwnerDashboard /> },
              { path: APP_ROUTES.ownerListings, element: <OwnerListings /> },
              { path: APP_ROUTES.ownerListingNew, element: <CreateListingPage /> },
              { path: APP_ROUTES.ownerListingDetail, element: <OwnerListingDetailPage /> },
              { path: APP_ROUTES.ownerListingEdit, element: <EditListingPage /> },
              { path: APP_ROUTES.ownerMessages, element: <OwnerMessages /> },
              { path: APP_ROUTES.ownerSubscription, element: <OwnerSubscription /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requiredRole={ROLE_KEYS.admin} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: APP_ROUTES.adminDashboard, element: <AdminDashboard /> },
              { path: APP_ROUTES.adminModeration, element: <AdminModeration /> },
              { path: APP_ROUTES.adminModerationDetail, element: <AdminListingDetail /> },
              { path: APP_ROUTES.adminUsers, element: <AdminUsers /> },
              { path: APP_ROUTES.adminReports, element: <AdminReports /> },
              { path: APP_ROUTES.adminSubscriptions, element: <AdminSubscriptions /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requiredRole={ROLE_KEYS.root} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: APP_ROUTES.rootDashboard, element: <RootDashboard /> },
              { path: APP_ROUTES.rootAuditLogs, element: <RootAuditLogs /> },
              { path: APP_ROUTES.rootUsers, element: <RootUsers /> },
            ],
          },
        ],
      },
    ],
  },
])
