import { useEffect, useState, useCallback } from "react"
import { getAuditLogs, getAuditLogById } from "../../api/superAdminApi"
import EmptyState from "../../components/feedback/EmptyState"
import PageHeader from "../../components/common/PageHeader"
import { SkeletonTable } from "../../components/feedback/SkeletonLoader"
import Pagination from "../../components/common/Pagination"
import { PAGE_LIMIT } from "../../utils/formatters"
import { formatAuditValues, formatAuditMetadata, formatActorRole } from "../../utils/formatAuditValues"

const ACTION_OPTIONS = [
  { value: "ROLE_CHANGE", label: "Changement de rôle" },
  { value: "STATUS_CHANGE", label: "Changement de statut" },
  { value: "PASSWORD_RESET", label: "Réinitialisation mot de passe" },
  { value: "ACCOUNT_DELETE", label: "Suppression de compte" },
  { value: "ACCOUNT_VERIFY", label: "Vérification de compte" },
  { value: "ANNOUNCEMENT_MODERATE", label: "Modération d'annonce" },
]

const TARGET_OPTIONS = [
  { value: "USER", label: "Utilisateur" },
  { value: "ANNOUNCEMENT", label: "Annonce" },
  { value: "SUBSCRIPTION", label: "Abonnement" },
  { value: "REPORT", label: "Signalement" },
]

export default function RootAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [actionFilter, setActionFilter] = useState("")
  const [targetFilter, setTargetFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [selectedLog, setSelectedLog] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadLogs = useCallback(async (active = true) => {
    try {
      const params = { page, limit: PAGE_LIMIT }
      if (actionFilter) params.action = actionFilter
      if (targetFilter) params.target_type = targetFilter
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const data = await getAuditLogs(params)
      if (active) {
        setLogs(data.items || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalItems(data.pagination?.total || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }, [page, actionFilter, targetFilter, dateFrom, dateTo])

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs(active)
    return () => { active = false }
  }, [loadLogs])

  const changeFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const openLogDetail = async (id) => {
    setLoadingDetail(true)
    try {
      const data = await getAuditLogById(id)
      setSelectedLog(data)
    } catch {
      alert("Erreur lors de la récupération du log.")
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Logs d'audit"
        description={`${totalItems} entrée(s) dans le journal d'audit.`}
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <select className="form-select" value={actionFilter} onChange={(e) => changeFilter(setActionFilter)(e.target.value)}>
                <option value="">Toutes les actions</option>
                {ACTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={targetFilter} onChange={(e) => changeFilter(setTargetFilter)(e.target.value)}>
                <option value="">Toutes les cibles</option>
                {TARGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" value={dateFrom} onChange={(e) => changeFilter(setDateFrom)(e.target.value)} placeholder="Date début" />
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" value={dateTo} onChange={(e) => changeFilter(setDateTo)(e.target.value)} placeholder="Date fin" />
            </div>
          </div>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <SkeletonTable rows={5} cols={6} />
      ) : logs.length === 0 ? (
        <EmptyState message="Aucun log d'audit ne correspond à vos filtres." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle table-hover table-renthub mb-0">
              <thead>
                <tr>
                  <th>Acteur</th>
                  <th>Action</th>
                  <th>Cible</th>
                  <th>IP</th>
                  <th>Date</th>
                  <th className="text-end">Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="fw-semibold">{log.actor?.firstname} {log.actor?.lastname}</div>
                      <div className="small text-muted">{log.actor_email}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{ACTION_LABELS[log.action] || log.action}</span>
                    </td>
                    <td>
                      <span className="small">{log.target_type} #{log.target_id || "—"}</span>
                    </td>
                    <td>
                      <span className="small text-muted">{log.ip_address || "—"}</span>
                    </td>
                    <td>
                      <small className="text-muted">{new Date(log.createdAt).toLocaleString("fr-FR")}</small>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openLogDetail(log.id)}
                        disabled={loadingDetail}
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <>
          <p className="text-secondary small text-center mt-3 mb-0">
            {totalItems} entrée{totalItems > 1 ? "s" : ""}
            {totalPages > 1 && ` — Page ${page} sur ${totalPages}`}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} ariaLabel="Pagination des logs" />
        </>
      )}

      {selectedLog && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Log d'audit #{selectedLog.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedLog(null)} />
              </div>
              <div className="modal-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Acteur</span>
                    <span className="fw-medium">{selectedLog.actor?.firstname} {selectedLog.actor?.lastname} ({selectedLog.actor_email})</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Rôle acteur</span>
                    <span className="fw-medium">{formatActorRole(selectedLog.actor_role)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Action</span>
                    <span className="fw-medium">{ACTION_LABELS[selectedLog.action] || selectedLog.action}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Cible</span>
                    <span className="fw-medium">{selectedLog.target_type} #{selectedLog.target_id || "—"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">IP</span>
                    <span className="fw-medium">{selectedLog.ip_address || "—"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Date</span>
                    <span className="fw-medium">{new Date(selectedLog.createdAt).toLocaleString("fr-FR")}</span>
                  </li>
                </ul>
                {(() => {
                  const formatted = formatAuditValues(selectedLog.old_values, selectedLog.action)
                  if (!formatted) return null
                  return (
                    <div className="mt-3">
                      <h6 className="fw-bold small text-muted mb-1">Valeurs avant</h6>
                      <div className="bg-light p-3 rounded small mb-0">
                        {Object.entries(formatted).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-muted">{key} :</span>{" "}
                            <span className="fw-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                {(() => {
                  const formatted = formatAuditValues(selectedLog.new_values, selectedLog.action)
                  if (!formatted) return null
                  return (
                    <div className="mt-3">
                      <h6 className="fw-bold small text-muted mb-1">Valeurs après</h6>
                      <div className="bg-light p-3 rounded small mb-0">
                        {Object.entries(formatted).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-muted">{key} :</span>{" "}
                            <span className="fw-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                {(() => {
                  const formatted = formatAuditMetadata(selectedLog.metadata)
                  if (!formatted) return null
                  return (
                    <div className="mt-3">
                      <h6 className="fw-bold small text-muted mb-1">Métadonnées</h6>
                      <div className="bg-light p-3 rounded small mb-0">
                        {Object.entries(formatted).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-muted">{key} :</span>{" "}
                            <span className="fw-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div className="modal-footer border-top-0 mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ACTION_LABELS = {
  ROLE_CHANGE: "Changement de rôle",
  STATUS_CHANGE: "Changement de statut",
  PASSWORD_RESET: "Réinit. mot de passe",
  ACCOUNT_DELETE: "Suppression compte",
  ACCOUNT_VERIFY: "Vérification compte",
  ANNOUNCEMENT_MODERATE: "Modération annonce",
  CREATE: "Création",
  UPDATE: "Mise à jour",
}
