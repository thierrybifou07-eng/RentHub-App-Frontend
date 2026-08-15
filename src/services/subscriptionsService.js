import { useSubscriptionsStore } from "../stores/subscriptionsStore"

/**
 * Ce service orchestre la logique de paiement, en s'appuyant sur le store Zustand.
 * Il est utilisé par les composants React pour déclencher les flux sans avoir à
 * connaître les détails de l'API.
 */

// 1. Souscription manuelle (ex: virement, mobile money hors ligne)
export async function processManualSubscription(planId, paymentReference) {
  const store = useSubscriptionsStore.getState()
  return await store.subscribe({ planId, paymentReference })
}

// 1bis. Paiement simulé — active immédiatement l'abonnement
export async function processSimulatedPayment(planId) {
  const store = useSubscriptionsStore.getState()
  return await store.subscribe({ planId, simulated: true })
}

// 2. Initialisation du paiement Stripe
export async function initStripePayment(planId) {
  const store = useSubscriptionsStore.getState()
  const result = await store.createPaymentIntent(planId)
  return result // Devrait contenir { clientSecret }
}

// 3. Confirmation du paiement Stripe (après succès côté Stripe.js)
export async function confirmStripePayment(paymentIntentId) {
  const store = useSubscriptionsStore.getState()
  return await store.confirmPayment(paymentIntentId)
}
