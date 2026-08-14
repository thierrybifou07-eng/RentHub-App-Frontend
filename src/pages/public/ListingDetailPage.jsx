import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getAnnouncementById } from "../../api/announcementsApi"
import { startConversation } from "../../api/conversationsApi"
import { formatXAF, formatDate } from "../../utils/formatters"
import { resolveMediaUrl } from "../../utils/mediaUrl"
import { useAuthStore } from "../../stores/authStore"
import { useFavoritesStore } from "../../stores/favoritesStore"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import ReportModal from "../../components/reports/ReportModal"

function ListingDetailPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(listingId))
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [failedImages, setFailedImages] = useState([])

  const [showReportModal, setShowReportModal] = useState(false)
  const [hasReported, setHasReported] = useState(false)

  const [contactText, setContactText] = useState("")
  const [sendingContact, setSendingContact] = useState(false)
  const [contactError, setContactError] = useState(null)

  async function handleContact(e) {
    e.preventDefault()
    if (!contactText.trim()) return
    setSendingContact(true)
    setContactError(null)
    try {
      await startConversation({ announcementId: listingId, content: contactText })
      navigate(`${APP_ROUTES.tenantMessages}?listing=${listingId}`)
    } catch (err) {
      if (err.status === 409) {
        navigate(`${APP_ROUTES.tenantMessages}?listing=${listingId}`)
      } else if (err.status === 403) {
        setContactError("Seuls les locataires peuvent contacter les propriétaires.")
      } else {
        setContactError("Erreur lors de l'envoi du message.")
      }
    } finally {
      setSendingContact(false)
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getAnnouncementById(listingId)
        const data = result?.data?.announcement || result?.announcement || result?.data || null
        if (!data) {
          if (active) setError("Annonce introuvable.")
          return
        }
        const owner = result?.data?.owner || result?.owner || null
        if (owner) data.owner = owner
        if (active) setListing(data)
      } catch (err) {
        if (active) setError(err.status === 404 ? "Annonce introuvable." : "Erreur lors du chargement de l'annonce.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [listingId])

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

  // Extraction des données API (noms de clés backend)
  const typeLabel = listing.PropertyType?.label || listing.propertyType?.label || listing.type || "—"
  const cityName = listing.City?.name || listing.city?.name || listing.city || "—"
  const media = listing.Media || listing.media || []
  const images = media.filter((m) => m.MediaType?.code === "ANNOUNCEMENT_IMAGE" || m.mediaType?.code === "ANNOUNCEMENT_IMAGE" || m.type === "image")
  const ownerInfo = listing.User || listing.owner || null
  const favCount = listing.favoritesCount || listing.favorites_count || 0

  function markImageFailed(id) {
    setFailedImages((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

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
          {/* Galerie d'images */}
          {images.length > 0 ? (
            <div className="mb-3">
              <div
                style={{
                  height: 400,
                  borderRadius: "var(--radius-lg, 12px)",
                  overflow: "hidden",
                  background: "var(--color-surface-100, #f5f5f5)",
                }}
              >
                {!failedImages.includes(images[activeImageIndex]?.id) ? (
                  <img
                    src={resolveMediaUrl(images[activeImageIndex])}
                    alt={`${listing.title} — photo ${activeImageIndex + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => markImageFailed(images[activeImageIndex]?.id)}
                  />
                ) : (
                  <div className="skeleton-image" style={{ height: 400, borderRadius: 0 }} />
                )}
              </div>
              {images.length > 1 && (
                <div className="d-flex gap-2 mt-2 overflow-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        width: 72,
                        height: 56,
                        borderRadius: "var(--radius-sm, 6px)",
                        overflow: "hidden",
                        border: idx === activeImageIndex ? "2px solid var(--color-primary-600, #6366f1)" : "2px solid transparent",
                        padding: 0,
                        cursor: "pointer",
                        flexShrink: 0,
                        background: "transparent",
                      }}
                    >
                      {!failedImages.includes(img.id) ? (
                        <img
                          src={resolveMediaUrl(img)}
                          alt={`Miniature ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={() => markImageFailed(img.id)}
                        />
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

          <h1 className="h3 mb-2">{listing.title}</h1>
          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
{/*             <ListingBadge statusId={listing.status_id} />
 */}            <span className="text-secondary small">
              {typeLabel} &middot; {listing.rooms ?? 0} pièce{(listing.rooms ?? 0) > 1 ? "s" : ""}
            </span>
            <span className="text-secondary small">{cityName}</span>
            {favCount > 0 && (
              <span className="text-secondary small">★ {favCount} favori{favCount > 1 ? "s" : ""}</span>
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
                  <p className="text-secondary small mb-1">Publiée le</p>
                  <p className="fw-bold mb-0">{formatDate(listing.createdAt || listing.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: "1rem" }}>
            <div className="card-body">
              <p className="listing-price fw-bold text-success mb-1" style={{ fontSize: "1.5rem" }}>
                {formatXAF(listing.price)} <span className="fw-normal text-secondary small">XAF / mois</span>
              </p>

              <hr />

              {ownerInfo && (
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                    <span className="fw-bold small">
                      {(ownerInfo.firstname || ownerInfo.name || "?").charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="fw-bold mb-0 small">
                      {ownerInfo.firstname && ownerInfo.lastname
                        ? `${ownerInfo.firstname} ${ownerInfo.lastname}`
                        : ownerInfo.name || "Propriétaire"}
                    </p>
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
                  <form onSubmit={handleContact} className="d-flex flex-column gap-2 mb-2">
                    {contactError && <div className="alert alert-danger p-2 small mb-0">{contactError}</div>}
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Votre message au propriétaire..."
                      value={contactText}
                      onChange={e => setContactText(e.target.value)}
                      disabled={sendingContact}
                      required
                    />
                    <button type="submit" className="btn btn-success" disabled={sendingContact || !contactText.trim()}>
                      {sendingContact ? "Envoi..." : "Contacter le propriétaire"}
                    </button>
                  </form>
                ) : null}
                {isAuthenticated && user?.role === "tenant" && (
                  <>
                    <button
                      type="button"
                      className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"}`}
                      onClick={() => toggleFavorite(listingId)}
                    >
                      {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => setShowReportModal(true)}
                      disabled={hasReported}
                    >
                      {hasReported ? "Annonce signalée" : "Signaler cette annonce"}
                    </button>
                  </>
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

        <div className="text-center mt-5">
          <Link to={APP_ROUTES.listings} className="btn btn-outline-success btn-sm">
            &larr; Retour aux annonces
          </Link>
        </div>

        {showReportModal && (
          <ReportModal
            announcementId={listingId}
            onClose={() => setShowReportModal(false)}
            onSuccess={() => {
              setShowReportModal(false)
              setHasReported(true)
              // Optionnel : un petit toast ou alert de confirmation
              alert("Votre signalement a été envoyé à l'équipe de modération.")
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ListingDetailPage
