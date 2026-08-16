import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import { getStats, getPendingCounts, getRecentActivity, getStatsEvolution } from "../../api/adminApi"
import StatCard from "../../components/common/StatCard"
import PageHeader from "../../components/common/PageHeader"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import { APP_ROUTES } from "../../constants/routes"
import { Bell, Coins, CreditCard, Home, MapPin, ShieldCheck, Siren, Tag, User, Users } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const CHART_COLORS = ["#6366f1", "#10b981", "#f59f00", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316"]

const PERIODS = [
  { value: 7, label: "7 derniers jours" },
  { value: 30, label: "30 derniers jours" },
  { value: 60, label: "60 derniers jours" },
  { value: 90, label: "90 derniers jours" },
  { value: 180, label: "6 derniers mois" },
  { value: 365, label: "1 an" },
]

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState(null)
  const [activity, setActivity] = useState([])
  const [evolution, setEvolution] = useState(null)
  const [granularity, setGranularity] = useState("day")
  const [periodDays, setPeriodDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      try {
        const [statsData, pendingData, activityData, evolutionData] = await Promise.all([
          getStats(),
          getPendingCounts(),
          getRecentActivity(),
          getStatsEvolution(periodDays),
        ])
        if (active) {
          setStats(statsData)
          setPending(pendingData)
          setEvolution(evolutionData)
          setGranularity(evolutionData?.granularity || "day")
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
  }, [periodDays])

  const evolutionData = useMemo(() => {
    const byDay = {}
    const pushSeries = (series, key) => {
      for (const row of series || []) {
        const date = String(row.date || "").slice(0, 10)
        if (!date) continue
        if (!byDay[date]) byDay[date] = { date, users: 0, announcements: 0, reports: 0, subscriptions: 0 }
        byDay[date][key] = Number(row.count) || 0
      }
    }
    pushSeries(evolution?.users, "users")
    pushSeries(evolution?.announcements, "announcements")
    pushSeries(evolution?.reports, "reports")
    pushSeries(evolution?.subscriptions, "subscriptions")
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date))
  }, [evolution])

  const plansData = useMemo(
    () => (stats?.subscriptions?.byPlan || []).map((p) => ({ ...p, label: p.label || p.code })),
    [stats]
  )

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

  const periodLabel = PERIODS.find((p) => p.value === periodDays)?.label || `${periodDays} derniers jours`

  const formatDay = (value) => {
    const str = String(value)
    if (granularity === "week") {
      const [, w] = str.split("-W")
      return w ? `S${w}` : str
    }
    if (granularity === "month") {
      const [y, m] = str.split("-")
      return m ? `${m}/${y}` : str
    }
    const [, m, d] = str.split("-")
    return d ? `${d}/${m}` : str
  }

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

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            icon={Coins}
            label="Revenus totaux"
            value={formatMoney(stats?.revenue?.total)}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            icon={Coins}
            label="Revenus (30 derniers jours)"
            value={formatMoney(stats?.revenue?.last30d)}
            color="info"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Répartition par plan */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Répartition par plan</h5>
            </div>
            <div className="card-body">
              {plansData.length === 0 ? (
                <p className="text-muted text-center my-4">Aucun abonnement.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={plansData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {plansData.map((entry, index) => (
                        <Cell key={entry.id || index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Top villes */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Top villes</h5>
            </div>
            <div className="card-body">
              <DistributionList items={stats?.announcements?.topCities || []} icon={MapPin} empty="Aucune annonce." />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Top types de bien */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Top types de bien</h5>
            </div>
            <div className="card-body">
              <DistributionList items={stats?.announcements?.topTypes || []} icon={Tag} empty="Aucune annonce." />
            </div>
          </div>
        </div>

        {/* Utilisateurs par rôle */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Utilisateurs par rôle</h5>
            </div>
            <div className="card-body">
              <DistributionList items={stats?.users?.byRole || []} icon={User} empty="Aucun utilisateur." />
            </div>
          </div>
        </div>

        {/* Utilisateurs par statut */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold mb-0">Utilisateurs par statut</h5>
            </div>
            <div className="card-body">
              <DistributionList items={stats?.users?.byStatus || []} icon={ShieldCheck} empty="Aucun utilisateur." />
            </div>
          </div>
        </div>
      </div>

      {evolutionData.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
            <h5 className="fw-bold mb-0">Évolution — {periodLabel}</h5>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              aria-label="Période d'évolution"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDay}
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(value) => formatDay(value)}
                  formatter={(value, name) => [value, name]}
                />
                <Legend />
                <Line type="monotone" dataKey="users" name="Utilisateurs" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="announcements" name="Annonces" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="reports" name="Signalements" stroke="#f59f00" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="subscriptions" name="Abonnements" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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

const formatMoney = (value) => `${Number(value || 0).toLocaleString("fr-FR")} FCFA`

function DistributionList({ items, icon: Icon, empty }) {
  if (!items || items.length === 0) {
    return <p className="text-muted text-center my-4">{empty}</p>
  }
  const max = Math.max(...items.map((i) => Number(i.count) || 0))
  return (
    <div>
      {items.map((item, index) => {
        const count = Number(item.count) || 0
        const pct = max > 0 ? Math.round((count / max) * 100) : 0
        return (
          <div key={item.id || index} className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
                  <Icon size={14} className="text-muted" />
                </div>
                <span className="small fw-medium text-truncate" style={{ maxWidth: "180px" }}>{item.label || item.code || item.name || "—"}</span>
              </div>
              <span className="small fw-bold">{count}</span>
            </div>
            <div className="progress" style={{ height: "6px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                aria-valuenow={pct}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
