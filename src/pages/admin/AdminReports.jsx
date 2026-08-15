import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { getAdminReports, reviewReport, dismissReport, takeActionReport } from "../../api/reportsApi"
import EmptyState from "../../components/feedback/EmptyState"
import LoadingState from "../../components/feedback/LoadingState"
import Pagination from "../../components/common/Pagination"
import { formatDate } from "../../utils/formatters"

const PAGE_LIMIT = 20

const STATUS_CLASSES = {
  PENDING: "bg-info",
  REVIEWED: "bg-warning",
  ACTION_TAKEN: "bg-success",
  DISMISSED: "bg-secondary",
}
const STATUS_LABELS = {
  PENDING: "En attente",
  REVIEWED: "En revue",
  ACTION_TAKEN: "Résolu",
  DISMISSED: "Rejeté",
}

const STATUS_ID_BY_CODE = {
  PENDING: 1,
  REVIEWED: 2,
  DISMISSED: 3,
  ACTION_TAKEN: 4,
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  // Note admin pour les actions
  const adminNote = ""
  const [actionLoading, setActionLoading] = useState(null)

  const loadReports = useCallback(async (active = true) => {
    setLoading(true)
    try {
      const params = { page, limit: PAGE_LIMIT }
      if (filter !== "all") params.status_id = STATUS_ID_BY_CODE[filter]
      const data = await getAdminReports(params)
      if (active) {
        setReports(data.items || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalItems(data.pagination?.total || data.items?.length || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    let active = true
    loadReports(active)
    return () => { active = false }
  }, [loadReports])

  const changeFilter = (key) => {
    setFilter(key)
    setPage(1)
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
          { key: "ACTION_TAKEN", label: "Résolus" },
          { key: "DISMISSED", label: "Rejetés" },
        ].map((t) => (
          <li key={t.key} className="nav-item">
            <button
              type="button"
              className={`nav-link ${filter === t.key ? "active" : ""}`}
              onClick={() => changeFilter(t.key)}
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
          <table className="table align-middle table-hover table-renthub">
            <thead>
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
                const targetName = report.Announcement?.title || `Annonce #${report.announcement_id}`
                const reporterName = report.reporter
                  ? `${report.reporter.firstname} ${report.reporter.lastname}`
                  : "Inconnu"
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

      {!loading && reports.length > 0 && (
        <>
          <p className="text-secondary small text-center mt-3 mb-0">
            {totalItems} signalement{totalItems > 1 ? "s" : ""}
            {totalPages > 1 && ` — Page ${page} sur ${totalPages}`}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} ariaLabel="Pagination des signalements" />
        </>
      )}
    </div>
  )
}
