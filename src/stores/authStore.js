import { create } from "zustand"
import * as authApi from "../api/authApi"
import { getRoleKey } from "../constants/roles"
import { STORAGE_KEYS, clearStoredAuth } from "../api/client"

function persistAuth(token, refreshToken, user) {
  localStorage.setItem(STORAGE_KEYS.token, token)
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

function normalizeUser(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    firstname: raw.firstname,
    lastname: raw.lastname,
    name: raw.name || `${raw.firstname || ""} ${raw.lastname || ""}`.trim(),
    email: raw.email,
    role: getRoleKey(raw.role_id),
    roleId: raw.role_id,
    emailVerified: Boolean(raw.email_verified_at),
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  hydrate() {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.token)
      const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken)
      const userJson = localStorage.getItem(STORAGE_KEYS.user)
      if (token && userJson) {
        const user = normalizeUser(JSON.parse(userJson))
        set({ user, token, refreshToken, isAuthenticated: true })
      }
    } catch {
      clearStoredAuth()
    }
  },

  async login(email, password) {
    const { token, refreshToken, user: rawUser } = await authApi.login(email, password)
    const user = normalizeUser(rawUser)
    persistAuth(token, refreshToken, user)
    set({ user, token, refreshToken, isAuthenticated: true })
    return user
  },

  async register(data) {
    return authApi.register(data)
  },

  async logout() {
    const refreshToken = get().refreshToken
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
    clearStoredAuth()
    if (refreshToken) {
      await authApi.logout(refreshToken)
    }
  },
}))
