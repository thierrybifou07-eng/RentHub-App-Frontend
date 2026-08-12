import { io } from "socket.io-client"
import { getStoredToken, getWsBaseUrl } from "../api/client"

let socket = null

/**
 * Retourne l'instance Socket.IO unique (créée à la demande).
 * L'authentification se fait au handshake via le JWT stocké en localStorage.
 */
export function getSocket() {
  if (socket) return socket
  socket = io(getWsBaseUrl(), {
    auth: { token: getStoredToken() },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  })
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
  }
}

/** Abonne un handler à un événement socket, retourne la fonction de désabonnement. */
export function onSocketEvent(event, handler) {
  const s = getSocket()
  s.on(event, handler)
  return () => s.off(event, handler)
}

/**
 * Reconnecte le socket avec un token frais (appelé après login / refresh /
 * rotation du token). Sans objet si le socket n'a jamais été créé.
 */
export function refreshSocketToken() {
  if (!socket) return
  const token = getStoredToken()
  socket.auth = { ...(socket.auth || {}), token }
  if (socket.connected) {
    socket.disconnect()
    socket.connect()
  } else {
    socket.connect()
  }
}

// Rotation du token : le client axios notifie via des événements window.
if (typeof window !== "undefined") {
  window.addEventListener("renthub:token-changed", refreshSocketToken)
  window.addEventListener("renthub:auth-cleared", disconnectSocket)
}
