import { Link, useLocation } from "react-router-dom"
import { Building2, Mail, ShieldOff, Home } from "lucide-react"
import { APP_ROUTES } from "../../constants/routes"

const STATUS_CONFIG = {
  suspended: {
    icon: ShieldOff,
    iconBg: "var(--color-danger-light)",
    iconColor: "var(--color-danger-600)",
    badge: "Compte suspendu",
    badgeClass: "bg-danger",
    title: "Votre compte a été suspendu",
    description:
      "Votre compte RentHub a été suspendu par un administrateur. Vous ne pouvez plus accéder à votre espace personnel.",
    contactEmail: "support@renthub.com",
  },
  inactive: {
    icon: ShieldOff,
    iconBg: "var(--color-warning-light, #fff3cd)",
    iconColor: "var(--color-warning-60, #856404)",
    badge: "Compte inactif",
    badgeClass: "bg-secondary",
    title: "Votre compte est inactif",
    description:
      "Votre compte RentHub a été désactivé. Vous ne pouvez plus accéder à votre espace personnel.",
    contactEmail: "support@renthub.com",
  },
}

export default function AccountStatusPage() {
  const { pathname } = useLocation()
  const type = pathname === APP_ROUTES.accountInactive ? "inactive" : "suspended"
  const config = STATUS_CONFIG[type]
  const Icon = config.icon

  return (
    <div className="auth-layout">
      <div aria-hidden="true" className="auth-deco auth-deco-top" />
      <div aria-hidden="true" className="auth-deco auth-deco-bottom" />
      <div aria-hidden="true" className="auth-dots" />

      <div className="auth-shell" style={{ justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div className="auth-form-column" style={{ maxWidth: 460 }}>
            <div className="auth-mobile-brand">
              <Link
                to={APP_ROUTES.home}
                style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(15,81,50,0.30)",
                  }}
                >
                  <Building2 size={22} color="#fff" />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-3xl)",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "var(--tracking-tight)",
                  }}
                >
                  RentHub
                </span>
              </Link>
            </div>

            <div className="auth-card">
              <div style={{ padding: "var(--space-8) var(--space-8) var(--space-6)", textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: config.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto var(--space-4)",
                  }}
                >
                  <Icon size={32} color={config.iconColor} />
                </div>

                <span className={`badge ${config.badgeClass} mb-3`} style={{ fontSize: "var(--text-xs)" }}>
                  {config.badge}
                </span>

                <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
                  {config.title}
                </h2>

                <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.6, marginBottom: "var(--space-5)" }}>
                  {config.description}
                </p>

                <div
                  style={{
                    background: "var(--color-bg-secondary, #f8f9fa)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-4)",
                    marginBottom: "var(--space-5)",
                  }}
                >
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>
                    Besoin d'aide ? Contactez l'administrateur :
                  </p>
                  <a
                    href={`mailto:${config.contactEmail}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--color-primary-600)",
                      fontWeight: 600,
                      fontSize: "var(--text-sm)",
                      textDecoration: "none",
                    }}
                  >
                    <Mail size={14} />
                    {config.contactEmail}
                  </a>
                </div>

                <Link
                  to={APP_ROUTES.home}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "var(--space-2) var(--space-4)",
                    background: "var(--gradient-primary)",
                    color: "#fff",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                    textDecoration: "none",
                    transition: "opacity var(--transition-fast)",
                  }}
                >
                  <Home size={14} />
                  Retour à l'accueil
                </Link>
              </div>
            </div>

            <p style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
              <Link
                to={APP_ROUTES.home}
                style={{
                  fontSize: "var(--text-sm)",
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Home size={14} /> Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
