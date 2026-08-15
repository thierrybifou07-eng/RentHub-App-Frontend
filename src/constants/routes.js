export const APP_ROUTES = {
  // Public
  home: "/",
  listings: "/annonces",
  about: "/a-propos",
  contact: "/contact",
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

  // Admin
  adminDashboard: "/admin/dashboard",
  adminModeration: "/admin/moderation",
  adminUsers: "/admin/utilisateurs",
  adminReports: "/admin/signalements",
  adminSubscriptions: "/admin/abonnements",

  // Missing routes
  listingDetail: "/annonces/:listingId",
  ownerListingNew: "/proprietaire/annonces/nouveau",
  ownerListingEdit: "/proprietaire/annonces/:id/modifier",
}

export function getListingDetailPath(listingId) {
  return `/annonces/${listingId}`
}
