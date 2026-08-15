import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getCities, getPropertyTypes } from "../../api/catalogApi"
import { getAnnouncements } from "../../api/announcementsApi"
import ListingCard from "../../components/listings/ListingCard"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import EmptyState from "../../components/feedback/EmptyState"
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Données catalogue (chargées une seule fois)
  const [cities, setCities] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])

  // État de la liste
  const [listings, setListings] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Lire les filtres depuis l'URL
  const filters = {
    search: searchParams.get("search") || "",
    city_id: searchParams.get("city_id") || "",
    property_type_id: searchParams.get("property_type_id") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "",
    page: searchParams.get("page") || "1",
  }

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    // Remettre à la page 1 quand on change un filtre (sauf si c'est la page elle-même)
    if (key !== "page") next.delete("page")
    setSearchParams(next)
  }

  function resetFilters() {
    setSearchParams({})
  }

  function goToPage(page) {
    updateFilter("page", String(page))
  }

  // Chargement du catalogue
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [citiesData, typesData] = await Promise.all([
          getCities(),
          getPropertyTypes(),
        ])
        setCities(citiesData)
        setPropertyTypes(typesData)
      } catch {
        // Silencieux — les selects resteront vides
      }
    }
    loadCatalog()
  }, [])

  // Chargement des annonces
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Construire les params pour l'API
        const params = {}
        if (filters.search) params.search = filters.search
        if (filters.city_id) params.city_id = Number(filters.city_id)
        if (filters.property_type_id) params.property_type_id = Number(filters.property_type_id)
        if (filters.minPrice) params.minPrice = Number(filters.minPrice)
        if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice)
        if (filters.sort) params.sort = filters.sort
        params.page = Number(filters.page) || 1
        params.limit = 20

        const result = await getAnnouncements(params)
        if (active) {
          // L'intercepteur retourne l'enveloppe : { status, data: { items, pagination }, message }
          const items = result.data?.items || result.data || []
          const paginationData = result.data?.pagination || result.pagination || null
          setListings(Array.isArray(items) ? items : [])
          setPagination(paginationData)
        }
      } catch {
        if (active) setError("Impossible de charger les annonces.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [searchParams])

  const hasActiveFilters = [filters.search, filters.city_id, filters.property_type_id, filters.minPrice, filters.maxPrice, filters.sort].some(Boolean)

  const totalItems = pagination?.totalItems || pagination?.total || listings.length
  const currentPage = pagination?.currentPage || pagination?.page || Number(filters.page) || 1
  const totalPages = pagination?.totalPages || pagination?.pages || 1

  return (
    <div className="container py-4">
      <h1 className="h3 mb-2">Annonces</h1>
      <p className="text-secondary mb-4">
        Parcourez les logements disponibles au Cameroun.
      </p>

      {/* Filtres */}
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
                  placeholder="Titre de l'annonce..."
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
                  value={filters.city_id}
                  onChange={(e) => updateFilter("city_id", e.target.value)}
                >
                  <option value="">Toutes</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
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
                  value={filters.property_type_id}
                  onChange={(e) => updateFilter("property_type_id", e.target.value)}
                >
                  <option value="">Tous</option>
                  {propertyTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6 col-md-2">
                <label htmlFor="filter-sort" className="form-label small fw-semibold">
                  Tri
                </label>
                <select
                  id="filter-sort"
                  className="form-select form-select-sm"
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                >
                  <option value="">Plus récent</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="oldest">Plus ancien</option>
                </select>
              </div>
              <div className="col-sm-12 col-md-3 d-flex gap-2">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Prix min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  min={0}
                />
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Prix max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  min={0}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-2 text-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={resetFilters}
                >
                  <RotateCcw size={14} className="me-1" />
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Résultats */}
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
            {totalItems} annonce{totalItems > 1 ? "s" : ""} trouvée{totalItems > 1 ? "s" : ""}
            {totalPages > 1 && ` — Page ${currentPage} sur ${totalPages}`}
          </p>
          <div className="row g-4">
            {listings.map((listing) => (
              <div key={listing.id} className="col-sm-6 col-lg-4">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4" aria-label="Pagination des annonces">
              <ul className="pagination pagination-sm pagination-renthub mb-0">
                <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Afficher max 7 pages autour de la page courante
                    if (totalPages <= 7) return true
                    if (p === 1 || p === totalPages) return true
                    return Math.abs(p - currentPage) <= 2
                  })
                  .reduce((acc, p, idx, arr) => {
                    // Insérer "..." entre les trous
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push("ellipsis-" + p)
                    }
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p) => {
                    if (typeof p === "string") {
                      return (
                        <li key={p} className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      )
                    }
                    return (
                      <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => goToPage(p)}>
                          {p}
                        </button>
                      </li>
                    )
                  })}
                <li className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    aria-label="Page suivante"
                  >
                    <ChevronRight size={16} />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <div className="text-center mt-5">
        <Link to={APP_ROUTES.home} className="btn btn-outline-success btn-sm">
          <ArrowLeft size={14} className="me-1" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default ListingsPage
