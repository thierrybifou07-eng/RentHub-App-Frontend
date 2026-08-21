import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getCities, getPropertyTypes } from "../../api/catalogApi"
import { getAllListings } from "../../services/listingsService"
import ListingCard from "../../components/listings/ListingCard"
import SearchableSelect from "../../components/common/SearchableSelect"
import { SkeletonPage } from "../../components/feedback/SkeletonLoader"
import ErrorState from "../../components/feedback/ErrorState"
import EmptyState from "../../components/feedback/EmptyState"
import AnimatedCounter, { Reveal } from "../../components/common/AnimatedCounter"
import { BookOpen, Mail, Search } from "lucide-react"

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
                    <SearchableSelect
                      options={cities.map((city) => ({ value: city.id, label: city.name }))}
                      value={searchCity}
                      onChange={(v) => setSearchCity(v)}
                      placeholder="Toutes les villes"
                      emptyLabel="Toutes les villes"
                    />
                  </div>
                  <div className="col-sm-5">
                    <SearchableSelect
                      options={propertyTypes.map((t) => ({ value: t.id, label: t.label }))}
                      value={searchType}
                      onChange={(v) => setSearchType(v)}
                      placeholder="Tous les types"
                      emptyLabel="Tous les types"
                    />
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

      {/* ── Compteurs animés ──────────────────────────────────── */}
      <section className="home-stats">
        <div className="container">
          <div className="row g-4 text-center">
            <Reveal className="col-6 col-lg-3" delay={0}>
              <p className="home-stats-value"><AnimatedCounter value={1500} suffix="+" /></p>
              <span className="home-stats-label">Annonces actives</span>
            </Reveal>
            <Reveal className="col-6 col-lg-3" delay={100}>
              <p className="home-stats-value"><AnimatedCounter value={3500} suffix="+" /></p>
              <span className="home-stats-label">Locataires</span>
            </Reveal>
            <Reveal className="col-6 col-lg-3" delay={200}>
              <p className="home-stats-value"><AnimatedCounter value={98} suffix="%" /></p>
              <span className="home-stats-label">Clients satisfaits</span>
            </Reveal>
            <Reveal className="col-6 col-lg-3" delay={300}>
              <p className="home-stats-value"><AnimatedCounter value={24} suffix="/7" /></p>
              <span className="home-stats-label">Support disponible</span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <Reveal className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 fw-bold mb-0">Annonces en vedette</h2>
            <Link to={APP_ROUTES.listings} className="btn btn-outline-success btn-sm">
              Voir toutes les annonces
            </Link>
          </Reveal>

          {loading && <SkeletonPage cols={4} />}
          {error && <ErrorState message={error} />}
          {!loading && !error && featuredListings.length === 0 && (
            <EmptyState
              title="Aucune annonce disponible"
              description="Aucune annonce n'est publiée pour le moment."
            />
          )}
          {!loading && !error && featuredListings.length > 0 && (
            <div className="row g-4">
              {featuredListings.map((listing, idx) => (
                <Reveal key={listing.id} className="col-md-6 col-lg-3" delay={idx * 80}>
                  <ListingCard listing={listing} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <Reveal className="col-md-4" delay={0}>
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 mb-2"><Search size={44} /></div>
                  <h2 className="h6 fw-bold">Recherche rapide</h2>
                  <p className="text-secondary small mb-0">
                    Filtrez par ville, type de bien, budget et nombre de chambres.
                  </p>
                </div>
              </article>
            </Reveal>
            <Reveal className="col-md-4" delay={100}>
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 mb-2"><BookOpen size={44} /></div>
                  <h2 className="h6 fw-bold">Prix en XAF</h2>
                  <p className="text-secondary small mb-0">
                    Tous les prix sont affichés en francs CFA camerounais.
                  </p>
                </div>
              </article>
            </Reveal>
            <Reveal className="col-md-4" delay={200}>
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="display-6 mb-2"><Mail size={44} /></div>
                  <h2 className="h6 fw-bold">Messagerie privée</h2>
                  <p className="text-secondary small mb-0">
                    Contactez directement le propriétaire de l'annonce.
                  </p>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
