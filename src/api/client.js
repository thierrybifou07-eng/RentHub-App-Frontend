import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"

export const STORAGE_KEYS = {
  token: "renthub-token",
  refreshToken: "renthub-refresh-token",
  user: "renthub-user",
}

const LOGIN_PATH = "/connexion"

export class ApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.token)
  } catch {
    return null
  }
}

export function getStoredRefreshToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.refreshToken)
  } catch {
    return null
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearStoredAuth() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  } catch {
    // ignore storage errors
  }
}

function isAuthEndpoint(url) {
  if (!url) return false
  return url.includes("/auth/login") || url.includes("/auth/refresh")
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !isAuthEndpoint(error.config?.url)) {
      clearStoredAuth()
      if (window.location.pathname !== LOGIN_PATH) {
        window.location.assign(LOGIN_PATH)
      }
    }
    return Promise.reject(normalizeError(error))
  },
)

function normalizeError(error) {
  if (error.response) {
    const body = error.response.data
    const message = body?.message || body?.error || "Une erreur est survenue."
    return new ApiError(message, error.response.status, body)
  }
  return new ApiError("Le serveur est injoignable. Vérifiez votre connexion réseau.")
}

export default apiClient
