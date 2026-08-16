import ListingPrice from "./ListingPrice"
import ListingLocation from "./ListingLocation"
import { getListingDetailPath } from "../../constants/routes"
import { getPrimaryMedia, getPrimaryMediaUrl, isVideoMedia } from "../../utils/mediaUrl"
import { BadgeCheck, ImageOff, Play, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

function ListingCard({ listing, showFavorite, isFavorite, onToggleFavorite }) {
  const primaryMedia = getPrimaryMedia(listing.Media)
  const imageUrl = primaryMedia ? getPrimaryMediaUrl(listing.Media) : (listing.image || null)
  const coverIsVideo = Boolean(primaryMedia && isVideoMedia(primaryMedia))

  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [mediaFailed, setMediaFailed] = useState(false)
  const showSkeleton = Boolean(imageUrl) && !mediaLoaded && !mediaFailed

  const ownerVerified = Boolean(
    listing.User?.verified_at ||
    listing.User?.verifiedAt ||
    listing.owner?.verified_at ||
    listing.owner?.verifiedAt ||
    listing.ownerVerified,
  )

  return (
    <article className="card border-0 shadow-sm h-100 listing-card position-relative">
      <Link to={getListingDetailPath(listing.id)} className="text-decoration-none">
        <div className="listing-card-image">
          {showSkeleton && <div className="image-loading-overlay" aria-hidden="true" />}
          {imageUrl ? (
            coverIsVideo ? (
              <video
                src={imageUrl}
                className={`card-img-top ${mediaLoaded ? "" : "media-hidden"}`}
                muted
                playsInline
                preload="metadata"
                onLoadedData={() => setMediaLoaded(true)}
                onError={() => setMediaFailed(true)}
              />
            ) : (
              <img
                src={imageUrl}
                alt={listing.title}
                className={`card-img-top ${mediaLoaded ? "" : "media-hidden"}`}
                loading="lazy"
                onLoad={() => setMediaLoaded(true)}
                onError={() => setMediaFailed(true)}
              />
            )
          ) : (
            <div className="skeleton-image" />
          )}
          {coverIsVideo && (
            <span className="listing-card-video-badge" aria-hidden="true">
              <Play size={14} fill="currentColor" />
              Vidéo
            </span>
          )}
          {mediaFailed && !showSkeleton && (
            <div className="listing-card-image-fallback">
              <ImageOff size={28} />
            </div>
          )}
        </div>
      </Link>

      {showFavorite && (
        <button
          type="button"
          className={`btn position-absolute top-0 end-0 m-2 ${isFavorite ? "btn-warning" : "btn-outline-light"}`}
          style={{ zIndex: 1, width: 36, height: 36, borderRadius: "50%" }}
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite?.()
          }}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {isFavorite ? (
            <Star size={18} fill="currentColor" />
          ) : (
            <Star size={18} />
          )}
        </button>
      )}

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link
            to={getListingDetailPath(listing.id)}
            className="text-decoration-none text-dark"
          >
            <h3 className="h6 fw-bold mb-0 listing-card-title">{listing.title}</h3>
          </Link>
          {ownerVerified && (
            <span className="badge-pill success" title="Propriétaire vérifié">
              <BadgeCheck size={13} /> Vérifié
            </span>
          )}
        </div>

        <ListingLocation city={listing.city} neighborhood={listing.neighborhood} />

        <div className="mt-auto pt-2">
          <ListingPrice price={listing.price} />
        </div>
      </div>
    </article>
  )
}

export default ListingCard
