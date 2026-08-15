import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"

const SECTIONS = [
  {
    title: "1. Objet",
    content:
      "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme RentHub, service en ligne de mise en relation entre locataires et propriétaires au Cameroun. En créant un compte, vous reconnaissez avoir lu, compris et accepté l'intégralité de ces conditions.",
  },
  {
    title: "2. Création de compte",
    content:
      "L'inscription est gratuite et nécessite la fourniture d'informations exactes et à jour (nom, prénom, adresse e-mail). Vous êtes responsable de la confidentialité de vos identifiants. Tout accès à votre compte via vos identifiants est réputé effectué par vous-même.",
  },
  {
    title: "3. Utilisation du service",
    content:
      "RentHub permet de consulter des annonces de location (chambres, studios, appartements, maisons), de les mettre en favoris et d'échanger avec les propriétaires via une messagerie privée. Les annonces sont publiées par les propriétaires et vérifiées par notre équipe avant publication.",
  },
  {
    title: "4. Obligations des utilisateurs",
    content:
      "Vous vous engagez à ne pas publier de contenus illicites, frauduleux, diffamatoires ou portant atteinte aux droits de tiers, à ne pas contourner les mécanismes de sécurité de la plateforme, à ne pas utiliser le service à des fins commerciales non autorisées et à respecter la législation camerounaise en vigueur.",
  },
  {
    title: "5. Messagerie et transactions",
    content:
      "Les échanges entre locataires et propriétaires s'effectuent sous la responsabilité des parties. RentHub ne perçoit aucun paiement en son nom et n'intervient pas dans les négociations ou la conclusion des baux. Toute remise de fonds s'effectue directement entre les parties, à vos risques.",
  },
  {
    title: "6. Propriété intellectuelle",
    content:
      "La marque RentHub, le contenu, les logos et les interfaces de la plateforme sont protégés. Toute reproduction ou exploitation non autorisée est interdite sans accord écrit préalable.",
  },
  {
    title: "7. Protection des données personnelles",
    content:
      "Les données collectées (nom, prénom, e-mail, téléphone) sont utilisées uniquement pour le fonctionnement du service : authentification, messagerie, notifications et suivi des annonces. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant notre équipe.",
  },
  {
    title: "8. Suspension et résiliation",
    content:
      "RentHub se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, de comportement frauduleux ou de signalements fondés, sans préjudice des autres recours.",
  },
  {
    title: "9. Responsabilité",
    content:
      "RentHub s'efforce d'assurer la disponibilité et l'exactitude du service, mais ne saurait être tenu responsable des dommages indirects, des erreurs dans les annonces, des litiges entre utilisateurs ou d'une interruption temporaire du service.",
  },
  {
    title: "10. Droit applicable",
    content:
      "Les présentes CGU sont soumises au droit camerounais. En cas de litige, les parties s'efforceront de trouver une solution amiable avant toute action judiciaire devant les juridictions compétentes du Cameroun.",
  },
]

function TermsPage() {
  return (
    <div className="app-shell">
      <section className="hero-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold text-white">Conditions Générales d'Utilisation</h1>
              <p className="lead text-white-75 mt-3 mb-0">
                Dernière mise à jour : août 2026. Veuillez lire attentivement ces conditions avant de créer votre compte.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-lg-5">
                <h2 className="h4 fw-bold mb-4">Conditions Générales d'Utilisation de RentHub</h2>

                {SECTIONS.map((s) => (
                  <div key={s.title} className="mb-4">
                    <h3 className="h6 fw-bold mb-2">{s.title}</h3>
                    <p className="text-secondary mb-0" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)" }}>
                      {s.content}
                    </p>
                  </div>
                ))}

                <hr className="my-4" />

                <p className="text-secondary mb-4" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)" }}>
                  En cochant la case « J'accepte les Conditions Générales d'Utilisation » lors de votre inscription,
                  vous acceptez l'ensemble des dispositions décrites ci-dessus.
                </p>

                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Link to={APP_ROUTES.register} className="btn-primary-gradient">
                    Créer mon compte
                  </Link>
                  <Link to={APP_ROUTES.home} className="btn-secondary-outline">
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
