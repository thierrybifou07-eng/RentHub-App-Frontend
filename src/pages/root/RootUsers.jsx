import { useEffect, useState, useCallback } from "react"
import { getUsersAllRoles, getSuperUserDetail, changeUserRole, changeUserStatus, adminResetPassword, softDeleteUser } from "../../api/superAdminApi"
import EmptyState from "../../components/feedback/EmptyState"
import PageHeader from "../../components/common/PageHeader"
import { SkeletonTable } from "../../components/feedback/SkeletonLoader"
import Pagination from "../../components/common/Pagination"
import { CircleCheck } from "lucide-react"
import { PAGE_LIMIT } from "../../utils/formatters"

const ROLE_CLASSES = {
  ROLE_ADMIN: "bg-secondary text-white",
  ROLE_ROOT: "bg-dark text-white",
  ROLE_OWNER: "bg-primary",
  ROLE_TENANT: "bg-warning text-dark",
  ROLE_AGENCY: "bg-info text-dark",
}

const ROLE_ID_MAP = {
  ROLE_TENANT: 4,
  ROLE_OWNER: 5,
  ROLE_ADMIN: 2,
  ROLE_ROOT: 3,
  ROLE_AGENCY: 6,
}

const STATUS_MAP = {
  ACTIVE: { id: 1, label: "Actif", class: "bg-success" },
  SUSPENDED: { id: 3, label: "Suspendu", class: "bg-danger" },
  INACTIVE: { id: 2, label: "Inactif", class: "bg-secondary" },
  PENDING_VERIFICATION: { id: 4, label: "En attente", class: "bg-warning text-dark" },
}

