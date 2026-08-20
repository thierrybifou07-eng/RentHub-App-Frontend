export const APP_ROUTES = {
  // Public
  home: "/",
  listings: "/annonces",
  about: "/a-propos",
  contact: "/contact",
  terms: "/conditions-generales",
  login: "/connexion",
  register: "/inscription",
  forgotPassword: "/mot-de-passe-oublie",
  resetPassword: "/reinitialiser-mot-de-passe",
  verifyEmail: "/verifier-email",

  // Shared
  profile: "/profil",

  // Tenant
  tenantDashboard: "/locataire/dashboard",
  tenantFavorites: "/locataire/favoris",
  tenantMessages: "/locataire/messages",

  // Owner
  ownerDashboard: "/proprietaire/dashboard",
  ownerListings: "/proprietaire/annonces",
  ownerMessages: "/proprietaire/messages",
  ownerSubscription: "/proprietaire/abonnement",
  ownerListingDetail: "/proprietaire/annonces/:id",

  // Admin
  adminDashboard: "/admin/dashboard",
  adminModeration: "/admin/moderation",
  adminModerationDetail: "/admin/moderation/:id",
  adminUsers: "/admin/utilisateurs",
  adminReports: "/admin/signalements",
  adminSubscriptions: "/admin/abonnements",

  // Super Admin (ROOT)
  rootDashboard: "/super-admin/dashboard",
  rootAuditLogs: "/super-admin/audit-logs",
  rootUsers: "/super-admin/utilisateurs",

  // Missing routes
  listingDetail: "/annonces/:listingId",
  ownerListingNew: "/proprietaire/annonces/nouveau",
  ownerListingEdit: "/proprietaire/annonces/:id/modifier",
}

export function getListingDetailPath(listingId) {
  return `/annonces/${listingId}`
}
