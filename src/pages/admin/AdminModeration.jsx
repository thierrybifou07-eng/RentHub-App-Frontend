import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ListingBadge from "../../components/listings/ListingBadge"
import EmptyState from "../../components/feedback/EmptyState"
import PageHeader from "../../components/common/PageHeader"
import LoadingState from "../../components/feedback/LoadingState"
import { getModerationListings, approveListing, rejectListing, deleteListing } from "../../services/adminService"

export default function AdminModeration() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    let active = true
    loadListings(active)
    return () => { active = false }
  }, [])

  async function loadListings(active = true) {
    setLoading(true)
    try {
      const data = await getModerationListings()
      if (active) setListings(data.items || data || [])
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await approveListing(id)
      await loadListings()
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    const reason = prompt("Raison du rejet de l'annonce :")
    if (reason === null) return
    setActionLoading(id)
    try {
      await rejectListing(id, reason || "Non conforme aux règles")
      await loadListings()
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) return
    setActionLoading(id)
    try {
      await deleteListing(id)
      await loadListings()
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === "all"
    ? listings
    : listings.filter((l) => l.status?.code === filter || l.status === filter)

  if (loading && listings.length === 0) {
    return <LoadingState message="Chargement des annonces à modérer..." />
  }

  return (
    <div>
      <PageHeader 
        title="Modération des annonces" 
        description="Approuvez, rejetez ou supprimez les annonces en attente." 
      />

      <ul className="nav nav-pills mb-4">
        {[
          { key: "all", label: "Toutes" },
          { key: "PENDING", label: "En attente" },
          { key: "REJECTED", label: "Rejetées" },
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
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Annonce</th>
                  <th>Propriétaire</th>
                  <th>Localisation</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((listing) => {
                  const ownerName = listing.owner?.name || listing.owner?.email || "Inconnu"
                  const cityName = listing.city?.name || listing.city || "Inconnue"
                  const statusCode = listing.status?.code || listing.status
                  
                  return (
                    <tr key={listing.id}>
                      <td className="fw-semibold">
                        <Link to={`/annonces/${listing.id}`} target="_blank">
                          {listing.title}
                        </Link>
                      </td>
                      <td>{ownerName}</td>
                      <td>{cityName}</td>
                      <td>{listing.price.toLocaleString("fr-FR")}&nbsp;FCFA</td>
                      <td>
                        <ListingBadge status={statusCode} />
                      </td>
                      <td className="text-end">
                        {statusCode === "PENDING" && (
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => handleApprove(listing.id)}
                              disabled={actionLoading === listing.id}
                            >
                              Approuver
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleReject(listing.id)}
                              disabled={actionLoading === listing.id}
                            >
                              Rejeter
                            </button>
                          </div>
                        )}
                        {statusCode === "REJECTED" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(listing.id)}
                            disabled={actionLoading === listing.id}
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
        </div>
      )}
    </div>
  )
}
