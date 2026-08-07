import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { CAMEROON_CITIES, PROPERTY_TYPES, BUDGET_RANGES } from "../../constants/listingOptions"
import { getAllListings } from "../../services/listingsService"
import ListingCard from "../../components/listings/ListingCard"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import EmptyState from "../../components/feedback/EmptyState"

function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filters = {
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    budget: searchParams.get("budget") || "",
    search: searchParams.get("search") || "",
  }

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  function resetFilters() {
    setSearchParams({})
  }

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const currentFilters = {
          city: searchParams.get("city") || "",
          type: searchParams.get("type") || "",
          budget: searchParams.get("budget") || "",
          search: searchParams.get("search") || "",
        }
        const results = await getAllListings(currentFilters)
        if (active) setListings(results)
      } catch {
        if (active) setError("Impossible de charger les annonces.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [searchParams])

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div className="container py-4">
      <h1 className="h3 mb-2">Annonces</h1>
      <p className="text-secondary mb-4">
        Parcourez les logements disponibles au Cameroun.
      </p>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row g-2 align-items-end">
              <div className="col-sm-6 col-md-3">
                <label htmlFor="filter-search" className="form-label small fw-semibold">
                  Recherche
                </label>
                <input
                  type="text"
                  id="filter-search"
                  className="form-control form-control-sm"
                  placeholder="Titre, quartier..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </div>
              <div className="col-sm-6 col-md-2">
                <label htmlFor="filter-city" className="form-label small fw-semibold">
                  Ville
                </label>
                <select
                  id="filter-city"
                  className="form-select form-select-sm"
                  value={filters.city}
                  onChange={(e) => updateFilter("city", e.target.value)}
                >
                  <option value="">Toutes</option>
                  {CAMEROON_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6 col-md-2">
                <label htmlFor="filter-type" className="form-label small fw-semibold">
                  Type
                </label>
                <select
                  id="filter-type"
                  className="form-select form-select-sm"
                  value={filters.type}
                  onChange={(e) => updateFilter("type", e.target.value)}
                >
                  <option value="">Tous</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6 col-md-3">
                <label htmlFor="filter-budget" className="form-label small fw-semibold">
                  Budget
                </label>
                <select
                  id="filter-budget"
                  className="form-select form-select-sm"
                  value={filters.budget}
                  onChange={(e) => updateFilter("budget", e.target.value)}
                >
                  <option value="">Tous les budgets</option>
                  {BUDGET_RANGES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-sm-12 col-md-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100"
                    onClick={resetFilters}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {loading && <LoadingState message="Chargement des annonces..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && listings.length === 0 && (
        <EmptyState
          title="Aucune annonce trouvée"
          description="Modifiez vos filtres ou revenez plus tard."
          action={hasActiveFilters ? { label: "Réinitialiser les filtres", onClick: resetFilters } : null}
        />
      )}
      {!loading && !error && listings.length > 0 && (
        <>
          <p className="text-secondary small mb-3">
            {listings.length} annonce{listings.length > 1 ? "s" : ""} trouvée{listings.length > 1 ? "s" : ""}
          </p>
          <div className="row g-4">
            {listings.map((listing) => (
              <div key={listing.id} className="col-sm-6 col-lg-4">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-center mt-5">
        <Link to={APP_ROUTES.home} className="btn btn-outline-success btn-sm">
          &larr; Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default ListingsPage
