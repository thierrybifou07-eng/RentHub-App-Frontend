import { ArrowDown, ArrowRight, ArrowUp, BarChart3 } from "lucide-react"

/**
 * StatCard — Carte de statistique premium
 *
 * Props:
 *  icon      — composant d'icône lucide affiché dans le cercle coloré (défaut BarChart3)
 *  value     — valeur principale (nombre ou texte)
 *  label     — libellé sous la valeur
 *  trend     — { value: string, direction: "up"|"down"|"neutral" } (optionnel)
 *  color     — thème de couleur : "primary" | "success" | "warning" | "danger" | "info"
 */

const COLOR_MAP = {
  primary: {
    bg: "linear-gradient(135deg, var(--color-primary-100), var(--color-primary-50))",
    text: "var(--color-primary-600)",
    glow: "rgba(15,81,50,0.10)",
  },
  success: {
    bg: "linear-gradient(135deg, var(--color-success-light), #ecfdf5)",
    text: "var(--color-success-dark)",
    glow: "rgba(16,185,129,0.10)",
  },
  warning: {
    bg: "linear-gradient(135deg, var(--color-warning-light), #fffbeb)",
    text: "var(--color-warning-dark)",
    glow: "rgba(245,159,0,0.10)",
  },
  danger: {
    bg: "linear-gradient(135deg, var(--color-danger-light), #fff5f5)",
    text: "var(--color-danger-dark)",
    glow: "rgba(239,68,68,0.10)",
  },
  info: {
    bg: "linear-gradient(135deg, var(--color-info-light), #eff6ff)",
    text: "var(--color-info-dark)",
    glow: "rgba(59,130,246,0.10)",
  },
}

const TREND_ICONS = { up: ArrowUp, down: ArrowDown, neutral: ArrowRight }
const TREND_COLORS = {
  up:      "var(--color-success)",
  down:    "var(--color-danger)",
  neutral: "var(--color-text-muted)",
}

function StatCard({ icon: Icon = BarChart3, value, label, trend, color = "primary" }) {
  const theme = COLOR_MAP[color] || COLOR_MAP.primary
  const TrendIcon = TREND_ICONS[trend?.direction] || ArrowRight

  return (
    <div
      className="stat-card"
      style={{ "--stat-card-bg": theme.bg }}
    >
      <div className="card-body">
        {/* Icône */}
        <div className="stat-icon" style={{ "--stat-card-bg": theme.bg }}>
          <Icon size={22} aria-hidden="true" />
        </div>

        {/* Valeur */}
        <div className="stat-value">{value ?? "—"}</div>

        {/* Label */}
        <div className="stat-label">{label}</div>

        {/* Tendance */}
        {trend && (
          <div
            className="stat-trend"
            style={{ color: TREND_COLORS[trend.direction] || TREND_COLORS.neutral }}
          >
            <span aria-hidden="true"><TrendIcon size={14} /></span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
