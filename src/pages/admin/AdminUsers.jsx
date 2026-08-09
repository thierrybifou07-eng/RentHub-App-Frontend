import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { getUsers, getUserById, manageUserStatus, manageUserRole, verifyUser } from "../../api/adminApi"
import EmptyState from "../../components/feedback/EmptyState"
import PageHeader from "../../components/common/PageHeader"
import LoadingState from "../../components/feedback/LoadingState"


const ROLE_CLASSES = {
  ROLE_ADMIN: "bg-dark",
  ROLE_OWNER: "bg-primary",
  ROLE_TENANT: "bg-info text-dark",
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  // Filters
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadUsers = useCallback(async (active = true) => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (roleFilter) params.role_id = roleFilter
      if (statusFilter) params.user_status_id = statusFilter

      const data = await getUsers(params)
      if (active) setUsers(data.items || data || [])
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }, [search, roleFilter, statusFilter])

  useEffect(() => {
    let active = true
    loadUsers(active)
    return () => { active = false }
  }, [loadUsers]) // Debounce ideally for search, but simplified here

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
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (id, currentRole, newRole) => {
    setActionLoading(id)
    try {
      await manageUserRole({ userId: id, currentRole, newRole })
      await loadUsers()
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
        description={`${users.length} compte(s) trouvé(s) avec les filtres actuels.`}
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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">Tous les rôles</option>
                <option value="ROLE_TENANT">Locataires</option>
                <option value="ROLE_OWNER">Propriétaires</option>
                <option value="ROLE_ADMIN">Admins</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
        <LoadingState message="Chargement des utilisateurs..." />
      ) : users.length === 0 ? (
        <EmptyState message="Aucun utilisateur ne correspond à votre recherche." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
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
                          <span className="text-success fw-bold">✓ Oui</span>
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
