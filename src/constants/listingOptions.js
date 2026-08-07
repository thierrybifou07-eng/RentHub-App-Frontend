// Removed PROPERTY_TYPES and CAMEROON_CITIES as they are now fetched from catalogApi

export const BUDGET_RANGES = [
  { value: "0-50000", label: "Moins de 50 000 XAF" },
  { value: "50000-150000", label: "50 000 - 150 000 XAF" },
  { value: "150000-300000", label: "150 000 - 300 000 XAF" },
  { value: "300000-plus", label: "Plus de 300 000 XAF" },
]

export const LISTING_STATUS = {
  draft: "Brouillon",
  pending: "En moderation",
  published: "Publiee",
  archived: "Archivee",
  rejected: "Rejetee",
}
