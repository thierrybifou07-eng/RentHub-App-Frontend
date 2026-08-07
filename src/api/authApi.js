import apiClient from "./client"

export async function register(payload) {
  const body = await apiClient.post("/auth/register", payload)
  return body
}

export async function login(email, password) {
  const body = await apiClient.post("/auth/login", { email, password })
  return body.data
}

export async function logout(refreshToken) {
  try {
    await apiClient.post("/auth/logout", { refreshToken })
  } catch {
    // Best effort : la déconnexion locale s'applique même si le serveur est injoignable.
  }
}

export async function getMe() {
  const body = await apiClient.get("/auth/me")
  return body.data
}
