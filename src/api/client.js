/**
 * client.js — Client HTTP Axios centralisé
 *
 * Fonctionnalités :
 *  - Injection automatique du Bearer token sur chaque requête
 *  - Intercepteur de refresh token silencieux avec gestion de file d'attente
 *    (évite les boucles et les appels /refresh concurrents)
 *  - Normalisation des 3 formats d'erreur de l'API (T0-1)
 *  - Redirection vers /connexion si le refresh échoue
 */

import axios from "axios"

/* ── Configuration ──────────────────────────────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"
const LOGIN_PATH   = "/connexion"

export const STORAGE_KEYS = {
  token:        "renthub-token",
  refreshToken: "renthub-refresh-token",
  user:         "renthub-user",
}

/* ── Classe d'erreur API ────────────────────────────────────────── */

export class ApiError extends Error {
  /**
   * @param {string} message   — message lisible
   * @param {number} status    — code HTTP (0 si réseau)
   * @param {object|null} body — corps brut de la réponse
   */
  constructor(message, status = 0, body = null) {
    super(message)
    this.name   = "ApiError"
    this.status = status
    this.body   = body
  }
}

/* ── Helpers localStorage ───────────────────────────────────────── */

export function getStoredToken() {
  try { return localStorage.getItem(STORAGE_KEYS.token) }
  catch { return null }
}

export function getStoredRefreshToken() {
  try { return localStorage.getItem(STORAGE_KEYS.refreshToken) }
  catch { return null }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearStoredAuth() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  } catch { /* ignore */ }
}

export function persistTokens(token, refreshToken) {
  try {
    localStorage.setItem(STORAGE_KEYS.token, token)
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  } catch { /* ignore */ }
}

/* ── T0-1 : Normalisation des 3 formats d'erreur de l'API ──────── */
/**
 * L'API renvoie 3 formats distincts selon l'origine de l'erreur :
 *
 *  1. Validation Joi (middleware validate()) :
 *     → { message: "\"email\" must be a valid email" }   (sans champ status)
 *
 *  2. Erreur métier (contrôleur) :
 *     → { status: "fail"|"error", message: "..." }
 *
 *  3. errorHandler global (erreur non interceptée) :
 *     → { success: false, message: "...", error?: "..." }
 *
 * Cette fonction extrait le message le plus précis dans tous les cas.
 */
function extractErrorMessage(body) {
  if (!body) return null

  // Format 1 — Joi : { message } sans champ status/success
  if (typeof body.message === "string" && body.status === undefined && body.success === undefined) {
    return body.message
  }

  // Format 2 — Métier : { status: "fail"|"error", message }
  if (body.status === "fail" || body.status === "error") {
    return body.message || null
  }

  // Format 3 — errorHandler : { success: false, message, error? }
  if (body.success === false) {
    return body.message || body.error || null
  }

  // Fallback générique
  return body.message || body.error || null
}

export function normalizeError(error) {
  if (error.response) {
    const body    = error.response.data
    const message = extractErrorMessage(body) || "Une erreur est survenue."
    return new ApiError(message, error.response.status, body)
  }
  if (error.request) {
    // Requête émise mais pas de réponse (réseau/timeout)
    return new ApiError(
      "Le serveur est injoignable. Vérifiez votre connexion réseau.",
      0,
      null,
    )
  }
  // Erreur de configuration axios
  return new ApiError(error.message || "Erreur inattendue.", 0, null)
}

/* ── Détection des endpoints d'auth (pas de refresh dessus) ─────── */

function isAuthEndpoint(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/refresh")
}

/* ── Instance Axios ─────────────────────────────────────────────── */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
})

/* ── Intercepteur REQUEST : injection du token ──────────────────── */

apiClient.interceptors.request.use(config => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ── T0-2 : Intercepteur RESPONSE — refresh token silencieux ────── */
/**
 * Stratégie :
 *  1. Si un 401 arrive sur un endpoint NON-auth, on tente un refresh.
 *  2. Un flag `isRefreshing` évite d'appeler /refresh plusieurs fois
 *     si plusieurs requêtes échouent simultanément.
 *  3. Les requêtes en attente sont mises en file (failedQueue) et
 *     rejouées dès que le nouveau token est disponible.
 *  4. Si le refresh échoue (token révoqué, compte bloqué, rejeu détecté) :
 *     - On purge le localStorage
 *     - On rejette toutes les requêtes en attente
 *     - On redirige vers /connexion
 *
 * Note : l'API implémente une rotation des refresh tokens.
 * Un ancien token rejoué déclenche la révocation de TOUTES les sessions.
 */

let isRefreshing  = false
let failedQueue   = []   // [{ resolve, reject }]

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH)
  }
}

apiClient.interceptors.response.use(
  // Succès : on retourne directement response.data (enveloppe API standard)
  response => response.data,

  async error => {
    const originalRequest = error.config

    // ── Cas particulier : erreur réseau sans réponse ─────────────
    if (!error.response) {
      return Promise.reject(normalizeError(error))
    }

    const status = error.response.status

    // ── 401 sur un endpoint d'auth = pas de retry ───────────────
    if (status === 401 && isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(normalizeError(error))
    }

    // ── 401 sur un endpoint protégé = tenter le refresh ─────────
    if (status === 401 && !originalRequest?._retried) {
      // Marquer cette requête pour éviter une boucle infinie
      originalRequest._retried = true

      if (isRefreshing) {
        // Une requête de refresh est déjà en cours — mettre en file
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      const storedRefreshToken = getStoredRefreshToken()

      if (!storedRefreshToken) {
        // Pas de refresh token → déconnexion immédiate
        clearStoredAuth()
        redirectToLogin()
        return Promise.reject(normalizeError(error))
      }

      isRefreshing = true

      try {
        // Appel direct axios pour éviter l'intercepteur (pas de retry récursif)
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: storedRefreshToken,
        })

        const newToken        = data?.data?.token
        const newRefreshToken = data?.data?.refreshToken

        if (!newToken) throw new Error("Refresh response missing token")

        // Persister les nouveaux tokens
        persistTokens(newToken, newRefreshToken)

        // Mettre à jour l'instance axios pour les futures requêtes
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

        // Rejouer toutes les requêtes en attente
        processQueue(null, newToken)

        // Rejouer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)

      } catch (refreshError) {
        // Le refresh a échoué (token révoqué, compte suspendu, rejeu détecté…)
        processQueue(refreshError, null)
        clearStoredAuth()
        redirectToLogin()
        return Promise.reject(normalizeError(refreshError))

      } finally {
        isRefreshing = false
      }
    }

    // ── Toutes les autres erreurs ────────────────────────────────
    return Promise.reject(normalizeError(error))
  },
)

export default apiClient
