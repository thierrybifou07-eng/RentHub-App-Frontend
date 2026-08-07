import { create } from "zustand"
import * as authApi from "../api/authApi"
import { getRoleKey } from "../constants/roles"
import { STORAGE_KEYS, clearStoredAuth } from "../api/client"

function persistAuth(token, refreshToken, user) {
  localStorage.setItem(STORAGE_KEYS.token, token)
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  }
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
    verifiedAt: raw.email_verified_at,
    phone: raw.phone,
    gender: raw.gender,
    cityId: raw.city_id,
    userStatus: raw.user_status_id,
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

  async verifyEmail(email, code) {
    const { token, user: rawUser } = await authApi.verifyEmail({ email, code })
    const user = normalizeUser(rawUser)
    const { refreshToken } = get()
    // The API might return a new token on verify email
    if (token) {
      persistAuth(token, refreshToken, user)
      set({ user, token })
    } else {
      persistAuth(get().token, refreshToken, user)
      set({ user })
    }
    return user
  },

  async refreshToken() {
    const currentRefreshToken = get().refreshToken
    if (!currentRefreshToken) throw new Error("No refresh token available")
    const { token, refreshToken: newRefreshToken, user: rawUser } = await authApi.refresh(currentRefreshToken)
    const user = normalizeUser(rawUser)
    const nextRefreshToken = newRefreshToken || currentRefreshToken
    persistAuth(token, nextRefreshToken, user)
    set({ user, token, refreshToken: nextRefreshToken, isAuthenticated: true })
    return user
  },

  async updateProfile(data) {
    const rawUser = await authApi.updateMe(data)
    const user = normalizeUser(rawUser)
    persistAuth(get().token, get().refreshToken, user)
    set({ user })
    return user
  },

  async changePassword(data) {
    return authApi.updatePassword(data)
  },

  async logout() {
    const refreshToken = get().refreshToken
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
    clearStoredAuth()
    if (refreshToken) {
      await authApi.logout(refreshToken)
    }
  },

  async logoutAll() {
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
    clearStoredAuth()
    await authApi.logoutAll()
  },

  async deleteAccount(password) {
    await authApi.deleteAccount(password)
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
    clearStoredAuth()
  }
}))
