import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { getListingById } from "../../services/listingsService"
import { updateListingStatus, removeListing } from "../../services/ownerService"
import { formatXAF, formatDate } from "../../utils/formatters"
import { resolveMediaUrl } from "../../utils/mediaUrl"
import { ANNOUNCEMENT_STATUS, getAnnouncementStatusLabel } from "../../constants/apiStatuses"
import PageHeader from "../../components/common/PageHeader"
import ListingBadge from "../../components/listings/ListingBadge"
import { SkeletonDetailPage } from "../../components/feedback/SkeletonLoader"
import ErrorState from "../../components/feedback/ErrorState"
import { Star, ChevronLeft } from "lucide-react"

function OwnerListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [failedMedia, setFailedMedia] = useState([])

  const loadListing = useCallback(async (active = true) => {
    try {
      const data = await getListingById(id)
      if (!active) return
      if (!data) {
        setError("Annonce introuvable.")
        return
      }
      if (data.user_id && user?.id && Number(data.user_id) !== Number(user.id)) {
        setError("Vous n'êtes pas autorisé à consulter cette annonce.")
        return
      }
      setListing(data)
      setActiveMediaIndex(0)
    } catch (err) {
      if (active) {
        setError(err.status === 404 || err?.response?.status === 404 ? "Annonce introuvable." : "Erreur lors du chargement de l'annonce.")
      }
    } finally {
      if (active) setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    if (!user) return
    let active = true
    const onLoad = () => loadListing(active)
    onLoad()
    return () => { active = false }
  }, [user, loadListing])

  async function handleToggleStatus() {
    if (!listing) return
    setActionError(null)
    let newStatusId
    if (listing.status_id === ANNOUNCEMENT_STATUS.ACTIVE.id || listing.status_id === ANNOUNCEMENT_STATUS.RENTED.id) {
      newStatusId = ANNOUNCEMENT_STATUS.ARCHIVED.id
    } else if (listing.status_id === ANNOUNCEMENT_STATUS.ARCHIVED.id || listing.status_id === ANNOUNCEMENT_STATUS.REJECTED.id) {
      newStatusId = ANNOUNCEMENT_STATUS.PENDING_REVIEW.id
    } else {
      return
    }
    setActionLoading(true)
    try {
      const updated = await updateListingStatus(listing.id, newStatusId)
      setListing(updated)
    } catch (err) {
      setActionError(err.message || "Action impossible sur cette annonce.")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!listing) return
    if (!window.confirm(`Supprimer l'annonce « ${listing.title} » ? Cette action est irréversible.`)) return
    setActionError(null)
    setActionLoading(true)
    try {
      await removeListing(listing.id)
      navigate(APP_ROUTES.ownerListings, { replace: true })
    } catch (err) {
      setActionError(err.message || "Erreur lors de la suppression de l'annonce.")
      setActionLoading(false)
    }
  }

  function markMediaFailed(mediaId) {
    setFailedMedia((prev) => (prev.includes(mediaId) ? prev : [...prev, mediaId]))
  }

  if (loading) return (
    <div className="py-4">
      <SkeletonDetailPage />
    </div>
  )

  if (error || !listing) {
    return (
      <div className="py-4">
        <ErrorState message={error || "Annonce introuvable."} />
        <div className="text-center mt-4">
          <button className="btn btn-outline-success btn-sm" onClick={() => navigate(APP_ROUTES.ownerListings)}>
            &larr; Retour à mes annonces
          </button>
        </div>
      </div>
    )
  }

  const typeLabel = listing.PropertyType?.label || listing.propertyType?.label || listing.type || "—"
  const cityName = listing.City?.name || listing.city?.name || listing.city || "—"
  const media = listing.Media || listing.media || []
  const images = media.filter((m) => m.MediaType?.code === "ANNOUNCEMENT_IMAGE" || m.mediaType?.code === "ANNOUNCEMENT_IMAGE" || m.type === "image")
  const videos = media.filter((m) => m.MediaType?.code === "ANNOUNCEMENT_VIDEO" || m.mediaType?.code === "ANNOUNCEMENT_VIDEO" || m.type === "video")
  const allMedia = [...images, ...videos]
  const favCount = listing.favoritesCount || listing.favorites_count || 0
  const isVideo = (m) => m?.MediaType?.code === "ANNOUNCEMENT_VIDEO" || m?.mediaType?.code === "ANNOUNCEMENT_VIDEO" || m?.type === "video"

  return (
    <div>
      <PageHeader
        title={listing.title}
        description="Aperçu réservé au propriétaire — visible uniquement par vous."
      >
        <ListingBadge statusId={listing.status_id} />
      </PageHeader>

      <div className="mb-3">
        <Link
          to={APP_ROUTES.ownerListings}
          className="btn btn-outline-success btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ChevronLeft size={16} /> Retour à mes annonces
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-danger small py-2" role="alert">
          {actionError}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          {allMedia.length > 0 ? (
            <div className="mb-3">
              <div
                style={{
                  height: 400,
                  borderRadius: "var(--radius-lg, 12px)",
                  overflow: "hidden",
                  background: "var(--color-surface-100, #f5f5f5)",
                }}
              >
                {!failedMedia.includes(allMedia[activeMediaIndex]?.id) ? (
                  isVideo(allMedia[activeMediaIndex]) ? (
                    <video
                      src={resolveMediaUrl(allMedia[activeMediaIndex])}
                      controls
                      preload="metadata"
                      style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#000" }}
                      onError={() => markMediaFailed(allMedia[activeMediaIndex]?.id)}
                    />
                  ) : (
                    <img
                      src={resolveMediaUrl(allMedia[activeMediaIndex])}
                      alt={`${listing.title} — photo ${activeMediaIndex + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={() => markMediaFailed(allMedia[activeMediaIndex]?.id)}
                    />
                  )
                ) : (
                  <div className="skeleton-image" style={{ height: 400, borderRadius: 0 }} />
                )}
              </div>
              {allMedia.length > 1 && (
                <div className="d-flex gap-2 mt-2 overflow-auto">
                  {allMedia.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      style={{
                        width: 72,
                        height: 56,
                        borderRadius: "var(--radius-sm, 6px)",
                        overflow: "hidden",
                        border: idx === activeMediaIndex ? "2px solid var(--color-primary-600, #6366f1)" : "2px solid transparent",
                        padding: 0,
                        cursor: "pointer",
                        flexShrink: 0,
                        background: "transparent",
                      }}
                    >
                      {!failedMedia.includes(item.id) ? (
                        isVideo(item) ? (
                          <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center text-white" style={{ fontSize: "1.2rem" }}>
                            ▶
                          </div>
                        ) : (
                          <img
                            src={resolveMediaUrl(item)}
                            alt={`Miniature ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={() => markMediaFailed(item.id)}
                          />
                        )
                      ) : (
                        <div className="skeleton-image" style={{ width: 68, height: 52, borderRadius: 0 }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="skeleton-image mb-3" style={{ height: 400 }} />
          )}

          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <span className="text-secondary small">
              {typeLabel} &middot; {listing.rooms ?? 0} pièce{(listing.rooms ?? 0) > 1 ? "s" : ""}
            </span>
            <span className="text-secondary small">{cityName}</span>
            {favCount > 0 && (
              <span className="text-secondary small"><Star size={13} className="text-warning me-1" />{favCount} favori{favCount > 1 ? "s" : ""}</span>
            )}
          </div>

          <hr />

          <h2 className="h5 mb-3">Description</h2>
          <p className="text-secondary" style={{ whiteSpace: "pre-line" }}>{listing.description || "Pas de description."}</p>

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
                  <p className="text-secondary small mb-1">Pièces</p>
                  <p className="fw-bold mb-0">{listing.rooms ?? "—"}</p>
                </div>
              </div>
            </div>
            {listing.bedrooms != null && (
              <div className="col-sm-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-secondary small mb-1">Chambres à coucher</p>
                    <p className="fw-bold mb-0">{listing.bedrooms}</p>
                  </div>
                </div>
              </div>
            )}
            {listing.bathrooms != null && (
              <div className="col-sm-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-secondary small mb-1">Salles de bain</p>
                    <p className="fw-bold mb-0">{listing.bathrooms}</p>
                  </div>
                </div>
              </div>
            )}
            {listing.surface_area != null && (
              <div className="col-sm-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-secondary small mb-1">Surface</p>
                    <p className="fw-bold mb-0">{listing.surface_area} m²</p>
                  </div>
                </div>
              </div>
            )}
            <div className="col-sm-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary small mb-1">Meublé</p>
                  <p className="fw-bold mb-0">{listing.furnished ? "Oui" : "Non"}</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary small mb-1">Localisation</p>
                  <p className="fw-bold mb-0">{cityName}</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <p className="text-secondary small mb-1">Créée le</p>
                  <p className="fw-bold mb-0">{formatDate(listing.createdAt || listing.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: "1rem" }}>
            <div className="card-body">
              <p className="fw-bold text-success mb-1" style={{ fontSize: "1.5rem" }}>
                {formatXAF(listing.price)} <span className="fw-normal text-secondary small">XAF / mois</span>
              </p>

              <hr />

              <p className="text-secondary small mb-1">Statut</p>
              <p className="fw-bold mb-3">{getAnnouncementStatusLabel(listing.status_id)}</p>

              <p className="text-secondary small mb-1">Référence</p>
              <p className="fw-bold mb-3 font-monospace">#{listing.id}</p>

              <hr />

              <div className="d-grid gap-2">
                {listing.status_id === ANNOUNCEMENT_STATUS.PENDING_REVIEW.id && (
                  <Link
                    to={APP_ROUTES.ownerListingEdit.replace(":id", listing.id)}
                    className="btn btn-outline-primary"
                  >
                    Modifier l'annonce
                  </Link>
                )}
                {(listing.status_id === ANNOUNCEMENT_STATUS.ACTIVE.id ||
                  listing.status_id === ANNOUNCEMENT_STATUS.RENTED.id) && (
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={handleToggleStatus}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "..." : "Archiver l'annonce"}
                    </button>
                  )}
                {(listing.status_id === ANNOUNCEMENT_STATUS.ARCHIVED.id ||
                  listing.status_id === ANNOUNCEMENT_STATUS.REJECTED.id) && (
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={handleToggleStatus}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "..." : "Publier l'annonce"}
                    </button>
                  )}
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  Supprimer l'annonce
                </button>
              </div>

              {listing.status_id === ANNOUNCEMENT_STATUS.REJECTED.id && (
                <p className="text-secondary small mt-3 mb-0">
                  Cette annonce a été rejetée par la modération. Publiez-la à nouveau après corrections.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerListingDetailPage
