/**
 * SkeletonLoader — Loaders de chargement premium
 *
 * Exports:
 *  default SkeletonLoader   — lignes de texte animées
 *  SkeletonCard             — carte avec image + texte
 *  SkeletonPage             — grille de 3/6 cartes
 *  SkeletonTable            — tableau de données
 *  SkeletonStat             — stat card en chargement
 */

/* ── Ligne de texte ─────────────────────────────────────────── */

function SkeletonLoader({ lines = 3, className = "" }) {
  const widths = ["long", "medium", "short", "long", "medium"]
  return (
    <div
      className={`skeleton-loader ${className}`}
      aria-busy="true"
      aria-label="Chargement"
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`skeleton-line ${widths[i % widths.length]}`}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

/* ── Carte ───────────────────────────────────────────────────── */

export function SkeletonCard() {
  return (
    <div
      className="skeleton-card"
      aria-busy="true"
      aria-label="Chargement"
      style={{
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="skeleton-image" style={{ height: 210, borderRadius: 0 }} />
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div className="skeleton-line long" style={{ height: 16 }} />
        <div className="skeleton-line medium" style={{ height: 13 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
          <div className="skeleton-line" style={{ width: 90, height: 18 }} />
          <div className="skeleton-line" style={{ width: 60, height: 12 }} />
        </div>
      </div>
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

/* ── Page grille ─────────────────────────────────────────────── */

export function SkeletonPage({ title, cols = 3 }) {
  const gridCols = {
    2: "repeat(2, 1fr)",
    3: "repeat(3, 1fr)",
    4: "repeat(4, 1fr)",
  }

  return (
    <div
      className="page-enter"
      aria-busy="true"
      aria-label="Chargement de la page"
      style={{ padding: "var(--space-6) 0" }}
    >
      {title && (
        <div
          className="skeleton-line"
          style={{ width: 240, height: 28, marginBottom: "var(--space-8)", borderRadius: "var(--radius-md)" }}
        />
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(260px, 1fr))`,
          gap: "var(--space-6)",
        }}
      >
        {Array.from({ length: cols * 2 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

/* ── Tableau ─────────────────────────────────────────────────── */

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement du tableau"
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "var(--space-4)",
        padding: "var(--space-3) var(--space-5)",
        background: "var(--color-surface-2)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} className="skeleton-line sm" style={{ width: "60%" }} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }, (_, ri) => (
        <div
          key={ri}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "var(--space-4)",
            padding: "var(--space-4) var(--space-5)",
            borderBottom: ri < rows - 1 ? "1px solid var(--color-border)" : "none",
            animationDelay: `${ri * 60}ms`,
          }}
        >
          {Array.from({ length: cols }, (_, ci) => (
            <div
              key={ci}
              className="skeleton-line"
              style={{ width: ci === 0 ? "80%" : ci === cols - 1 ? "50%" : "70%" }}
            />
          ))}
        </div>
      ))}
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

/* ── Stat card ────────────────────────────────────────────────── */

export function SkeletonStat() {
  return (
    <div
      aria-busy="true"
      style={{
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
        padding: "var(--space-6)",
      }}
    >
      <div
        className="skeleton-base"
        style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", marginBottom: "var(--space-4)" }}
      />
      <div className="skeleton-line" style={{ width: 80, height: 28, marginBottom: "var(--space-2)" }} />
      <div className="skeleton-line short" style={{ height: 12 }} />
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

export default SkeletonLoader
