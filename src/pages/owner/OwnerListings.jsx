import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { getOwnerListings, deleteListing, updateListingStatus } from "../../services/ownerService"
import { formatXAF } from "../../utils/formatters"
import { PROPERTY_TYPES } from "../../constants/listingOptions"
import PageHeader from "../../components/common/PageHeader"
import ListingBadge from "../../components/listings/ListingBadge"
import EmptyState from "../../components/feedback/EmptyState"
import LoadingState from "../../components/feedback/LoadingState"

function OwnerListings() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    if (!user) return
    let active = true
    getOwnerListings(user.id).then((result) => {
      if (active) {
        setListings(result)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [user])

  async function handleDelete(listingId, title) {
    if (!window.confirm(`Supprimer l'annonce \u00ab\u00a0${title}\u00a0\u00bb\u2002? Cette action est irréversible.`)) return
    setActionError(null)
    try {
      await deleteListing(listingId)
      setListings((prev) => prev.filter((l) => l.id !== listingId))
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleStatusToggle(listingId, currentStatus) {
    setActionError(null)
    const newStatus = currentStatus === "published" ? "archived" : "published"
    try {
      const updated = await updateListingStatus(listingId, newStatus)
      setListings((prev) => prev.map((l) => (l.id === listingId ? updated : l)))
    } catch (err) {
      setActionError(err.message)
    }
  }

  function getTypeLabel(type) {
    return PROPERTY_TYPES.find((t) => t.value === type)?.label || type
  }

  return (
    <div>
      <PageHeader
        title="Mes annonces"
        description="Gérez vos biens immobiliers."
      >
        <Link to={APP_ROUTES.ownerListingNew} className="btn btn-success btn-sm">
          + Nouvelle annonce
        </Link>
      </PageHeader>

      {actionError && (
        <div className="alert alert-danger small py-2" role="alert">
          {actionError}
        </div>
      )}

      {loading ? (
        <LoadingState message="Chargement de vos annonces..." />
      ) : listings.length === 0 ? (
        <EmptyState
          title="Aucune annonce"
          description="Vous n'avez pas encore créé d'annonce."
          action={{ to: APP_ROUTES.ownerListingNew, label: "Créer une annonce" }}
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-3">Titre</th>
                    <th scope="col">Type</th>
                    <th scope="col">Ville</th>
                    <th scope="col" className="text-end">Prix</th>
                    <th scope="col" className="text-center">Statut</th>
                    <th scope="col" className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="ps-3 fw-semibold">
                        <Link
                          to={`${APP_ROUTES.listings.replace(":listingId", "")}${listing.id}`}
                          className="text-decoration-none"
                        >
                          {listing.title}
                        </Link>
                      </td>
                      <td className="small">{getTypeLabel(listing.type)}</td>
                      <td className="small">
                        {listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ""}
                      </td>
                      <td className="text-end fw-bold text-success small">
                        {formatXAF(listing.price)} XAF
                      </td>
                      <td className="text-center">
                        <ListingBadge status={listing.status} />
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => navigate(`${APP_ROUTES.ownerListingEdit.replace(":listingId", "")}${listing.id}`)}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${listing.status === "published" ? "btn-outline-warning" : "btn-outline-success"}`}
                            onClick={() => handleStatusToggle(listing.id, listing.status)}
                          >
                            {listing.status === "published" ? "Archiver" : "Publier"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(listing.id, listing.title)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <Link to={APP_ROUTES.ownerDashboard} className="btn btn-outline-success btn-sm">
          &larr; Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}

export default OwnerListings
