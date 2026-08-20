import {
  getUserStatusLabel,
  getRoleLabel,
} from "../constants/apiStatuses"

/**
 * Transforme les raw JSON (old_values / new_values) des audit logs
 * en objets avec des labels lisibles pour l'affichage.
 *
 * @param {object|null} values  — old_values ou new_values du log
 * @param {string}      action  — l'action d'audit (ex: "STATUS_CHANGE")
 * @returns {object|null} objet avec des paires clé → label lisible
 */
export function formatAuditValues(values, action) {
  if (!values || typeof values !== "object") return null

  switch (action) {
    case "STATUS_CHANGE":
      return formatStatusChange(values)

    case "ROLE_CHANGE":
      return formatRoleChange(values)

    case "ACCOUNT_DELETE":
      return formatAccountDelete(values)

    case "PASSWORD_RESET":
      return formatPasswordReset(values)

    default:
      return values
  }
}

function formatStatusChange(values) {
  const result = {}
  if (values.user_status_id != null) {
    result["Statut"] = `${getUserStatusLabel(values.user_status_id)} (${values.user_status_id})`
  }
  return result
}

function formatRoleChange(values) {
  const result = {}
  if (values.role_id != null) {
    result["Rôle"] = `${getRoleLabel(values.role_id)} (${values.role_id})`
  }
  return result
}

function formatAccountDelete(values) {
  const result = {}
  if (values.email) result["Email"] = values.email
  if (values.role_id != null) result["Rôle"] = getRoleLabel(values.role_id)
  return result
}

function formatPasswordReset(values) {
  if (values.reset_by) {
    return { "Réinitialisé par": values.reset_by }
  }
  return values
}

/**
 * Formate les metadata d'un audit log pour l'affichage.
 * Gère le champ reason (motif de suspension/désactivation).
 */
export function formatAuditMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return null

  const result = {}
  if (metadata.reason) result["Motif"] = metadata.reason
  return Object.keys(result).length > 0 ? result : null
}

/**
 * Transforme actor_role "ROLE_ADMIN" → "Administrateur"
 */
export function formatActorRole(roleName) {
  if (!roleName) return "—"
  const roleMap = {
    ROLE_USER: "Utilisateur",
    ROLE_ADMIN: "Administrateur",
    ROLE_ROOT: "Super Admin",
    ROLE_TENANT: "Locataire",
    ROLE_OWNER: "Propriétaire",
    ROLE_AGENCY: "Agence",
  }
  return roleMap[roleName] || roleName
}
