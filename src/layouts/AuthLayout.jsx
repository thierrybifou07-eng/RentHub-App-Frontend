import { Link, Outlet, useLocation } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Heart,
  KeyRound,
  LogIn,
  MailCheck,
  MapPin,
  MessageCircle,
  MousePointerClick,
  SearchCheck,
  ShieldCheck,
  TrendingUp,
  UserPlus,
} from "lucide-react"
import { APP_ROUTES } from "../constants/routes"

const SHOWCASE_CONTENT = {
  [APP_ROUTES.login]: {
    kicker: "Espace personnel",
    title: "Bon retour parmi nous",
    description: "Connectez-vous pour gérer vos favoris, vos messages et suivre vos annonces de location.",
    points: [
      { icon: Heart, text: "Retrouvez vos annonces favorites" },
      { icon: MessageCircle, text: "Pilotez vos conversations en temps réel" },
      { icon: ShieldCheck, text: "Votre compte est protégé en toute sécurité" },
    ],
  },
  [APP_ROUTES.register]: {
    kicker: "Rejoignez RentHub",
    title: "Créez votre compte gratuitement",
    description: "Trouvez le logement idéal ou publiez votre bien en quelques minutes seulement.",
    points: [
      { icon: SearchCheck, text: "Des milliers d'annonces partout au Cameroun" },
      { icon: MousePointerClick, text: "Un dépôt d'annonce simple et rapide" },
      { icon: TrendingUp, text: "Des recommandations adaptées à votre recherche" },
    ],
  },
  [APP_ROUTES.forgotPassword]: {
    kicker: "Aide à la connexion",
    title: "Mot de passe oublié",
    description: "Indiquez votre adresse e-mail : nous vous envoyons un lien pour réinitialiser votre mot de passe.",
    points: [
      { icon: MailCheck, text: "Un e-mail sécurisé avec lien de réinitialisation" },
      { icon: KeyRound, text: "Réinitialisez en quelques clics" },
      { icon: ShieldCheck, text: "Vos données restent confidentielles" },
    ],
  },
  [APP_ROUTES.resetPassword]: {
    kicker: "Sécurité du compte",
    title: "Nouveau mot de passe",
    description: "Choisissez un mot de passe robuste pour sécuriser votre compte RentHub.",
    points: [
      { icon: KeyRound, text: "Un mot de passe solide, une sérénité totale" },
      { icon: ShieldCheck, text: "Connexion chiffrée de bout en bout" },
      { icon: LogIn, text: "Accédez de nouveau à votre espace" },
    ],
  },
  [APP_ROUTES.verifyEmail]: {
    kicker: "Dernière étape",
    title: "Vérifiez votre adresse e-mail",
    description: "Activez votre compte pour débloquer toutes les fonctionnalités de RentHub.",
    points: [
      { icon: MailCheck, text: "Ouvrez l'e-mail envoyé à votre adresse" },
      { icon: UserPlus, text: "Confirmez votre inscription en un clic" },
      { icon: ShieldCheck, text: "Un gage de confiance pour la communauté" },
    ],
  },
}

function ShowcasePanel() {
  const { pathname } = useLocation()
  const content = SHOWCASE_CONTENT[pathname] ?? SHOWCASE_CONTENT[APP_ROUTES.login]

  return (
    <div className="auth-showcase" aria-hidden="false">
      <div className="auth-showcase-inner">
        <Link to={APP_ROUTES.home} style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span className="auth-showcase-logo">
            <Building2 size={22} color="#fff" />
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "#fff", letterSpacing: "var(--tracking-tight)" }}>
            RentHub
          </span>
        </Link>

        <div style={{ marginTop: "var(--space-12)" }}>
          <p className="auth-showcase-kicker">{content.kicker}</p>
          <h1 className="auth-showcase-title">{content.title}</h1>
          <p className="auth-showcase-desc">{content.description}</p>
        </div>

        <ul className="auth-showcase-points">
          {content.points.map(({ icon: Icon, text }) => (
            <li key={text}>
              <span className="auth-showcase-point-icon">
                <Icon size={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="auth-showcase-stats">
          <div>
            <p>1500+</p>
            <span>Annonces actives</span>
          </div>
          <div>
            <p>3500+</p>
            <span>Locataires</span>
          </div>
          <div>
            <p>98%</p>
            <span>Clients satisfaits</span>
          </div>
        </div>

        <p className="auth-showcase-foot">
          <MapPin size={14} /> Villes principales : Douala · Yaoundé · Bafoussam
        </p>
      </div>
    </div>
  )
}

function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Cercle décoratif haut-gauche */}
      <div
        aria-hidden="true"
        className="auth-deco auth-deco-top"
      />

      {/* Cercle décoratif bas-droite */}
      <div
        aria-hidden="true"
        className="auth-deco auth-deco-bottom"
      />

      {/* Motif de points subtil */}
      <div
        aria-hidden="true"
        className="auth-dots"
      />

      <div className="auth-shell">
        {/* Panneau de présentation (grands écrans) */}
        <ShowcasePanel />

        {/* Colonne formulaire */}
        <div className="auth-form-column">
          <div className="page-enter" style={{ width: "100%", maxWidth: 460 }}>
            {/* Logo (mobile uniquement) */}
            <div className="auth-mobile-brand">
              <Link
                to={APP_ROUTES.home}
                style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(15,81,50,0.30)",
                }}>
                  <Building2 size={22} color="#fff" />
                </div>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-3xl)",
                  fontWeight: 800,
                  background: "var(--gradient-text-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "var(--tracking-tight)",
                }}>
                  RentHub
                </span>
              </Link>
              <p style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                Location immobilière au Cameroun
              </p>
            </div>

            {/* Card formulaire */}
            <div className="auth-card">
              <div style={{ padding: "var(--space-8) var(--space-8) var(--space-6)" }}>
                <Outlet />
              </div>
            </div>

            {/* Retour accueil */}
            <p style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
              <Link
                to={APP_ROUTES.home}
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--color-primary-500)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-muted)" }}
              >
                <ArrowLeft size={14} /> Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
