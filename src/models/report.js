export const MOCK_REPORTS = [
  {
    id: "report-1",
    reporterId: "user-4",
    targetType: "listing",
    targetId: "listing-5",
    reason: "Informations trompeuses",
    description: "La chambre ne correspond pas \u00e0 la description. Le quartier n'est pas celui annoncé.",
    status: "pending",
    createdAt: "2025-07-18T14:00:00Z",
  },
  {
    id: "report-2",
    reporterId: "user-5",
    targetType: "user",
    targetId: "user-2",
    reason: "Non-réponse aux demandes",
    description: "Le propriétaire ne répond jamais aux messages depuis 2 semaines.",
    status: "pending",
    createdAt: "2025-07-19T10:00:00Z",
  },
  {
    id: "report-3",
    reporterId: "user-4",
    targetType: "listing",
    targetId: "listing-1",
    reason: "Prix excessif",
    description: "Le prix demandé est bien au-dessus du marché pour ce type de studio \u00e0 Akwa.",
    status: "resolved",
    createdAt: "2025-07-15T09:00:00Z",
  },
]

export function getReports() {
  return MOCK_REPORTS
}

export function getReportById(id) {
  return MOCK_REPORTS.find((r) => r.id === id) || null
}
