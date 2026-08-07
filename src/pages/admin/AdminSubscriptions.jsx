import { useEffect, useState } from "react"
import { getAdminSubscriptions, activateSubscription, rejectSubscription } from "../../api/subscriptionsApi"
import PageHeader from "../../components/common/PageHeader"
import EmptyState from "../../components/feedback/EmptyState"
import LoadingState from "../../components/feedback/LoadingState"

const STATUS_CLASSES = {
  PENDING: "bg-warning text-dark",
  ACTIVE: "bg-success",
  EXPIRED: "bg-secondary",
  CANCELLED: "bg-dark",
  REJECTED: "bg-danger",
}
const STATUS_LABELS = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
  REJECTED: "Rejeté",
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState("all")
  
  useEffect(() => {
    let active = true
    loadSubscriptions(active)
    return () => { active = false }
  }, [filter])

  async function loadSubscriptions(active = true) {
    setLoading(true)
    try {
      const params = filter === "all" ? {} : { status: filter }
      const data = await getAdminSubscriptions(params)
      if (active) setSubscriptions(data.items || data || [])
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }

  const handleActivate = async (id) => {
    const note = prompt("Note admin (optionnelle) pour l'activation :")
    if (note === null) return
    setActionLoading(id)
    try {
      await activateSubscription(id, note)
      await loadSubscriptions()
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    const note = prompt("Raison du rejet de cet abonnement :")
    if (note === null) return
    setActionLoading(id)
    try {
      await rejectSubscription(id, note || "Paiement non valide")
      await loadSubscriptions()
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === "all"
    ? subscriptions
    : subscriptions.filter(s => s.status?.code === filter || s.status === filter)

  return (
    <div>
      <PageHeader
        title="Gestion des abonnements"
        description="Traitez les souscriptions manuelles et consultez l'historique."
      />

      <ul className="nav nav-pills mb-4">
        {[
          { key: "all", label: "Tous" },
          { key: "PENDING", label: "En attente (Manuel)" },
          { key: "ACTIVE", label: "Actifs" },
          { key: "REJECTED", label: "Rejetés" },
        ].map((t) => (
          <li key={t.key} className="nav-item">
            <button
              type="button"
              className={`nav-link ${filter === t.key ? "active" : ""}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {loading && subscriptions.length === 0 ? (
        <LoadingState message="Chargement des abonnements..." />
      ) : filtered.length === 0 ? (
        <EmptyState message="Aucun abonnement trouvé pour ce filtre." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Propriétaire</th>
                  <th>Forfait</th>
                  <th>Référence Paiement</th>
                  <th>Statut</th>
                  <th>Date demande</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const ownerName = sub.user?.name || sub.user?.email || "Inconnu"
                  const planName = sub.plan?.name || "Inconnu"
                  const statusCode = sub.status?.code || sub.status
                  
                  return (
                    <tr key={sub.id}>
                      <td className="fw-semibold">{ownerName}</td>
                      <td>{planName}</td>
                      <td>
                        {sub.payment_reference || sub.paymentReference ? (
                          <span className="font-monospace text-muted">{sub.payment_reference || sub.paymentReference}</span>
                        ) : (
                          <span className="text-muted fst-italic">En ligne (Stripe)</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_CLASSES[statusCode] || "bg-secondary"}`}>
                          {STATUS_LABELS[statusCode] || statusCode}
                        </span>
                      </td>
                      <td>
                        {sub.created_at || sub.createdAt 
                          ? new Date(sub.created_at || sub.createdAt).toLocaleDateString("fr-FR") 
                          : "—"}
                      </td>
                      <td className="text-end">
                        {statusCode === "PENDING" && (
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => handleActivate(sub.id)}
                              disabled={actionLoading === sub.id}
                            >
                              Activer
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleReject(sub.id)}
                              disabled={actionLoading === sub.id}
                            >
                              Rejeter
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
