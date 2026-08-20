import { useEffect, useState } from "react"
import { useAuthStore } from "../../stores/authStore"
import { getAuditStats } from "../../api/superAdminApi"
import StatCard from "../../components/common/StatCard"
import PageHeader from "../../components/common/PageHeader"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import { Shield, ScrollText, Users, Activity, AlertTriangle, Key, Trash2, CheckCircle } from "lucide-react"

const ACTION_ICONS = {
  ROLE_CHANGE: { icon: Users, color: "text-primary" },
  STATUS_CHANGE: { icon: AlertTriangle, color: "text-warning" },
  PASSWORD_RESET: { icon: Key, color: "text-info" },
  ACCOUNT_DELETE: { icon: Trash2, color: "text-danger" },
  ACCOUNT_VERIFY: { icon: CheckCircle, color: "text-success" },
  ANNOUNCEMENT_MODERATE: { icon: Activity, color: "text-secondary" },
  LOGIN: { icon: Shield, color: "text-muted" },
  LOGOUT: { icon: Shield, color: "text-muted" },
}

const ACTION_LABELS = {
  ROLE_CHANGE: "Changement de rôle",
  STATUS_CHANGE: "Changement de statut",
  PASSWORD_RESET: "Réinitialisation mot de passe",
  ACCOUNT_DELETE: "Suppression de compte",
  ACCOUNT_VERIFY: "Vérification de compte",
  ANNOUNCEMENT_MODERATE: "Modération d'annonce",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
}

export default function RootDashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getAuditStats()
        if (active) setStats(data)
      } catch (err) {
        if (active) setError(err.message || "Erreur de chargement")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  if (!user) return null
  if (loading) return <LoadingState message="Chargement de l'espace super admin..." />
  if (error) return <ErrorState message={error} />

  const byAction = stats?.byAction || []
  const recent = stats?.recent || []

  return (
    <div>
      <PageHeader
        title="Espace Super Administrateur"
        description={`Bienvenue ${user.name || "Root"}. Voici la vue d'ensemble de l'audit système.`}
      />

      <div className="row g-3 mb-5">
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={ScrollText} label="Total actions auditées" value={stats?.total || 0} color="primary" />
        </div>
        {byAction.slice(0, 3).map((item) => {
          const meta = ACTION_ICONS[item.action] || { icon: Activity, color: "text-muted" }
          return (
            <div key={item.action} className="col-sm-6 col-xl-3">
              <StatCard
                icon={meta.icon}
                label={ACTION_LABELS[item.action] || item.action}
                value={item.count}
                color="info"
              />
            </div>
          )
        })}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Répartition par action</h5>
            </div>
            <div className="card-body">
              {byAction.length === 0 ? (
                <p className="text-muted text-center my-4">Aucune action enregistrée.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {byAction.map((item) => {
                    const meta = ACTION_ICONS[item.action] || { icon: Activity, color: "text-muted" }
                    const Icon = meta.icon
                    return (
                      <li key={item.action} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                            <Icon size={14} className={meta.color} />
                          </div>
                          <span className="small fw-medium">{ACTION_LABELS[item.action] || item.action}</span>
                        </div>
                        <span className="badge bg-light text-dark">{item.count}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Dernières actions</h5>
            </div>
            <div className="card-body">
              {recent.length === 0 ? (
                <p className="text-muted text-center my-4">Aucune activité récente.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-borderless table-renthub align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="small text-muted fw-semibold">Acteur</th>
                        <th className="small text-muted fw-semibold">Action</th>
                        <th className="small text-muted fw-semibold">Cible</th>
                        <th className="small text-muted fw-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((log) => (
                        <tr key={log.id} className="border-bottom">
                          <td>
                            <div className="small fw-medium">{log.actor_email}</div>
                            <div className="text-muted" style={{ fontSize: "0.7rem" }}>{log.actor_role}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">{ACTION_LABELS[log.action] || log.action}</span>
                          </td>
                          <td>
                            <span className="small">{log.target_type} #{log.target_id || "—"}</span>
                          </td>
                          <td>
                            <small className="text-muted">{new Date(log.createdAt).toLocaleString("fr-FR")}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
