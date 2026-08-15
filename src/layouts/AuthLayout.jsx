import { Link, Outlet } from "react-router-dom"
import { APP_ROUTES } from "../constants/routes"
import { ArrowLeft, Building2 } from "lucide-react"

function AuthLayout() {
  return (
    <div
      className="auth-layout"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "var(--space-6)",
      }}
    >
      {/* Cercle décoratif haut-gauche */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          borderRadius: "var(--radius-full)",
          background: "radial-gradient(circle, rgba(15,81,50,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Cercle décoratif bas-droite */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "var(--radius-full)",
          background: "radial-gradient(circle, rgba(58,158,111,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Motif de points subtil */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(15,81,50,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Card centrale */}
      <div
        className="page-enter"
        style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
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
              fontSize: 20,
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
          <p style={{
            marginTop: "var(--space-2)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
          }}>
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
  )
}

export default AuthLayout
