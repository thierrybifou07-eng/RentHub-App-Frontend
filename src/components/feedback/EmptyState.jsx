import { Link } from "react-router-dom"

/**
 * EmptyState — État vide premium
 *
 * Props:
 *  icon        — emoji affiché dans le cercle (défaut "📄")
 *  title       — titre principal
 *  description — texte explicatif (optionnel)
 *  action      — { label, to?, onClick? } — bouton CTA (optionnel)
 *  color       — thème du cercle icône : "primary" | "success" | "warning" | "danger" | "info"
 */

const BG_MAP = {
  primary: "var(--color-primary-50)",
  success: "var(--color-success-light)",
  warning: "var(--color-warning-light)",
  danger:  "var(--color-danger-light)",
  info:    "var(--color-info-light)",
}

function EmptyState({
  icon        = "📭",
  title       = "Aucun résultat",
  description,
  action,
  color       = "primary",
}) {
  const btnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-3) var(--space-6)",
    borderRadius: "var(--radius-full)",
    background: "var(--gradient-primary)",
    color: "white",
    border: "none",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "transform var(--transition-spring), box-shadow var(--transition-base)",
  }

  return (
    <div
      className="empty-state page-enter"
      role="status"
      style={{ textAlign: "center" }}
    >
      {/* Icône */}
      <div
        className="empty-icon"
        style={{ background: BG_MAP[color] || BG_MAP.primary }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Titre */}
      <h2>{title}</h2>

      {/* Description */}
      {description && <p>{description}</p>}

      {/* Action */}
      {action && (
        action.to ? (
          <Link
            to={action.to}
            style={btnStyle}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none" }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            style={btnStyle}
            onClick={action.onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none" }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

export default EmptyState
