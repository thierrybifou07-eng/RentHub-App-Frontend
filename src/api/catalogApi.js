import apiClient from "./client"

// GET /cities — Liste publique des villes
export async function getCities() {
  // apiClient interceptor retourne directement response.data (l'enveloppe API)
  // L'API renvoie { status: "success", data: [...] }
  const result = await apiClient.get("/cities")
  return result.data || result || []
}

// GET /property-types — Liste publique des types de bien
export async function getPropertyTypes() {
  const result = await apiClient.get("/property-types")
  return result.data || result || []
}
