import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"

const COMPANY_LINKS = [
  { to: APP_ROUTES.home, label: "Accueil" },
  { to: APP_ROUTES.listings, label: "Toutes les annonces" },
  { to: APP_ROUTES.about, label: "À propos" },
  { to: APP_ROUTES.contact, label: "Contact" },
]

const ACCOUNT_LINKS = [
  { to: APP_ROUTES.login, label: "Connexion" },
  { to: APP_ROUTES.register, label: "Créer un compte" },
]

function FooterLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: "var(--text-sm)",
          textDecoration: "none",
          transition: "color var(--transition-fast)",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.9)" }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)" }}
      >
        {label}
      </Link>
    </li>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: "var(--space-3)" }}>
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {links.map((link) => (
          <FooterLink key={link.to} {...link} />
        ))}
      </ul>
    </div>
  )
}

function AppFooter() {
  return (
    <footer style={{
      background: "var(--color-neutral-900)",
      color: "rgba(255,255,255,0.55)",
      padding: "var(--space-12) max(24px, calc((100% - 1200px) / 2))",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "var(--space-8)",
        marginBottom: "var(--space-8)",
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--space-4)" }}>
            <span style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}>🏘️</span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 800,
              color: "white",
            }}>RentHub</span>
          </div>
          <p style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
            La plateforme de référence pour la location immobilière au Cameroun.
          </p>
        </div>

        {/* Entreprise */}
        <FooterColumn title="Entreprise" links={COMPANY_LINKS} />

        {/* Mon compte */}
        <FooterColumn title="Mon compte" links={ACCOUNT_LINKS} />
      </div>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingTop: "var(--space-6)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-3)",
      }}>
        <p style={{ margin: 0, fontSize: "var(--text-xs)" }}>
          © {new Date().getFullYear()} RentHub — Location immobilière au Cameroun. Tous droits réservés.
        </p>
        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.30)" }}>
          Fait avec ❤️ au Cameroun
        </p>
      </div>
    </footer>
  )
}

export default AppFooter
