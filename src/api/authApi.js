import apiClient from "./client"

// POST /auth/register
export async function register(payload) {
  const body = await apiClient.post("/auth/register", payload)
  return body
}

// POST /auth/login
export async function login(email, password) {
  const body = await apiClient.post("/auth/login", { email, password })
  return body.data || body
}

// POST /auth/refresh
export async function refresh(refreshToken) {
  const body = await apiClient.post("/auth/refresh", { refreshToken })
  return body.data || body
}

// POST /auth/logout
export async function logout(refreshToken) {
  try {
    await apiClient.post("/auth/logout", { refreshToken })
  } catch {
    // Best effort
  }
}

// POST /auth/logout-all
export async function logoutAll() {
  await apiClient.post("/auth/logout-all")
}

// GET /auth/me
export async function getMe() {
  const body = await apiClient.get("/auth/me")
  return body.data || body
}

// PATCH /auth/me
export async function updateMe(data) {
  const body = await apiClient.patch("/auth/me", data)
  return body.data || body
}

// POST /auth/verify-email
export async function verifyEmail({ email, code }) {
  const body = await apiClient.post("/auth/verify-email", { email, code })
  return body.data || body
}

// POST /auth/regenerate-code
export async function regenerateCode() {
  const body = await apiClient.post("/auth/regenerate-code")
  return body
}

// POST /auth/forgot-password
export async function forgotPassword(email) {
  const body = await apiClient.post("/auth/forgot-password", { email })
  return body
}

// POST /auth/reset-password
export async function resetPassword({ email, code, password, confirmPassword }) {
  const body = await apiClient.post("/auth/reset-password", {
    email,
    code,
    password,
    confirmPassword,
  })
  return body
}

// PATCH /auth/me/password
export async function updatePassword({ currentPassword, newPassword, confirmNewPassword }) {
  const body = await apiClient.patch("/auth/me/password", {
    currentPassword,
    newPassword,
    confirmNewPassword,
  })
  return body
}

// DELETE /auth/me
export async function deleteAccount(password) {
  const body = await apiClient.delete("/auth/me", {
    data: { password }
  })
  return body
}
