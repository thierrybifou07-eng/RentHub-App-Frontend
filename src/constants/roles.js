export const ROLE_IDS = {
  USER: 1,
  ADMIN: 2,
  ROOT: 3,
  TENANT: 4,
  OWNER: 5,
  AGENCY: 6,
}

export const ROLE_KEYS = {
  tenant: "tenant",
  owner: "owner",
  admin: "admin",
}

export function getRoleKey(roleId) {
  if (roleId === ROLE_IDS.TENANT) return ROLE_KEYS.tenant
  if (roleId === ROLE_IDS.OWNER || roleId === ROLE_IDS.AGENCY) return ROLE_KEYS.owner
  if (roleId === ROLE_IDS.ADMIN || roleId === ROLE_IDS.ROOT) return ROLE_KEYS.admin
  return "user"
}
