import apiClient from "./client"

export async function getCities() {
  const body = await apiClient.get("/cities")
  return body.data
}

export async function getPropertyTypes() {
  const body = await apiClient.get("/property-types")
  return body.data
}
