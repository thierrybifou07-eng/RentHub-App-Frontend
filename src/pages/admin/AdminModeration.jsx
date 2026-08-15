import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ListingBadge from "../../components/listings/ListingBadge"
import EmptyState from "../../components/feedback/EmptyState"
import PageHeader from "../../components/common/PageHeader"
import LoadingState from "../../components/feedback/LoadingState"
import Pagination from "../../components/common/Pagination"
import { getModerationListings, approveListing, rejectListing, deleteListing } from "../../services/adminService"

const PAGE_LIMIT = 10

export default function AdminModeration() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)

  const loadListings = useCallback(async (active = true) => {
    setLoading(true)
    try {
      const params = { page, limit: PAGE_LIMIT }
      if (filter === "REJECTED") params.status = "REJECTED"
      if (filter === "PENDING_REVIEW") params.status = "PENDING_REVIEW"
      const data = await getModerationListings(params)
      if (active) {
        setListings(data.items || [])
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
    loadListings(active)
    return () => { active = false }
  }, [loadListings])

  const changeFilter = (key) => {
    setFilter(key)
    setPage(1)
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
          { key: "PENDING_REVIEW", label: "En attente" },
          { key: "REJECTED", label: "Rejetées" },
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

      {listings.length === 0 ? (
        <EmptyState message="Aucune annonce à modérer pour le moment." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle table-hover table-renthub mb-0">
              <thead>
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
                {listings.map((listing) => {
                  const ownerName = listing.owner ? `${listing.owner.firstname} ${listing.owner.lastname}` : "Inconnu"
                  const cityName = listing.City?.name || listing.city || "Inconnue"
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
                        <ListingBadge statusId={listing.status?.id ?? listing.status_id} />
                      </td>
                      <td className="text-end">
                        {statusCode === "PENDING_REVIEW" && (
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

      {!loading && listings.length > 0 && (
        <>
          <p className="text-secondary small text-center mt-3 mb-0">
            {totalItems} annonce{totalItems > 1 ? "s" : ""}
            {totalPages > 1 && ` — Page ${page} sur ${totalPages}`}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} ariaLabel="Pagination de la modération" />
        </>
      )}
    </div>
  )
}
