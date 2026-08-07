import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useFavoritesStore } from "../../stores/favoritesStore"
import { getListingById } from "../../services/listingsService"
import PageHeader from "../../components/common/PageHeader"
import ListingCard from "../../components/listings/ListingCard"
import EmptyState from "../../components/feedback/EmptyState"
import LoadingState from "../../components/feedback/LoadingState"

function TenantFavorites() {
  const favorites = useFavoritesStore((s) => s.favorites)
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const isFavorite = useFavoritesStore((s) => s.isFavorite)

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all(favorites.map((id) => getListingById(id)))
      .then((results) => {
        if (active) setListings(results.filter(Boolean))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [favorites])

  return (
    <div>
      <PageHeader
        title="Mes favoris"
        description="Les annonces que vous avez sauvegardées."
      />

      {loading ? (
        <LoadingState message="Chargement de vos favoris..." />
      ) : listings.length === 0 ? (
        <EmptyState
          title="Aucun favori"
          description="Ajoutez des annonces en favori pour les retrouver facilement."
          action={{ to: APP_ROUTES.listings, label: "Parcourir les annonces" }}
        />
      ) : (
        <div className="row g-4">
          {listings.map((listing) => (
            <div key={listing.id} className="col-sm-6 col-lg-4">
              <ListingCard
                listing={listing}
                showFavorite
                isFavorite={isFavorite(listing.id)}
                onToggleFavorite={() => toggleFavorite(listing.id)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <Link to={APP_ROUTES.tenantDashboard} className="btn btn-outline-success btn-sm">
          &larr; Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}

export default TenantFavorites
