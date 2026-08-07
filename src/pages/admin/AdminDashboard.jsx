import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import * as adminService from "../../services/adminService.js"
import StatCard from "../../components/common/StatCard"

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await adminService.getDashboardStats()
        if (active) setStats(data)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  if (!user) return null

  const statCards = [
    {
      icon: "\uf007",
      label: "Utilisateurs",
      value: stats ? stats.users : null,
      color: "text-primary",
      href: "/admin/users",
    },
    {
      icon: "\uf15c",
      label: "Annonces publiées",
      value: stats ? stats.publishedListings : null,
      color: "text-success",
      href: "/admin/moderation",
    },
    {
      icon: "\uf071",
      label: "Signalements",
      value: stats ? stats.pendingReports : null,
      color: "text-warning",
      href: "/admin/reports",
    },
    {
      icon: "\uf27b",
      label: "Conversations actives",
      value: stats ? stats.activeConversations : null,
      color: "text-info",
      href: "/owner/messages",
    },
  ]

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Espace administrateur</h1>
          <p className="text-muted mb-0">
            Bienvenue, {user.name || "Admin"} ! Voici un aperçu de
            l'activité.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={logout}
        >
          Déconnexion
        </button>
      </header>

      <div className="row g-3 mb-4">
        {statCards.map((c) => (
          <div key={c.label} className="col-6 col-lg-3">
            {loading ? (
              <div className="card h-100">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-8"></span>
                  </div>
                </div>
              </div>
            ) : (
              <Link to={c.href} className="text-decoration-none">
                <StatCard
                  icon={c.icon}
                  label={c.label}
                  value={c.value}
                  color={c.color}
                />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <span
                className="d-inline-block fs-1 mb-2"
                dangerouslySetInnerHTML={{ __html: "&#xf085;" }}
              />
              <h5 className="card-title">Modération</h5>
              <p className="card-text text-muted small">
                Validez ou rejetez les annonces en attente.
              </p>
              <Link
                to="/admin/moderation"
                className="btn btn-sm btn-primary"
              >
                Accéder
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <span
                className="d-inline-block fs-1 mb-2"
                dangerouslySetInnerHTML={{ __html: "&#xf0c0;" }}
              />
              <h5 className="card-title">Utilisateurs</h5>
              <p className="card-text text-muted small">
                Gérez les comptes et les rôles.
              </p>
              <Link
                to="/admin/users"
                className="btn btn-sm btn-success"
              >
                Accéder
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <span
                className="d-inline-block fs-1 mb-2"
                dangerouslySetInnerHTML={{ __html: "&#xf071;" }}
              />
              <h5 className="card-title">Signalements</h5>
              <p className="card-text text-muted small">
                Consultez et traitez les signalements.
              </p>
              <Link
                to="/admin/reports"
                className="btn btn-sm btn-warning"
              >
                Accéder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
