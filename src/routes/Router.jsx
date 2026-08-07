import { createBrowserRouter } from "react-router-dom"
import { APP_ROUTES } from "../constants/routes"
import { ROLE_KEYS } from "../constants/roles"

import PublicLayout from "../layouts/PublicLayout"
import AuthLayout from "../layouts/AuthLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import ProtectedRoute from "../components/common/ProtectedRoute"

import HomePage from "../pages/public/HomePage"
import ListingsPage from "../pages/public/ListingsPage"
import ListingDetailPage from "../pages/public/ListingDetailPage"

import LoginPage from "../pages/auth/LoginPage"
import RegisterPage from "../pages/auth/RegisterPage"
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "../pages/auth/ResetPasswordPage"
import VerifyEmailPage from "../pages/auth/VerifyEmailPage"

import ProfilePage from "../pages/profile/ProfilePage"

import TenantDashboard from "../pages/tenant/TenantDashboard"
import TenantFavorites from "../pages/tenant/TenantFavorites"
import TenantMessages from "../pages/tenant/TenantMessages"

import OwnerDashboard from "../pages/owner/OwnerDashboard"
import OwnerListings from "../pages/owner/OwnerListings"
import OwnerMessages from "../pages/owner/OwnerMessages"
import ListingForm from "../components/listings/ListingForm"

import AdminDashboard from "../pages/admin/AdminDashboard"
import AdminModeration from "../pages/admin/AdminModeration"
import AdminUsers from "../pages/admin/AdminUsers"
import AdminReports from "../pages/admin/AdminReports"

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: APP_ROUTES.home, element: <HomePage /> },
      { path: APP_ROUTES.listings, element: <ListingsPage /> },
      { path: APP_ROUTES.listingDetail, element: <ListingDetailPage /> },
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
              { path: APP_ROUTES.ownerListingNew, element: <ListingForm /> },
              { path: APP_ROUTES.ownerListingEdit, element: <ListingForm /> },
              { path: APP_ROUTES.ownerMessages, element: <OwnerMessages /> },
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
              { path: APP_ROUTES.adminUsers, element: <AdminUsers /> },
              { path: APP_ROUTES.adminReports, element: <AdminReports /> },
            ],
          },
        ],
      },
    ],
  },
])
