import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getUserById } from "../../models/user.js"
import ListingBadge from "../../components/listings/ListingBadge"
import EmptyState from "../../components/feedback/EmptyState"
import * as adminService from "../../services/adminService.js"

export default function AdminModeration() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await adminService.getModerationListings()
        if (active) setListings(data)
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
    const data = await adminService.getModerationListings()
    setListings(data)
    setLoading(false)
  }

  const handleApprove = async (id) => {
    await adminService.approveListing(id)
    await refresh()
  }

  const handleReject = async (id) => {
    if (!window.confirm("Rejeter cette annonce ?")) return
    await adminService.rejectListing(id)
    await refresh()
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) return
    await adminService.deleteListing(id)
    await refresh()
  }

  const filtered =
    filter === "all"
      ? listings
      : listings.filter((l) => l.status === filter)

  if (loading && listings.length === 0) {
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
          <h1 className="h3 mb-1">Modération des annonces</h1>
          <p className="text-muted mb-0">
            Approuvez, rejetez ou supprimez les annonces signalées.
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
          { key: "rejected", label: "Rejetées" },
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
        <EmptyState message="Aucune annonce à modérer pour le moment." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Annonce</th>
                <th>Propriétaire</th>
                <th>Ville</th>
                <th>Prix</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => {
                const owner = getUserById(listing.ownerId)
                return (
                  <tr key={listing.id}>
                    <td className="fw-semibold">{listing.title}</td>
                    <td>{owner ? owner.name : "Inconnu"}</td>
                    <td>{listing.city}</td>
                    <td>{listing.price.toLocaleString("fr-FR")}&nbsp;FCFA</td>
                    <td>
                      <ListingBadge status={listing.status} />
                    </td>
                    <td className="text-end">
                      {listing.status === "pending" && (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => handleApprove(listing.id)}
                          >
                            Approuver
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleReject(listing.id)}
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                      {listing.status === "rejected" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(listing.id)}
                        >
                          Supprimer
                        </button>
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
