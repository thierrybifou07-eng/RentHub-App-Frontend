import { create } from "zustand"
import * as subscriptionsApi from "../api/subscriptionsApi"

export const useSubscriptionsStore = create((set, get) => ({
  plans: [],
  currentSubscription: null,
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true, error: null })
    try {
      const data = await subscriptionsApi.getPlans()
      set({ plans: data.items || data || [] })
    } catch (err) {
      set({ error: err.message || "Erreur lors de la récupération des plans." })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  fetchMySubscription: async () => {
    set({ loading: true, error: null })
    try {
      const sub = await subscriptionsApi.getMySubscription()
      set({ currentSubscription: sub })
    } catch (err) {
      if (err.status !== 404) {
        set({ error: err.message || "Erreur lors de la récupération de votre abonnement." })
      } else {
        set({ currentSubscription: null }) // Pas d'abonnement
      }
    } finally {
      set({ loading: false })
    }
  },

  subscribe: async (data) => {
    const newSub = await subscriptionsApi.subscribe(data)
    await get().fetchMySubscription()
    return newSub
  },

  createPaymentIntent: async (planId) => {
    const result = await subscriptionsApi.createPaymentIntent({ planId })
    return result
  },

  confirmPayment: async (paymentIntentId) => {
    const result = await subscriptionsApi.confirmPayment({ paymentIntentId })
    await get().fetchMySubscription()
    return result
  }
}))