export default function RootUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadUsers = useCallback(async (active = true) => {
    try {
      const params = { page, limit: PAGE_LIMIT }
      if (search) params.search = search
      if (roleFilter) params.role_id = ROLE_ID_MAP[roleFilter]
      if (statusFilter) params.user_status_id = STATUS_MAP[statusFilter]?.id

      const data = await getUsersAllRoles(params)
      if (active) {
        setUsers(data.items || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalItems(data.pagination?.total || data.items?.length || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers(active)
    return () => { active = false }
  }, [loadUsers])

  const changeFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const handleRoleChange = async (userId, currentRoleId, newRoleId) => {
    if (!window.confirm("Changer le rôle de cet utilisateur ?")) return
    setActionLoading(userId)
    try {
      await changeUserRole(userId, newRoleId)
      await loadUsers()
    } catch (err) {
      alert(err.message || "Erreur lors du changement de rôle.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (userId, currentStatusId, newStatusId) => {
    const label = Object.values(STATUS_MAP).find((s) => s.id === newStatusId)?.label || newStatusId
    const reason = window.prompt(`Motif du changement de statut en "${label}" ? (optionnel)`)
    if (reason === null) return
    setActionLoading(userId)
    try {
      await changeUserStatus(userId, newStatusId, reason || undefined)
      await loadUsers()
    } catch (err) {
      alert(err.message || "Erreur lors du changement de statut.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (userId, userName) => {
    if (!window.confirm(`Réinitialiser le mot de passe de ${userName} ? Un email lui sera envoyé.`)) return
    setActionLoading(userId)
    try {
      await adminResetPassword(userId)
      alert("Mot de passe réinitialisé avec succès.")
    } catch (err) {
      alert(err.message || "Erreur lors de la réinitialisation.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${userName} ? Cette action est irréversible.`)) return
    setActionLoading(userId)
    try {
      await softDeleteUser(userId)
      await loadUsers()
    } catch (err) {
      alert(err.message || "Erreur lors de la suppression.")
    } finally {
      setActionLoading(null)
    }
  }

  const openUserDetail = async (id) => {
    setLoadingDetail(true)
    try {
      const data = await getSuperUserDetail(id)
      setSelectedUser(data)
    } catch {
      alert("Erreur lors de la récupération des détails.")
    } finally {
      setLoadingDetail(false)
    }
  }

  const getRoleCode = (user) => user.role?.code || "ROLE_TENANT"
  const getStatusCode = (user) => user.status?.code || "ACTIVE"

  return (
    <div>
      <PageHeader
        title="Administration des utilisateurs"
        description={`${totalItems} compte(s) — Tous les rôles incluant les administrateurs.`}
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher (nom, email...)"
                value={search}
                onChange={(e) => changeFilter(setSearch)(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={roleFilter} onChange={(e) => changeFilter(setRoleFilter)(e.target.value)}>
                <option value="">Tous les rôles</option>
                {Object.entries(ROLE_ID_MAP).map(([code]) => (
                  <option key={code} value={code}>{code.replace("ROLE_", "")}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={statusFilter} onChange={(e) => changeFilter(setStatusFilter)(e.target.value)}>
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_MAP).map(([code, s]) => (
                  <option key={code} value={code}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <SkeletonTable rows={5} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState message="Aucun utilisateur ne correspond à votre recherche." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle table-hover table-renthub mb-0">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Contact</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Vérifié</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleCode = getRoleCode(u)
                  const statusCode = getStatusCode(u)
                  const isRoot = roleCode === "ROLE_ROOT"

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-semibold">{u.firstname} {u.lastname}</div>
                        <div className="small text-muted">{u.email}</div>
                      </td>
                      <td>
                        <div>{u.email}</div>
                        <div className="small text-muted">{u.phone || "—"}</div>
                      </td>
                      <td>
                        {isRoot ? (
                          <span className={`badge ${ROLE_CLASSES.ROLE_ROOT}`}>ROOT</span>
                        ) : (
                          <select
                            className={`form-select form-select-sm shadow-none border-0 fw-bold ${ROLE_CLASSES[roleCode] || "bg-light"}`}
                            style={{ width: "130px", color: "inherit" }}
                            value={roleCode}
                            onChange={(e) => handleRoleChange(u.id, roleCode, ROLE_ID_MAP[e.target.value])}
                            disabled={actionLoading === u.id || isRoot}
                          >
                            <option value="ROLE_TENANT">Locataire</option>
                            <option value="ROLE_OWNER">Propriétaire</option>
                            <option value="ROLE_ADMIN">Admin</option>
                            <option value="ROLE_AGENCY">Agence</option>
                          </select>
                        )}
                      </td>
                      <td>
                        {isRoot ? (
                          <span className="badge bg-dark">Protégé</span>
                        ) : (
                          <select
                            className={`form-select form-select-sm shadow-none border-0 fw-bold ${STATUS_MAP[statusCode]?.class || "bg-light"}`}
                            style={{ width: "120px", color: "inherit" }}
                            value={statusCode}
                            onChange={(e) => handleStatusChange(u.id, STATUS_MAP[statusCode]?.id, STATUS_MAP[e.target.value]?.id)}
                            disabled={actionLoading === u.id}
                          >
                            {Object.entries(STATUS_MAP).map(([code, s]) => (
                              <option key={code} value={code}>{s.label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        {u.verified_at || u.verifiedAt ? (
                          <span className="text-success fw-bold"><CircleCheck size={14} className="me-1" />Oui</span>
                        ) : (
                          <span className="text-muted">Non</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => openUserDetail(u.id)}
                            disabled={actionLoading === u.id || loadingDetail}
                          >
                            Détails
                          </button>
                          {!isRoot && (
                            <>
                              <button
                                type="button"
                                className="btn btn-outline-warning"
                                onClick={() => handleResetPassword(u.id, `${u.firstname} ${u.lastname}`)}
                                disabled={actionLoading === u.id}
                              >
                                Réinit. MDP
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(u.id, `${u.firstname} ${u.lastname}`)}
                                disabled={actionLoading === u.id}
                              >
                                Supprimer
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
        </div>
      )}

      {!loading && users.length > 0 && (
        <>
          <p className="text-secondary small text-center mt-3 mb-0">
            {totalItems} compte{totalItems > 1 ? "s" : ""}
            {totalPages > 1 && ` — Page ${page} sur ${totalPages}`}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} ariaLabel="Pagination des utilisateurs" />
        </>
      )}

      {selectedUser && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Détails utilisateur #{selectedUser.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)} />
              </div>
              <div className="modal-body py-0 mb-3">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Prénom / Nom</span>
                    <span className="fw-medium">{selectedUser.firstname} {selectedUser.lastname}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Email</span>
                    <span className="fw-medium">{selectedUser.email}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Téléphone</span>
                    <span className="fw-medium">{selectedUser.phone || "—"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Inscription</span>
                    <span className="fw-medium">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
                  </li>
                </ul>
              </div>
              <div className="modal-footer border-top-0 mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
