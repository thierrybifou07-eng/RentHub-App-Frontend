/**
 * ErrorState — État d'erreur premium
 *
 * Props:
 *  message   — message d'erreur (défaut générique)
 *  title     — titre (défaut "Une erreur est survenue")
 *  onRetry   — callback optionnel pour un bouton "Réessayer"
 *  fullPage  — si true, occupe toute la hauteur visible
 */

import { RotateCcw, TriangleAlert } from "lucide-react"

function ErrorState({
  title    = "Une erreur est survenue",
  message  = "Impossible de charger les données. Veuillez vérifier votre connexion.",
  onRetry,
  fullPage = false,
}) {
  return (
    <div
      className="error-state page-enter"
      role="alert"
      aria-live="polite"
      style={{
        textAlign: "center",
        ...(fullPage ? { minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } : {}),
      }}
    >
      {/* Icône */}
      <div className="error-icon" aria-hidden="true">
        <TriangleAlert size={36} />
      </div>

      {/* Titre */}
      <h2>{title}</h2>

      {/* Message */}
      <p>{message}</p>

      {/* Bouton retry */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-6)",
            borderRadius: "var(--radius-full)",
            background: "transparent",
            color: "var(--color-primary-600)",
            border: "1.5px solid var(--color-primary-200)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-spring)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--color-primary-50)"
            e.currentTarget.style.borderColor = "var(--color-primary-400)"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.borderColor = "var(--color-primary-200)"
            e.currentTarget.style.transform = "none"
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Réessayer
        </button>
      )}
    </div>
  )
}

export default ErrorState
