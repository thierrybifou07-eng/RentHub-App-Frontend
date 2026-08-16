// Limites du plan gratuit utilisées comme valeur par défaut
export const FREE_PLAN_LIMITS = { max_media: 5, max_active_announcements: 5 }

// Extraits les limites (médias / annonces actives) du plan de l'abonnement courant.
export function getPlanFeatures(subscription) {
  const plan = subscription?.plan || subscription?.SubscriptionPlan || null
  const features = plan?.features || {}
  return {
    max_media: Number(features.max_media ?? FREE_PLAN_LIMITS.max_media),
    max_active_announcements: Number(features.max_active_announcements ?? FREE_PLAN_LIMITS.max_active_announcements),
  }
}
