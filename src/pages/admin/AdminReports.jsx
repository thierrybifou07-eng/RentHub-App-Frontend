import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getAdminReports, reviewReport, dismissReport, takeActionReport } from "../../api/reportsApi"
import EmptyState from "../../components/feedback/EmptyState"
import LoadingState from "../../components/feedback/LoadingState"
import { formatDate } from "../../utils/formatters"

const STATUS_CLASSES = {
  PENDING: "bg-info",
  REVIEWED: "bg-warning",
  RESOLVED: "bg-success",
  DISMISSED: "bg-secondary",
}
const STATUS_LABELS = {
  PENDING: "En attente",
  REVIEWED: "En revue",
  RESOLVED: "Résolu",
  DISMISSED: "Rejeté",
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  
  // Note admin pour les actions
  const [adminNote, setAdminNote] = useState("")
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    let active = true
    loadReports(active)
    return () => { active = false }
  }, [filter])

  async function loadReports(active = true) {
    setLoading(true)
    try {
      const params = filter === "all" ? {} : { status_id: filter }
      const data = await getAdminReports(params)
      if (active) setReports(data.items || data || [])
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }

  const handleReview = async (id) => {
    setActionLoading(id)
    try {
      await reviewReport(id)
      await loadReports()
    } finally {
      setActionLoading(null)
    }
  }

  const handleTakeAction = async (id) => {
    const note = prompt("Note d'action (optionnelle) :", adminNote)
    if (note === null) return
    setActionLoading(id)
    try {
      await takeActionReport(id, note)
      await loadReports()
    } finally {
      setActionLoading(null)
    }
  }

  const handleDismiss = async (id) => {
    const note = prompt("Raison du rejet (optionnelle) :", adminNote)
    if (note === null) return
    setActionLoading(id)
    try {
      await dismissReport(id, note)
      await loadReports()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Signalements</h1>
          <p className="text-muted mb-0">Modération des signalements utilisateurs</p>
        </div>
      </header>

      <ul className="nav nav-pills mb-3">
        {[
          { key: "all", label: "Toutes" },
          { key: "PENDING", label: "En attente" },
          { key: "REVIEWED", label: "En revue" },
          { key: "RESOLVED", label: "Résolus" },
          { key: "DISMISSED", label: "Rejetés" },
        ].map((t) => (
          <li key={t.key} className="nav-item">
            <button
              type="button"
              className={`nav-link ${filter === t.key ? "active" : ""}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {loading ? (
        <LoadingState message="Chargement des signalements..." />
      ) : reports.length === 0 ? (
        <EmptyState message="Aucun signalement trouvé." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Cible (Annonce)</th>
                <th>Signalé par</th>
                <th>Raison</th>
                <th>Statut</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const targetName = report.announcement?.title || `Annonce #${report.announcement_id}`
                const reporterName = report.reporter?.name || report.reporter?.email || "Inconnu"
                return (
                  <tr key={report.id}>
                    <td>#{report.id}</td>
                    <td className="fw-semibold">
                      <Link to={`/annonces/${report.announcement_id}`} target="_blank">
                        {targetName}
                      </Link>
                    </td>
                    <td>{reporterName}</td>
                    <td>
                      <span className="d-inline-block text-truncate" style={{ maxWidth: 200 }} title={report.reason}>
                        {report.reason}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_CLASSES[report.status?.code || report.status] || "bg-secondary"}`}>
                        {STATUS_LABELS[report.status?.code || report.status] || report.status?.code || "Inconnu"}
                      </span>
                    </td>
                    <td>{formatDate(report.created_at || report.createdAt)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {(report.status?.code === "PENDING" || report.status === "PENDING") && (
                          <button
                            type="button"
                            className="btn btn-outline-warning"
                            onClick={() => handleReview(report.id)}
                            disabled={actionLoading === report.id}
                          >
                            Mettre en revue
                          </button>
                        )}
                        {(report.status?.code === "REVIEWED" || report.status === "REVIEWED") && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => handleTakeAction(report.id)}
                              disabled={actionLoading === report.id}
                            >
                              Agir & Résoudre
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => handleDismiss(report.id)}
                              disabled={actionLoading === report.id}
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
