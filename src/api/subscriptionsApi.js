import apiClient from "./client"

// GET /subscriptions/plans — Récupérer les forfaits (plans)
export async function getPlans() {
  const response = await apiClient.get("/subscriptions/plans")
  return response.data || response || []
}

// POST /subscriptions/subscribe — Souscription manuelle (avec référence optionnelle)
export async function subscribe(data) {
  // data: { planId, paymentReference }
  const response = await apiClient.post("/subscriptions/subscribe", data)
  return response.data || response
}

// GET /subscriptions/me — Abonnement actuel
export async function getMySubscription() {
  const response = await apiClient.get("/subscriptions/me")
  return response.data || response
}

// GET /subscriptions/history — Historique des abonnements
export async function getSubscriptionHistory(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient.get(`/subscriptions/history?${query}`)
  return response.data || response
}

// POST /subscriptions/create-payment-intent — Stripe Intent
export async function createPaymentIntent(data) {
  // data: { planId }
  const response = await apiClient.post("/subscriptions/create-payment-intent", data)
  return response.data || response
}

// POST /subscriptions/confirm-payment — Confirmation Stripe
export async function confirmPayment(data) {
  // data: { paymentIntentId }
  const response = await apiClient.post("/subscriptions/confirm-payment", data)
  return response.data || response
}

// --- ADMIN ---

// GET /subscriptions/admin
export async function getAdminSubscriptions(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient.get(`/subscriptions/admin?${query}`)
  return { items: response.data || [], pagination: response.pagination || {} }
}

// GET /subscriptions/admin/:id
export async function getAdminSubscriptionById(id) {
  const response = await apiClient.get(`/subscriptions/admin/${id}`)
  return response.data || response
}

// PATCH /subscriptions/admin/:id/activate
export async function activateSubscription(id, adminNote) {
  const response = await apiClient.patch(`/subscriptions/admin/${id}/activate`, { adminNote })
  return response.data || response
}

// PATCH /subscriptions/admin/:id/reject
export async function rejectSubscription(id, adminNote) {
  const response = await apiClient.patch(`/subscriptions/admin/${id}/reject`, { adminNote })
  return response.data || response
}
