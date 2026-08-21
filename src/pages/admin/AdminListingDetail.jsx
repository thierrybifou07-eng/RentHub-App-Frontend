import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { ANNOUNCEMENT_STATUS } from "../../constants/apiStatuses"
import { getModerationListing, approveListing, rejectListing, deleteListing } from "../../services/adminService"
import PageHeader from "../../components/common/PageHeader"
import ListingBadge from "../../components/listings/ListingBadge"
import { SkeletonDetailPage } from "../../components/feedback/SkeletonLoader"
import ErrorState from "../../components/feedback/ErrorState"
import UserAvatar from "../../components/common/UserAvatar"
import { formatXAF, formatDate } from "../../utils/formatters"
import { resolveMediaUrl, isImageMedia, isVideoMedia } from "../../utils/mediaUrl"
import { ChevronLeft, Check, Trash2, Mail, Phone } from "lucide-react"

function AdminListingDetail() {
  const { id: listingId } = useParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [failedImages, setFailedImages] = useState([])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getModerationListing(listingId)
        if (!data) {
          if (active) setError("Annonce introuvable.")
          return
        }
        if (active) setListing(data)
      } catch (err) {
        if (active) {
          setError(err.status === 404 ? "Annonce introuvable." : "Erreur lors du chargement de l'annonce.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [listingId])

  function markImageFailed(id) {
    setFailedImages((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  // Re-synchronise l'annonce après un échec d'action : le serveur peut avoir
  // exécuté l'action malgré une réponse perdue (ex. erreur réseau transitoire).
  const reloadListing = async () => {
    try {
      const data = await getModerationListing(listingId)
      if (data) setListing(data)
    } catch { /* on conserve l'état actuel si le rechargement échoue */ }
  }

  if (loading) return <SkeletonDetailPage />

  if (error && !listing) {
    return (
      <div>
        <ErrorState message={error} />
        <div className="text-center mt-4">
          <Link to={APP_ROUTES.adminModeration} className="btn btn-outline-success btn-sm">
            &larr; Retour à la modération
          </Link>
        </div>
      </div>
    )
  }

  const statusId = Number(listing?.status_id)
  const isPending = statusId === ANNOUNCEMENT_STATUS.PENDING_REVIEW.id
  const ownerInfo = listing?.owner || listing?.User || null
  const typeLabel = listing?.PropertyType?.label || listing?.propertyType?.label || listing?.type || "—"
  const cityName = listing?.City?.name || listing?.city?.name || listing?.city || "—"

  const allMedia = (listing?.Media || listing?.media || []).filter((m) => isImageMedia(m) || isVideoMedia(m))
  const currentMedia = allMedia[activeImageIndex]
  const currentIsVideo = isVideoMedia(currentMedia)

  const handleApprove = async () => {
    if (!window.confirm("Approuver cette annonce ? Elle sera publiée immédiatement.")) return
    setActionLoading("approve")
    setSuccess(null)
    setError(null)
    try {
      await approveListing(listingId)
      setListing((prev) => ({ ...prev, status_id: ANNOUNCEMENT_STATUS.ACTIVE.id }))
      setSuccess("Annonce approuvée et publiée. Le propriétaire a été notifié.")
    } catch (err) {
      await reloadListing()
      setError(err.message || "Erreur lors de l'approbation.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setActionLoading("reject")
    setSuccess(null)
    setError(null)
    try {
      await rejectListing(listingId, rejectReason.trim())
      setListing((prev) => ({ ...prev, status_id: ANNOUNCEMENT_STATUS.REJECTED.id }))
      setSuccess("Annonce rejetée. Le propriétaire a été notifié de la raison.")
    } catch (err) {
      await reloadListing()
      setError(err.message || "Erreur lors du rejet.")
    } finally {
      setActionLoading(null)
      setRejectMode(false)
      setRejectReason("")
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cette annonce ? Cette action est irréversible.")) return
    setActionLoading("delete")
    setError(null)
    try {
      await deleteListing(listingId)
      navigate(APP_ROUTES.adminModeration, { replace: true })
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression.")
      setActionLoading(null)
    }
  }

  return (
    <div>
      <PageHeader
        title={listing?.title || "Détail de l'annonce"}
        description={`Modération de l'annonce #${listingId}`}
      >
        <ListingBadge statusId={statusId} />
        {listing?.submission_count > 1 && (
          <span className="badge bg-warning text-dark ms-2">
            Soumis {listing.submission_count} fois
          </span>
        )}
      </PageHeader>

      {success && (
        <div className="alert alert-success small py-2" role="alert">
          <Check size={15} className="me-1" /> {success}
        </div>
      )}
      {error && (
        <div className="alert alert-danger small py-2" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Colonne principale */}
        <div className="col-lg-8">
          <div className="mb-3">
            <Link to={APP_ROUTES.adminModeration} className="btn btn-outline-success btn-sm">
              <ChevronLeft size={16} /> Retour à la modération
            </Link>
          </div>

          {allMedia.length > 0 ? (
            <div className="mb-3">
              <div
                style={{
                  height: 380,
                  borderRadius: "var(--radius-lg, 12px)",
                  overflow: "hidden",
                  background: "var(--color-surface-100, #f5f5f5)",
                }}
              >
                {!failedImages.includes(currentMedia?.id) ? (
                  currentIsVideo ? (
                    <video
                      src={resolveMediaUrl(currentMedia)}
                      controls
                      preload="metadata"
                      style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#000" }}
                      onError={() => markImageFailed(currentMedia?.id)}
                    />
                  ) : (
                    <img
                      src={resolveMediaUrl(currentMedia)}
                      alt={`${listing?.title} — photo ${activeImageIndex + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={() => markImageFailed(currentMedia?.id)}
                    />
                  )
                ) : (
                  <div className="skeleton-image" style={{ height: 380, borderRadius: 0 }} />
                )}
              </div>
              {allMedia.length > 1 && (
                <div className="d-flex gap-2 mt-2 overflow-auto">
                  {allMedia.map((item, idx) => (
                    <button
                      key={item.id || idx}
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
                      {!failedImages.includes(item.id) ? (
                        isVideoMedia(item) ? (
                          <div className="w-100 h-100 bg-dark d-flex align-items-center justify-content-center text-white" style={{ fontSize: "1.2rem" }}>
                            ▶
                          </div>
                        ) : (
                          <img
                            src={resolveMediaUrl(item)}
                            alt={`Miniature ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={() => markImageFailed(item.id)}
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
            <div className="skeleton-image mb-3" style={{ height: 380 }} />
          )}

          <h1 className="h3 mb-2">{listing?.title}</h1>
          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <span className="text-secondary small">
              {typeLabel} &middot; {listing?.rooms ?? 0} pièce{(listing?.rooms ?? 0) > 1 ? "s" : ""}
            </span>
            <span className="text-secondary small">{cityName}</span>
            <span className="text-secondary small">{formatXAF(listing?.price)} XAF / mois</span>
          </div>

          <hr />

          <h2 className="h5 mb-3">Description</h2>
          <p className="text-secondary" style={{ whiteSpace: "pre-line" }}>{listing?.description || "Pas de description."}</p>

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
                  <p className="fw-bold mb-0">{listing?.rooms ?? "—"}</p>
                </div>
              </div>
            </div>
            {listing?.bedrooms != null && (
              <div className="col-sm-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-secondary small mb-1">Chambres à coucher</p>
                    <p className="fw-bold mb-0">{listing.bedrooms}</p>
                  </div>
                </div>
              </div>
            )}
            {listing?.bathrooms != null && (
              <div className="col-sm-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-secondary small mb-1">Salles de bain</p>
                    <p className="fw-bold mb-0">{listing.bathrooms}</p>
                  </div>
                </div>
              </div>
            )}
            {listing?.surface_area != null && (
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
                  <p className="fw-bold mb-0">{listing?.furnished ? "Oui" : "Non"}</p>
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
                  <p className="fw-bold mb-0">{formatDate(listing?.createdAt || listing?.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau de modération */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Modération</h2>

              {isPending && listing?.submission_count < 2 ? (
                <>
                  <p className="text-secondary small">
                    Cette annonce est en attente de validation. Vérifiez les informations avant de la publier.
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleApprove}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "approve" ? "Approbation..." : "Approuver et publier"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => { setRejectMode((v) => !v); setError(null) }}
                      disabled={actionLoading !== null}
                    >
                      Rejeter
                    </button>
                  </div>

                  {rejectMode && (
                    <div className="mt-3 pt-3 border-top">
                      <label htmlFor="reject-reason" className="form-label small fw-semibold">
                        Raison du rejet (transmise au propriétaire)
                      </label>
                      <textarea
                        id="reject-reason"
                        className="form-control mb-2"
                        rows={3}
                        placeholder="Ex. : photos manquantes, prix incohérent..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-danger w-50"
                          onClick={handleReject}
                          disabled={actionLoading !== null || !rejectReason.trim()}
                        >
                          {actionLoading === "reject" ? "Rejet..." : "Confirmer le rejet"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary w-50"
                          onClick={() => setRejectMode(false)}
                          disabled={actionLoading !== null}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : isPending && listing?.submission_count >= 2 ? (
                <>
                  <p className="text-secondary small">
                    Cette annonce a été soumise {listing.submission_count} fois. Vous pouvez approuver ou la supprimer définitivement.
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleApprove}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "approve" ? "Approbation..." : "Approuver et publier"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => { setRejectMode((v) => !v); setError(null) }}
                      disabled={actionLoading !== null}
                    >
                      Rejeter
                    </button>
                    <hr className="my-1" />
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={actionLoading !== null}
                    >
                      <Trash2 size={15} className="me-1" />
                      {actionLoading === "delete" ? "Suppression..." : "Supprimer définitivement"}
                    </button>
                  </div>

                  {rejectMode && (
                    <div className="mt-3 pt-3 border-top">
                      <label htmlFor="reject-reason" className="form-label small fw-semibold">
                        Raison du rejet (transmise au propriétaire)
                      </label>
                      <textarea
                        id="reject-reason"
                        className="form-control mb-2"
                        rows={3}
                        placeholder="Ex. : photos manquantes, prix incohérent..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-danger w-50"
                          onClick={handleReject}
                          disabled={actionLoading !== null || !rejectReason.trim()}
                        >
                          {actionLoading === "reject" ? "Rejet..." : "Confirmer le rejet"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary w-50"
                          onClick={() => setRejectMode(false)}
                          disabled={actionLoading !== null}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-secondary small mb-3">
                    Cette annonce n'est plus en attente de revue. Vous pouvez la supprimer définitivement si nécessaire.
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger w-100"
                    onClick={handleDelete}
                    disabled={actionLoading !== null}
                  >
                    <Trash2 size={15} className="me-1" />
                    {actionLoading === "delete" ? "Suppression..." : "Supprimer définitivement"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">Propriétaire</h2>
              {ownerInfo ? (
                <>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <UserAvatar user={ownerInfo} size={40} />
                    <div>
                      <p className="fw-bold mb-0 small">
                        {ownerInfo.firstname && ownerInfo.lastname
                          ? `${ownerInfo.firstname} ${ownerInfo.lastname}`
                          : ownerInfo.name || "Propriétaire"}
                      </p>
                      <p className="text-secondary mb-0" style={{ fontSize: "0.75rem" }}>ID : {ownerInfo.id}</p>
                    </div>
                  </div>
                  {ownerInfo.email && (
                    <p className="text-secondary small mb-1">
                      <Mail size={13} className="me-1" /> {ownerInfo.email}
                    </p>
                  )}
                  {ownerInfo.phone && (
                    <p className="text-secondary small mb-0">
                      <Phone size={13} className="me-1" /> {ownerInfo.phone}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-secondary small mb-0">Informations propriétaire indisponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminListingDetail
