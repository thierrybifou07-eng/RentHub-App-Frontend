import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getListingById } from "../../services/listingsService"
import { startConversation } from "../../services/messagingService"
import { getUserById } from "../../models/user"
import { formatXAF, formatDate } from "../../utils/formatters"
import { PROPERTY_TYPES } from "../../constants/listingOptions"
import { useAuthStore } from "../../stores/authStore"
import { useFavoritesStore } from "../../stores/favoritesStore"
import ListingBadge from "../../components/listings/ListingBadge"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"

function ListingDetailPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(listingId))
  const [listing, setListing] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const found = await getListingById(listingId)
        if (!found) {
          if (active) setError("Annonce introuvable.")
          return
        }
        if (active) {
          setListing(found)
          setOwner(getUserById(found.ownerId))
        }
      } catch {
        if (active) setError("Erreur lors du chargement de l'annonce.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [listingId])

  async function handleContact() {
    if (!listing || !owner) return
    await startConversation(listingId, user.id, owner.id)
    navigate(`${APP_ROUTES.tenantMessages}?listing=${listingId}`)
  }

  if (loading) return (
    <div className="container py-4">
      <LoadingState message="Chargement de l'annonce..." />
    </div>
  )

  if (error) return (
    <div className="container py-4">
      <ErrorState message={error} />
      <div className="text-center mt-4">
        <Link to={APP_ROUTES.listings} className="btn btn-outline-success btn-sm">
          &larr; Retour aux annonces
        </Link>
      </div>
    </div>
  )

  const typeLabel = PROPERTY_TYPES.find((t) => t.value === listing.type)?.label || listing.type

  return (
    <div className="container py-4">
      <nav aria-label="Fil d'Ariane" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to={APP_ROUTES.home}>Accueil</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={APP_ROUTES.listings}>Annonces</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {listing.title}
          </li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="skeleton-image mb-3" style={{ height: 400 }} />

          <h1 className="h3 mb-2">{listing.title}</h1>
          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <ListingBadge status={listing.status} />
            <span className="text-secondary small">
              {typeLabel} &middot; {listing.rooms} chambre{listing.rooms > 1 ? "s" : ""}
            </span>
            <span className="text-secondary small">
              {listing.city}{listing.neighborhood ? ` \u00b7 ${listing.neighborhood}` : ""}
            </span>
          </div>

          <hr />

          <h2 className="h5 mb-3">Description</h2>
          <p className="text-secondary">{listing.description}</p>

          <hr />

          <h2 className="h5 mb-3">Détails</h2>
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary small mb-1">Type de bien</p>
                  <p className="fw-bold mb-0">{typeLabel}</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary small mb-1">Chambres</p>
                  <p className="fw-bold mb-0">{listing.rooms}</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary small mb-1">Localisation</p>
                  <p className="fw-bold mb-0">
                    {listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary small mb-1">Publiée le</p>
                  <p className="fw-bold mb-0">{formatDate(listing.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: "1rem" }}>
            <div className="card-body">
              <p className="listing-price fw-bold text-success mb-1" style={{ fontSize: "1.5rem" }}>
                {formatXAF(listing.price)} <span className="fw-normal text-secondary small">XAF / mois</span>
              </p>

              <hr />

              {owner && (
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                    <span className="fw-bold small">{owner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="fw-bold mb-0 small">{owner.name}</p>
                    <p className="text-secondary mb-0" style={{ fontSize: "0.75rem" }}>Propriétaire</p>
                  </div>
                </div>
              )}

              <div className="d-grid gap-2">
                {!isAuthenticated ? (
                  <Link to={APP_ROUTES.login} className="btn btn-success">
                    Connectez-vous pour contacter
                  </Link>
                ) : user?.role === "tenant" ? (
                  <button type="button" className="btn btn-success" onClick={handleContact}>
                    Contacter le propriétaire
                  </button>
                ) : null}
                {isAuthenticated && user?.role === "tenant" && (
                  <button
                    type="button"
                    className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => toggleFavorite(listingId)}
                  >
                    {isFavorite ? "\u2605 Retirer des favoris" : "\u2606 Ajouter aux favoris"}
                  </button>
                )}
              </div>

              {!isAuthenticated && (
                <p className="text-secondary text-center small mt-3 mb-0">
                  Connectez-vous pour contacter le propriétaire.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <Link to={APP_ROUTES.listings} className="btn btn-outline-success btn-sm">
          &larr; Retour aux annonces
        </Link>
      </div>
    </div>
  )
}

export default ListingDetailPage
