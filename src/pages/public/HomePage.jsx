import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getCities, getPropertyTypes } from "../../api/catalogApi"
import { getAllListings } from "../../services/listingsService"
import ListingCard from "../../components/listings/ListingCard"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import EmptyState from "../../components/feedback/EmptyState"

function HomePage() {
  const navigate = useNavigate()
  const [featuredListings, setFeaturedListings] = useState([])
  const [cities, setCities] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchCity, setSearchCity] = useState("")
  const [searchType, setSearchType] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [listingsRes, citiesRes, typesRes] = await Promise.all([
          getAllListings({ status: "published" }),
          getCities(),
          getPropertyTypes()
        ])
        if (active) {
          setFeaturedListings(listingsRes.slice(0, 4))
          setCities(citiesRes)
          setPropertyTypes(typesRes)
        }
      } catch {
        if (active) setError("Impossible de charger les données.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchCity) params.set("city", searchCity)
    if (searchType) params.set("type", searchType)
    navigate(`${APP_ROUTES.listings}?${params.toString()}`)
  }

  return (
    <main className="app-shell">
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h1 className="display-5 fw-bold text-white">
                Trouver un logement fiable au Cameroun, sans tourner en rond.
              </h1>
              <p className="lead text-white-75 mt-3">
                Recherchez une chambre, un studio, un appartement ou une maison,
                puis contactez le propriétaire via une messagerie privée par annonce.
              </p>

              <form onSubmit={handleSearch} className="mt-4">
                <div className="row g-2">
                  <div className="col-sm-5">
                    <select
                      className="form-select"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      aria-label="Ville"
                    >
                      <option value="">Toutes les villes</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-5">
                    <select
                      className="form-select"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      aria-label="Type de bien"
                    >
                      <option value="">Tous les types</option>
                      {propertyTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-2">
                    <button type="submit" className="btn btn-warning w-100 fw-semibold">
                      Rechercher
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-lg-5">
              <div className="foundation-card card border-0 shadow-lg">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold">Comment ça marche ?</h2>
                  <ol className="small mb-0 mt-3">
                    <li className="mb-2">Recherchez un logement par ville ou type de bien.</li>
                    <li className="mb-2">Consultez les détails et le prix en XAF.</li>
                    <li className="mb-2">Contactez le propriétaire en toute confiance.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 fw-bold mb-0">Annonces en vedette</h2>
            <Link to={APP_ROUTES.listings} className="btn btn-outline-success btn-sm">
              Voir toutes les annonces
            </Link>
          </div>

          {loading && <LoadingState message="Chargement des annonces..." />}
          {error && <ErrorState message={error} />}
          {!loading && !error && featuredListings.length === 0 && (
            <EmptyState
              title="Aucune annonce disponible"
              description="Aucune annonce n'est publiée pour le moment."
            />
          )}
          {!loading && !error && featuredListings.length > 0 && (
            <div className="row g-4">
              {featuredListings.map((listing) => (
                <div key={listing.id} className="col-md-6 col-lg-3">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 mb-2">&#128269;</div>
                  <h2 className="h6 fw-bold">Recherche rapide</h2>
                  <p className="text-secondary small mb-0">
                    Filtrez par ville, type de bien, budget et nombre de chambres.
                  </p>
                </div>
              </article>
            </div>
            <div className="col-md-4">
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 mb-2">&#128179;</div>
                  <h2 className="h6 fw-bold">Prix en XAF</h2>
                  <p className="text-secondary small mb-0">
                    Tous les prix sont affichés en francs CFA camerounais.
                  </p>
                </div>
              </article>
            </div>
            <div className="col-md-4">
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 mb-2">&#9993;</div>
                  <h2 className="h6 fw-bold">Messagerie privée</h2>
                  <p className="text-secondary small mb-0">
                    Contactez directement le propriétaire de l'annonce.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
