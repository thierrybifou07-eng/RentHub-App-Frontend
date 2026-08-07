/**
 * LoadingState — Spinner de chargement premium
 *
 * Props:
 *  message  — texte affiché sous le spinner (optionnel)
 *  size     — "sm" | "md" (défaut) | "lg"
 *  fullPage — si true, centre verticalement sur toute la hauteur
 */

const SIZE_MAP = {
  sm: { ring: 32, border: 2, text: "var(--text-xs)" },
  md: { ring: 48, border: 3, text: "var(--text-sm)" },
  lg: { ring: 64, border: 4, text: "var(--text-base)" },
}

function LoadingState({
  message  = "Chargement en cours...",
  size     = "md",
  fullPage = false,
}) {
  const s = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <div
      className="loading-state"
      role="status"
      aria-busy="true"
      aria-label={message}
      style={{
        textAlign: "center",
        padding: "var(--space-16) var(--space-8)",
        ...(fullPage ? {
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        } : {}),
      }}
    >
      {/* Spinner à double anneau */}
      <div style={{ position: "relative", width: s.ring, height: s.ring, margin: "0 auto var(--space-5)" }}>
        {/* Anneau externe — piste */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "var(--radius-full)",
          border: `${s.border}px solid var(--color-primary-100)`,
        }} />
        {/* Anneau interne — rotatif */}
        <div
          className="animate-spin"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "var(--radius-full)",
            border: `${s.border}px solid transparent`,
            borderTopColor: "var(--color-primary-500)",
            borderRightColor: "var(--color-primary-300)",
          }}
        />
      </div>

      {/* Message */}
      {message && (
        <p style={{
          margin: 0,
          fontSize: s.text,
          color: "var(--color-text-muted)",
          fontWeight: 500,
        }}>
          {message}
        </p>
      )}

      <span className="visually-hidden">{message}</span>
    </div>
  )
}

export default LoadingState
