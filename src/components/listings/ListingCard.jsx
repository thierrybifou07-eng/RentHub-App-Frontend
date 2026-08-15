import ListingBadge from "./ListingBadge"
import ListingPrice from "./ListingPrice"
import ListingLocation from "./ListingLocation"
import { getListingDetailPath } from "../../constants/routes"
import { getPrimaryMediaUrl } from "../../utils/mediaUrl"
import { Star } from "lucide-react"
import { Link } from "react-router-dom"

function ListingCard({ listing, showFavorite, isFavorite, onToggleFavorite }) {
  const imageUrl = getPrimaryMediaUrl(listing.Media) || listing.image

  return (
    <article className="card border-0 shadow-sm h-100 listing-card position-relative">
      <Link to={getListingDetailPath(listing.id)} className="text-decoration-none">
        <div className="listing-card-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="card-img-top"
              loading="lazy"
            />
          ) : (
            <div className="skeleton-image" />
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
          <ListingBadge statusId={listing.announcement_status_id || listing.statusId || listing.status} />
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
