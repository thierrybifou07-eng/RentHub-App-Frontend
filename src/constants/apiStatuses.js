/**
 * apiStatuses.js — Référentiels de statuts de l'API RentHub
 *
 * Source : API_DOCUMENTATION.md §5 + §2
 * Ces constantes reflètent les valeurs renvoyées par le backend.
 * NE PAS modifier sans vérifier la cohérence avec le backend.
 */

/* ── §5.1 Statuts d'annonce (announcement_status_id) ──────────── */

export const ANNOUNCEMENT_STATUS = {
  ACTIVE:           { id: 1, code: "ACTIVE",          label: "Active",               publicVisible: true  },
  PENDING_REVIEW:   { id: 2, code: "PENDING_REVIEW",  label: "En attente de revue",  publicVisible: false },
  RENTED:           { id: 3, code: "RENTED",          label: "Louée",                publicVisible: false },
  ARCHIVED:         { id: 4, code: "ARCHIVED",        label: "Archivée",             publicVisible: false },
  REJECTED:         { id: 5, code: "REJECTED",        label: "Rejetée",              publicVisible: false },
}

/** Renvoie le label localisé pour un id de statut d'annonce */
export function getAnnouncementStatusLabel(statusId) {
  const found = Object.values(ANNOUNCEMENT_STATUS).find(s => s.id === statusId)
  return found?.label ?? "Inconnu"
}

/** Renvoie le thème de couleur pour badge (aligne sur badge-pill CSS) */
export function getAnnouncementStatusTheme(statusId) {
  const map = {
    1: "success",  // ACTIVE
    2: "warning",  // PENDING_REVIEW
    3: "info",     // RENTED
    4: "neutral",  // ARCHIVED
    5: "danger",   // REJECTED
  }
  return map[statusId] ?? "neutral"
}

/* ── §5.2 Statuts de signalement (report_status_id) ───────────── */

export const REPORT_STATUS = {
  PENDING:      { id: 1, code: "PENDING",      label: "En attente" },
  REVIEWED:     { id: 2, code: "REVIEWED",     label: "Examiné"    },
  DISMISSED:    { id: 3, code: "DISMISSED",    label: "Classé"     },
  ACTION_TAKEN: { id: 4, code: "ACTION_TAKEN", label: "Action prise" },
}

export function getReportStatusLabel(statusId) {
  const found = Object.values(REPORT_STATUS).find(s => s.id === statusId)
  return found?.label ?? "Inconnu"
}

export function getReportStatusTheme(statusId) {
  const map = { 1: "warning", 2: "info", 3: "neutral", 4: "danger" }
  return map[statusId] ?? "neutral"
}

/* ── §5.3 Statuts d'abonnement (user_subscriptions.status) ────── */

export const SUBSCRIPTION_STATUS = {
  PENDING:         "PENDING",
  WAITING_PAYMENT: "WAITING_PAYMENT",
  ACTIVE:          "ACTIVE",
  CANCELLED:       "CANCELLED",
  REJECTED:        "REJECTED",
  FAILED:          "FAILED",
  EXPIRED:         "EXPIRED",
}

export const SUBSCRIPTION_STATUS_LABELS = {
  PENDING:         "En attente",
  WAITING_PAYMENT: "Paiement attendu",
  ACTIVE:          "Actif",
  CANCELLED:       "Annulé",
  REJECTED:        "Refusé",
  FAILED:          "Échec paiement",
  EXPIRED:         "Expiré",
}

export function getSubscriptionStatusLabel(status) {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status ?? "Inconnu"
}

export function getSubscriptionStatusTheme(status) {
  const map = {
    PENDING:         "warning",
    WAITING_PAYMENT: "info",
    ACTIVE:          "success",
    CANCELLED:       "neutral",
    REJECTED:        "danger",
    FAILED:          "danger",
    EXPIRED:         "neutral",
  }
  return map[status] ?? "neutral"
}

/* ── §2.4 Statuts de compte (user_status_id) ───────────────────── */

export const USER_STATUS = {
  ACTIVE:               { id: 1, code: "ACTIVE",               label: "Actif"                },
  INACTIVE:             { id: 2, code: "INACTIVE",             label: "Inactif"              },
  SUSPENDED:            { id: 3, code: "SUSPENDED",            label: "Suspendu"             },
  PENDING_VERIFICATION: { id: 4, code: "PENDING_VERIFICATION", label: "Email non vérifié"    },
}

export function getUserStatusLabel(statusId) {
  const found = Object.values(USER_STATUS).find(s => s.id === statusId)
  return found?.label ?? "Inconnu"
}

export function getUserStatusTheme(statusId) {
  const map = { 1: "success", 2: "neutral", 3: "danger", 4: "warning" }
  return map[statusId] ?? "neutral"
}

/* ── §2.3 Rôles (role_id) ───────────────────────────────────────── */

export const ROLE_LABELS = {
  1: "Utilisateur",
  2: "Administrateur",
  3: "Super Admin",
  4: "Locataire",
  5: "Propriétaire",
  6: "Agence",
}

export function getRoleLabel(roleId) {
  return ROLE_LABELS[roleId] ?? "Inconnu"
}

/* ── §5.4 Types de bien (property_type_id) — fallback local ────── */
// Ces valeurs sont exposées dynamiquement via GET /property-types.
// Ce fallback est utilisé uniquement si l'API est indisponible.

export const PROPERTY_TYPE_FALLBACK = {
  1: { id: 1, code: "APARTMENT",  label: "Appartement"       },
  2: { id: 2, code: "HOUSE",      label: "Maison"            },
  3: { id: 3, code: "STUDIO",     label: "Studio"            },
  4: { id: 4, code: "COMMERCIAL", label: "Local commercial"  },
}
