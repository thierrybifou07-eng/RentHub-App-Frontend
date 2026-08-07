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

// GET /catalog/report-reasons — Liste publique des raisons de signalement
export async function getReportReasons() {
  // It could be /report-reasons depending on the API design, but T6-2 says /catalog/report-reasons
  const result = await apiClient.get("/catalog/report-reasons")
  return result.data || result || []
}
