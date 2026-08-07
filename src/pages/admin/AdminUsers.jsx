import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import EmptyState from "../../components/feedback/EmptyState"
import * as adminService from "../../services/adminService.js"

const ROLE_LABELS = {
  admin: "Admin",
  owner: "Propriétaire",
  tenant: "Locataire",
}
const ROLE_CLASSES = {
  admin: "bg-dark",
  owner: "bg-primary",
  tenant: "bg-info",
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await adminService.getAllUsers()
        if (active) setUsers(data)
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
    const data = await adminService.getAllUsers()
    setUsers(data)
    setLoading(false)
  }

  const handleBan = async (id, currentStatus) => {
    if (
      !window.confirm(
        currentStatus === "banned"
          ? "Réactiver ce compte ?"
          : "Suspendre ce compte ?"
      )
    )
      return
    if (currentStatus === "banned") {
      await adminService.unbanUser(id)
    } else {
      await adminService.banUser(id)
    }
    await refresh()
  }

  const handleRoleChange = async (id, newRole) => {
    await adminService.changeUserRole(id, newRole)
    await refresh()
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && users.length === 0) {
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
          <h1 className="h3 mb-1">Gestion des utilisateurs</h1>
          <p className="text-muted mb-0">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} au total.
          </p>
        </div>
        <Link
          to="/admin/dashboard"
          className="btn btn-sm btn-outline-secondary"
        >
          Retour
        </Link>
      </header>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom ou email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Aucun utilisateur trouvé." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${ROLE_CLASSES[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.status === "banned" ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {u.status === "banned" ? "Suspendu" : "Actif"}
                    </span>
                  </td>
                  <td>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                      : "\u2014"}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "auto" }}
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value)
                        }
                      >
                        <option value="tenant">Locataire</option>
                        <option value="owner">Propriétaire</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        className={`btn ${
                          u.status === "banned"
                            ? "btn-outline-success"
                            : "btn-outline-danger"
                        }`}
                        onClick={() => handleBan(u.id, u.status)}
                      >
                        {u.status === "banned" ? "Réactiver" : "Suspendre"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
