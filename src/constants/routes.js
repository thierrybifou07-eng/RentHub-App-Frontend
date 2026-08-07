export const APP_ROUTES = {
  home: "/",
  listings: "/annonces",
  listingDetail: "/annonces/:listingId",
  login: "/connexion",
  register: "/inscription",
  tenantDashboard: "/locataire",
  tenantFavorites: "/locataire/favoris",
  tenantMessages: "/locataire/messages",
  ownerDashboard: "/proprietaire",
  ownerListings: "/proprietaire/annonces",
  ownerListingNew: "/proprietaire/annonces/nouvelle",
  ownerListingEdit: "/proprietaire/annonces/:listingId/modifier",
  ownerMessages: "/proprietaire/messages",
  adminDashboard: "/admin",
  adminModeration: "/admin/moderation",
  adminUsers: "/admin/utilisateurs",
  adminReports: "/admin/signalements",
}

export function getListingDetailPath(listingId) {
  return `/annonces/${listingId}`
}
