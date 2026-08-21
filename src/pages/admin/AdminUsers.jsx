import { useEffect, useState, useCallback } from "react"
import { getUsers, getUserById, manageUserStatus, manageUserRole, verifyUser } from "../../api/adminApi"
import EmptyState from "../../components/feedback/EmptyState"
import PageHeader from "../../components/common/PageHeader"
import { SkeletonTable } from "../../components/feedback/SkeletonLoader"
import Pagination from "../../components/common/Pagination"
import { CircleCheck } from "lucide-react"
import { PAGE_LIMIT } from "../../utils/formatters"

const ROLE_CLASSES = {
  ROLE_ADMIN: "bg-secondary text-white",
  ROLE_OWNER: "bg-primary",
  ROLE_TENANT: "bg-warning text-dark",
}

const ROLE_ID_BY_CODE = {
  ROLE_TENANT: 4,
  ROLE_OWNER: 5,
  ROLE_ADMIN: 2,
}

const STATUS_ID_BY_CODE = {
  ACTIVE: 1,
  SUSPENDED: 3,
  PENDING_VERIFICATION: 4,
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Filters
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadUsers = useCallback(async (active = true) => {
    try {
      const params = { page, limit: PAGE_LIMIT }
      if (search) params.search = search
      if (roleFilter) params.role_id = ROLE_ID_BY_CODE[roleFilter]
      if (statusFilter) params.user_status_id = STATUS_ID_BY_CODE[statusFilter]

      const data = await getUsers(params)
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
    const onLoad = () => loadUsers(active)
    onLoad()
    return () => { active = false }
  }, [loadUsers]) // Debounce ideally for search, but simplified here

  const changeFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const handleBan = async (id, currentStatus) => {
    const isBanned = currentStatus?.code === "SUSPENDED" || currentStatus === "SUSPENDED"
    if (!window.confirm(isBanned ? "Réactiver ce compte ?" : "Suspendre ce compte ?")) return

    setActionLoading(id)
    try {
      await manageUserStatus({
        userId: id,
        currentStatus: isBanned ? "SUSPENDED" : "ACTIVE",
        newStatus: isBanned ? "ACTIVE" : "SUSPENDED"
      })
      await loadUsers()
    } catch (err) {
      alert(err.message || "Erreur lors du changement de statut.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (id, currentRole, newRole) => {
    setActionLoading(id)
    try {
      await manageUserRole({ userId: id, currentRole, newRole })
      await loadUsers()
    } catch (err) {
      alert(err.message || "Erreur lors du changement de rôle.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerify = async (id) => {
    if (!window.confirm("Marquer cet utilisateur comme vérifié (KYC complet) ?")) return
    setActionLoading(id)
    try {
      await verifyUser(id)
      await loadUsers()
    } catch (err) {
      alert(err.message || "Erreur lors de la vérification.")
    } finally {
      setActionLoading(null)
    }
  }

  const openUserDetail = async (id) => {
    setLoadingDetail(true)
    try {
      const data = await getUserById(id)
      setSelectedUser(data)
    } catch {
      alert("Erreur lors de la récupération des détails.")
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Gestion des utilisateurs"
        description={`${totalItems} compte(s) trouvé(s) avec les filtres actuels.`}
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher (nom, email...)"
                value={search}
                onChange={(e) => changeFilter(setSearch)(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={roleFilter} onChange={(e) => changeFilter(setRoleFilter)(e.target.value)}>
                <option value="">Tous les rôles</option>
                <option value="ROLE_TENANT">Locataires</option>
                <option value="ROLE_OWNER">Propriétaires</option>
                <option value="ROLE_ADMIN">Admins</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => changeFilter(setStatusFilter)(e.target.value)}>
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="PENDING_VERIFICATION">En attente email</option>
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
                  const roleCode = u.role?.code || u.role || "ROLE_TENANT"
                  const statusCode = u.status?.code || u.status || "ACTIVE"
                  const isBanned = statusCode === "SUSPENDED"

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-semibold">{u.firstname} {u.lastname}</div>
                        <div className="small text-muted">{u.name}</div>
                      </td>
                      <td>
                        <div>{u.email}</div>
                        <div className="small text-muted">{u.phone || "—"}</div>
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm shadow-none border-0 fw-bold ${ROLE_CLASSES[roleCode] || "bg-light"}`}
                          style={{ width: "130px", color: "inherit" }}
                          value={roleCode}
                          onChange={(e) => handleRoleChange(u.id, roleCode, e.target.value)}
                          disabled={actionLoading === u.id}
                        >
                          <option value="ROLE_TENANT">Locataire</option>
                          <option value="ROLE_OWNER">Propriétaire</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${isBanned ? "bg-danger" : statusCode === "ACTIVE" ? "bg-success" : "bg-warning text-dark"}`}>
                          {isBanned ? "Suspendu" : statusCode === "ACTIVE" ? "Actif" : statusCode}
                        </span>
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
                          {!(u.verified_at || u.verifiedAt) && (
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleVerify(u.id)}
                              disabled={actionLoading === u.id}
                            >
                              Vérifier
                            </button>
                          )}
                          <button
                            type="button"
                            className={`btn ${isBanned ? "btn-success" : "btn-outline-danger"}`}
                            onClick={() => handleBan(u.id, statusCode)}
                            disabled={actionLoading === u.id}
                          >
                            {isBanned ? "Réactiver" : "Suspendre"}
                          </button>
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

      {/* Modal Détails Utilisateur */}
      {selectedUser && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Détails utilisateur #{selectedUser.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)}></button>
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
                    <span className="text-muted">Genre</span>
                    <span className="fw-medium">{selectedUser.gender || "—"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Ville ID</span>
                    <span className="fw-medium">{selectedUser.city_id || selectedUser.cityId || "—"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="text-muted">Inscription</span>
                    <span className="fw-medium">{selectedUser.created_at || selectedUser.createdAt ? new Date(selectedUser.created_at || selectedUser.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
                  </li>
                </ul>
              </div>
              <div className="modal-footer border-top-0 mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
