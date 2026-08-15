import { useEffect, useState, useCallback } from "react"
import { getAdminSubscriptions, activateSubscription, rejectSubscription, cancelSubscription } from "../../api/subscriptionsApi"
import PageHeader from "../../components/common/PageHeader"
import EmptyState from "../../components/feedback/EmptyState"
import LoadingState from "../../components/feedback/LoadingState"
import Pagination from "../../components/common/Pagination"

const PAGE_LIMIT = 20

const STATUS_CLASSES = {
  PENDING: "bg-warning text-dark",
  WAITING_PAYMENT: "bg-info text-dark",
  ACTIVE: "bg-success",
  EXPIRED: "bg-secondary",
  CANCELLED: "bg-dark",
  REJECTED: "bg-danger",
  FAILED: "bg-danger",
}
const STATUS_LABELS = {
  PENDING: "En attente",
  WAITING_PAYMENT: "Paiement attendu",
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
  REJECTED: "Rejeté",
  FAILED: "Échec paiement",
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  const loadSubscriptions = useCallback(async (active = true) => {
    try {
      const params = { page, limit: PAGE_LIMIT }
      if (filter !== "all") params.status = filter
      const data = await getAdminSubscriptions(params)
      if (active) {
        setSubscriptions(data.items || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalItems(data.pagination?.total || data.items?.length || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (active) setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    let active = true
    const onLoad = () => loadSubscriptions(active)
    onLoad()
    return () => { active = false }
  }, [loadSubscriptions])

  const changeFilter = (key) => {
    setFilter(key)
    setPage(1)
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

  const handleCancel = async (id) => {
    if (!window.confirm("Annuler cet abonnement actif ?")) return
    const note = prompt("Note admin (optionnelle) pour l'annulation :")
    if (note === null) return
    setActionLoading(id)
    try {
      await cancelSubscription(id, note)
      await loadSubscriptions()
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = subscriptions

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
          { key: "WAITING_PAYMENT", label: "Paiement en cours" },
          { key: "ACTIVE", label: "Actifs" },
          { key: "CANCELLED", label: "Annulés" },
          { key: "REJECTED", label: "Rejetés" },
        ].map((t) => (
          <li key={t.key} className="nav-item">
            <button
              type="button"
              className={`nav-link ${filter === t.key ? "active" : ""}`}
              onClick={() => changeFilter(t.key)}
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
            <table className="table align-middle table-hover table-renthub mb-0">
              <thead>
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
                  const ownerName = sub.user ? `${sub.user.firstname} ${sub.user.lastname}` : "Inconnu"
                  const planName = sub.SubscriptionPlan?.label || sub.plan?.label || "Inconnu"
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
                        {statusCode === "ACTIVE" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => handleCancel(sub.id)}
                            disabled={actionLoading === sub.id}
                          >
                            Annuler
                          </button>
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

      {!loading && subscriptions.length > 0 && (
        <>
          <p className="text-secondary small text-center mt-3 mb-0">
            {totalItems} abonnement{totalItems > 1 ? "s" : ""}
            {totalPages > 1 && ` — Page ${page} sur ${totalPages}`}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} ariaLabel="Pagination des abonnements" />
        </>
      )}
    </div>
  )
}
