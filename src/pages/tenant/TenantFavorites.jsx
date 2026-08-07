import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useFavoritesStore } from "../../stores/favoritesStore"
import { getFavorites } from "../../api/favoritesApi"
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
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    
    getFavorites({ page, limit: 12 })
      .then((response) => {
        if (!active) return
        // Assuming API returns { status: 'success', data: { items: [], meta: { currentPage, lastPage } } }
        const data = response.data?.data || response.data
        const items = data?.items || data || []
        
        // If the API returns favorite objects wrapping announcements, extract them
        const announcements = items.map(item => item.announcement || item)
        
        if (page === 1) {
          setListings(announcements)
        } else {
          setListings(prev => [...prev, ...announcements])
        }
        
        const meta = data?.meta || {}
        setHasMore(meta.currentPage < meta.lastPage)
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false)
      })
      
    return () => { active = false }
  }, [page])

  // Retirer de l'affichage si le favori est supprimé localement (optimisation UX)
  const visibleListings = listings.filter(l => favorites.includes(l.id))

  return (
    <div>
      <PageHeader
        title="Mes favoris"
        description="Les annonces que vous avez sauvegardées."
      />

      {loading && page === 1 ? (
        <LoadingState message="Chargement de vos favoris..." />
      ) : visibleListings.length === 0 ? (
        <EmptyState
          title="Aucun favori"
          description="Ajoutez des annonces en favori pour les retrouver facilement."
          action={{ to: APP_ROUTES.listings, label: "Parcourir les annonces" }}
        />
      ) : (
        <>
          <div className="row g-4">
            {visibleListings.map((listing) => (
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
          
          {hasMore && (
            <div className="text-center mt-5">
              <button 
                className="btn btn-outline-primary"
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
              >
                {loading ? "Chargement..." : "Voir plus d'annonces"}
              </button>
            </div>
          )}
        </>
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
