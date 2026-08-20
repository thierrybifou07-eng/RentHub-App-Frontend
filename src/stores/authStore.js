import { create } from "zustand"
import * as authApi from "../api/authApi"
import { getMyMedia } from "../api/mediaApi"
import { resolveMediaUrl } from "../utils/mediaUrl"
import { getRoleKey } from "../constants/roles"
import { STORAGE_KEYS, clearStoredAuth } from "../api/client"

function persistAuth(token, refreshToken, user) {
  localStorage.setItem(STORAGE_KEYS.token, token)
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  }
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("renthub:token-changed", { detail: { token } }))
  }
}

function normalizeUser(raw) {
  if (!raw) return null
  const roleId = raw.role_id ?? raw.roleId ?? null
  const role = roleId != null ? getRoleKey(roleId) : raw.role || "user"
  return {
    id: raw.id,
    firstname: raw.firstname,
    lastname: raw.lastname,
    name: raw.name || `${raw.firstname || ""} ${raw.lastname || ""}`.trim(),
    email: raw.email,
    role,
    roleId,
    emailVerified: Boolean(raw.email_verified_at ?? raw.emailVerified),
    verifiedAt: raw.email_verified_at ?? raw.verifiedAt ?? null,
    phone: raw.phone,
    gender: raw.gender,
    cityId: raw.city_id ?? raw.cityId ?? null,
    userStatus: raw.user_status_id ?? raw.userStatus ?? null,
    avatarUrl: raw.avatarUrl || raw.avatar_url || raw.avatar || raw.photo || raw.profile_picture || null,
  }
}

function readStoredSession() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.token)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken)
    const userJson = localStorage.getItem(STORAGE_KEYS.user)
    if (token && userJson) {
      const user = normalizeUser(JSON.parse(userJson))
      if (user) return { user, token, refreshToken, isAuthenticated: true }
    }
  } catch { /* ignore */ }
  return { user: null, token: null, refreshToken: null, isAuthenticated: false }
}

export const useAuthStore = create((set, get) => ({
  ...readStoredSession(),

  hydrate() {
    const next = readStoredSession()
    const current = get()
    if (
      next.isAuthenticated !== current.isAuthenticated ||
      next.token !== current.token ||
      next.user?.id !== current.user?.id
    ) {
      set(next)
    }
  },

  /** Récupère l'avatar (média USER_AVATAR) de l'utilisateur connecté et le partage dans le store. */
  async hydrateAvatar() {
    const { user, token } = get()
    if (!user || !token || user.avatarUrl) return
    try {
      const data = await getMyMedia()
      const media = Array.isArray(data) ? data : data?.data || []
      const avatar = media.find(
        (m) => m.MediaType?.code === "USER_AVATAR" || m.mediaType?.code === "USER_AVATAR"
      )
      if (avatar) get().setAvatarUrl(resolveMediaUrl(avatar))
    } catch { /* ignore */ }
  },

  /** Met à jour l'avatar de l'utilisateur courant (persisté localement). */
  setAvatarUrl(url) {
    const { user, token, refreshToken } = get()
    if (!user) return
    const next = { ...user, avatarUrl: url }
    persistAuth(token, refreshToken, next)
    set({ user: next })
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
    const current = get()
    const { token, user: rawUser } = await authApi.verifyEmail({ email, code })
    const normalized = normalizeUser(rawUser)
    // Sécurité : si le backend ne renvoie pas l'utilisateur (réponse partielle),
    // on recompose la session courante en marquant l'e-mail vérifié.
    const user = normalized || {
      ...current.user,
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
    }
    const refreshToken = current.refreshToken
    // L'API renvoie un nouveau token après vérification.
    if (token) {
      persistAuth(token, refreshToken, user)
      set({ user, token, isAuthenticated: true })
    } else {
      persistAuth(current.token, refreshToken, user)
      set({ user, isAuthenticated: true })
    }
    return user
  },

  async refreshAuthToken() {
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

  /** Auto-login after password reset — tokens returned by /auth/reset-password */
  async resetPasswordLogin({ token, refreshToken, user: rawUser }) {
    const user = normalizeUser(rawUser)
    persistAuth(token, refreshToken, user)
    set({ user, token, refreshToken, isAuthenticated: true })
    return user
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
