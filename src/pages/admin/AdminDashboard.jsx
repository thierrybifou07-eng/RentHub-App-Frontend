import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import { getStats, getPendingCounts, getRecentActivity } from "../../api/adminApi"
import StatCard from "../../components/common/StatCard"
import PageHeader from "../../components/common/PageHeader"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import { APP_ROUTES } from "../../constants/routes"
import { Bell, CreditCard, Home, Siren, User, Users } from "lucide-react"

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      try {
        const [statsData, pendingData, activityData] = await Promise.all([
          getStats(),
          getPendingCounts(),
          getRecentActivity()
        ])
        if (active) {
          setStats(statsData)
          setPending(pendingData)
          setActivity([
            ...(activityData?.announcements || []).map((a) => ({
              type: "LISTING",
              message: `Nouvelle annonce en attente de validation`,
              description: a.owner ? `${a.owner.firstname} ${a.owner.lastname}` : "",
              createdAt: a.createdAt,
            })),
            ...(activityData?.reports || []).map((r) => ({
              type: "REPORT",
              message: `Nouveau signalement reçu`,
              createdAt: r.createdAt,
            })),
            ...(activityData?.subscriptions || []).map((s) => ({
              type: "SUBSCRIPTION",
              message: `Nouvel abonnement en attente de paiement`,
              description: s.user ? `${s.user.firstname} ${s.user.lastname}` : "",
              createdAt: s.createdAt,
            })),
          ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        }
      } catch (err) {
        if (active) setError(err.message || "Erreur de chargement du tableau de bord")
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => { active = false }
  }, [])

  if (!user) return null

  if (loading) return <LoadingState message="Chargement de l'espace administrateur..." />
  if (error) return <ErrorState message={error} />

  const statCards = [
    {
      icon: Users,
      label: "Utilisateurs totaux",
      value: stats?.users?.total || 0,
      color: "primary",
      href: APP_ROUTES.adminUsers,
    },
    {
      icon: Home,
      label: "Annonces actives",
      value: stats?.announcements?.active || 0,
      color: "success",
      href: APP_ROUTES.adminModeration,
    },
    {
      icon: Siren,
      label: "Signalements en cours",
      value: stats?.reports?.pending || 0,
      color: "warning",
      href: APP_ROUTES.adminReports,
    },
    {
      icon: CreditCard,
      label: "Abonnements actifs",
      value: stats?.subscriptions?.active || 0,
      color: "info",
      href: APP_ROUTES.adminSubscriptions,
    },
  ]

  return (
    <div>
      <PageHeader 
        title="Espace Administrateur" 
        description={`Bienvenue ${user.name || "Admin"}. Voici la vue d'ensemble de RentHub.`} 
      />

      <div className="row g-3 mb-5">
        {statCards.map((c) => (
          <div key={c.label} className="col-sm-6 col-xl-3">
            <Link to={c.href} className="text-decoration-none">
              <StatCard
                icon={c.icon}
                label={c.label}
                value={c.value}
                color={c.color}
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Tâches en attente */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Tâches en attente</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                  <div>
                    <h6 className="mb-1">Annonces à valider</h6>
                    <small className="text-muted">Nouvelles publications</small>
                  </div>
                  <span className={`badge rounded-pill ${pending?.announcements > 0 ? "bg-primary" : "bg-secondary"}`}>
                    {pending?.announcements || 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                  <div>
                    <h6 className="mb-1">Signalements</h6>
                    <small className="text-muted">Alerte modération</small>
                  </div>
                  <span className={`badge rounded-pill ${pending?.reports > 0 ? "bg-warning text-dark" : "bg-secondary"}`}>
                    {pending?.reports || 0}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                  <div>
                    <h6 className="mb-1">Abonnements</h6>
                    <small className="text-muted">Paiements manuels</small>
                  </div>
                  <span className={`badge rounded-pill ${pending?.subscriptions > 0 ? "bg-info text-dark" : "bg-secondary"}`}>
                    {pending?.subscriptions || 0}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Activité Récente</h5>
            </div>
            <div className="card-body">
              {activity.length === 0 ? (
                <p className="text-muted text-center my-4">Aucune activité récente.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-borderless table-renthub align-middle mb-0">
                    <tbody>
                      {activity.slice(0, 6).map((item, index) => {
                        const ActivityIcon = item.type === "USER" ? User : item.type === "LISTING" ? Home : Bell
                        return (
                        <tr key={index} className="border-bottom">
                          <td style={{ width: "40px" }}>
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                              <ActivityIcon size={14} className="text-muted" />
                            </div>
                          </td>
                          <td>
                            <p className="mb-0 small fw-medium">{item.message || item.description}</p>
                            <small className="text-muted">{new Date(item.createdAt || item.date).toLocaleString("fr-FR")}</small>
                          </td>
                        </tr>
                        )
                      })}
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
