import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getUserById } from "../../models/user.js"
import { getListingById } from "../../models/listing.js"
import EmptyState from "../../components/feedback/EmptyState"
import * as adminService from "../../services/adminService.js"

const STATUS_CLASSES = {
  pending: "bg-info",
  resolved: "bg-success",
  dismissed: "bg-secondary",
}
const STATUS_LABELS = {
  pending: "En attente",
  resolved: "Résolu",
  dismissed: "Rejeté",
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await adminService.getReports()
        if (active) setReports(data)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const refresh = async () => {
    setLoading(true)
    const data = await adminService.getReports()
    setReports(data)
    setLoading(false)
  }

  const handleResolve = async (id) => {
    await adminService.resolveReport(id)
    await refresh()
  }

  const handleDismiss = async (id) => {
    if (!window.confirm("Rejeter ce signalement ?")) return
    await adminService.dismissReport(id)
    await refresh()
  }

  const filtered =
    filter === "all"
      ? reports
      : reports.filter((r) => r.status === filter)

  if (loading && reports.length === 0) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow">
          <span className="placeholder col-4 mb-3"></span>
          <span className="placeholder col-12 mb-2" style={{ height: 320 }}></span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Signalements</h1>
          <p className="text-muted mb-0">
            {reports.filter((r) => r.status === "pending").length} en attente
          </p>
        </div>
        <Link
          to="/admin/dashboard"
          className="btn btn-sm btn-outline-secondary"
        >
          Retour
        </Link>
      </header>

      <ul className="nav nav-pills mb-3">
        {[
          { key: "all", label: "Toutes" },
          { key: "pending", label: "En attente" },
          { key: "resolved", label: "Résolus" },
          { key: "dismissed", label: "Rejetés" },
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

      {filtered.length === 0 ? (
        <EmptyState message="Aucun signalement pour le moment." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Signalé par</th>
                <th>Type</th>
                <th>Cible</th>
                <th>Raison</th>
                <th>Statut</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => {
                const reporter = getUserById(report.reporterId)
                let targetName
                if (report.targetType === "listing") {
                  const listing = getListingById(report.targetId)
                  targetName = listing ? listing.title : report.targetId
                } else {
                  const user = getUserById(report.targetId)
                  targetName = user ? user.name : report.targetId
                }
                return (
                  <tr key={report.id}>
                    <td>{reporter ? reporter.name : "Inconnu"}</td>
                    <td>
                      <span className="text-capitalize">
                        {report.targetType === "listing"
                          ? "Annonce"
                          : "Utilisateur"}
                      </span>
                    </td>
                    <td className="fw-semibold">{targetName}</td>
                    <td>{report.reason}</td>
                    <td>
                      <span
                        className={`badge ${STATUS_CLASSES[report.status]}`}
                      >
                        {STATUS_LABELS[report.status]}
                      </span>
                    </td>
                    <td>
                      {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="text-end">
                      {report.status === "pending" && (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => handleResolve(report.id)}
                          >
                            Résoudre
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleDismiss(report.id)}
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
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
