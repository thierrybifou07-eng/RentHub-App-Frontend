import apiClient from "./client"

// GET /catalog/plans — Récupérer les forfaits (plans)
export async function getPlans() {
  const response = await apiClient.get("/catalog/plans")
  return response.data || response || []
}

// POST /subscriptions — Souscription manuelle (avec référence optionnelle)
export async function subscribe(data) {
  // data: { planId, paymentReference }
  const response = await apiClient.post("/subscriptions", data)
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

// GET /admin/subscriptions
export async function getAdminSubscriptions(params = {}) {
  const query = new URLSearchParams(params).toString()
  const response = await apiClient.get(`/admin/subscriptions?${query}`)
  return response.data || response
}

// GET /admin/subscriptions/:id
export async function getAdminSubscriptionById(id) {
  const response = await apiClient.get(`/admin/subscriptions/${id}`)
  return response.data || response
}

// POST /admin/subscriptions/:id/activate
export async function activateSubscription(id, adminNote) {
  const response = await apiClient.post(`/admin/subscriptions/${id}/activate`, { adminNote })
  return response.data || response
}

// POST /admin/subscriptions/:id/reject
export async function rejectSubscription(id, adminNote) {
  const response = await apiClient.post(`/admin/subscriptions/${id}/reject`, { adminNote })
  return response.data || response
}
