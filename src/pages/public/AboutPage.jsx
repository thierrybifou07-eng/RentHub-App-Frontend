import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"

const VALUES = [
  {
    title: "Fiabilité",
    text: "Chaque annonce est vérifiée par notre équipe avant publication afin de garantir des biens réels et des propriétaires de confiance.",
  },
  {
    title: "Simplicité",
    text: "Recherchez, comparez et contactez directement le propriétaire grâce à une messagerie privée intégrée par annonce.",
  },
  {
    title: "Proximité",
    text: "Une plateforme pensée pour le Cameroun, de Douala à Yaoundé, avec des prix en FCFA et des critères adaptés au marché local.",
  },
]

const STEPS = [
  { step: "01", title: "Recherchez", text: "Parcourez les annonces par ville, type de bien et budget." },
  { step: "02", title: "Comparez", text: "Consultez les photos, les caractéristiques et le prix en FCFA." },
  { step: "03", title: "Contactez", text: "Échangez avec le propriétaire via la messagerie privée de l'annonce." },
]

function AboutPage() {
  return (
    <div className="app-shell">
      {/* ── En-tête ─────────────────────────────────────────── */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold text-white">À propos de RentHub</h1>
              <p className="lead text-white-75 mt-3 mb-0">
                Nous aidons les locataires à trouver un logement fiable et les propriétaires
                à publier leurs biens en toute simplicité.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        {/* ── Mission ───────────────────────────────────────── */}
        <div className="row align-items-center g-4 mb-5">
          <div className="col-lg-6">
            <h2 className="h3 fw-bold mb-3">Notre mission</h2>
            <p className="text-secondary" style={{ lineHeight: "var(--leading-relaxed)" }}>
              Au Cameroun, trouver un logement fiable demande souvent du temps, des déplacements
              et une grande vigilance. RentHub centralise les annonces de location — chambres,
              studios, appartements et maisons — pour que chaque recherche aboutisse en toute
              confiance, sans tourner en rond.
            </p>
            <p className="text-secondary" style={{ lineHeight: "var(--leading-relaxed)" }}>
              Pour les propriétaires, nous offrons un espace simple et structuré pour publier,
              gérer et faire valider leurs biens, tout en dialoguant avec les candidats directement
              sur la plateforme.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="foundation-card card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="h5 fw-bold mb-3">Comment ça marche ?</h3>
                <ol className="mb-0">
                  {STEPS.map((s) => (
                    <li key={s.step} className="mb-3">
                      <span className="text-primary fw-bold me-2">{s.step}</span>
                      <strong>{s.title}.</strong>
                      <span className="text-secondary"> {s.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* ── Valeurs ───────────────────────────────────────── */}
        <div className="section mb-5">
          <h2 className="h3 fw-bold mb-4 text-center">Nos valeurs</h2>
          <div className="row g-4">
            {VALUES.map((v) => (
              <div key={v.title} className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <h3 className="h5 fw-bold mb-2">{v.title}</h3>
                    <p className="text-secondary mb-0" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)" }}>
                      {v.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Appel à l'action ──────────────────────────────── */}
        <div className="card border-0 shadow-sm text-center">
          <div className="card-body p-5">
            <h2 className="h4 fw-bold mb-2">Prêt à trouver votre prochain logement ?</h2>
            <p className="text-secondary mb-4">
              Parcourez les annonces dès maintenant ou contactez-nous pour toute question.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to={APP_ROUTES.listings} className="btn-primary-gradient">
                Voir les annonces
              </Link>
              <Link to={APP_ROUTES.contact} className="btn-secondary-outline">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
