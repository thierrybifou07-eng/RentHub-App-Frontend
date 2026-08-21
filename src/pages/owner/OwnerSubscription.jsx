import { useState, useEffect } from "react"
import { useSubscriptionsStore } from "../../stores/subscriptionsStore"
import { processSimulatedPayment } from "../../services/subscriptionsService"
import PageHeader from "../../components/common/PageHeader"
import { SkeletonPage } from "../../components/feedback/SkeletonLoader"
import ErrorState from "../../components/feedback/ErrorState"
import { Check } from "lucide-react"
import { formatXAF, formatDate } from "../../utils/formatters"
import { getSubscriptionStatusLabel } from "../../constants/apiStatuses"

function planFeaturesList(features = {}) {
  const items = []
  if (features.max_active_announcements) {
    items.push(`Jusqu'à ${features.max_active_announcements} annonces actives`)
  }
  if (features.max_media) {
    items.push(`Jusqu'à ${features.max_media} photos par annonce`)
  }
  if (features.badge) {
    items.push("Badge premium sur vos annonces")
  }
  if (features.featured) {
    items.push("Annonces en tête des résultats")
  }
  return items
}

function OwnerSubscription() {
  const { plans, currentSubscription, loading, error, fetchPlans, fetchMySubscription } = useSubscriptionsStore()

  const [selectedPlanId, setSelectedPlanId] = useState(null)

  const [processingAction, setProcessingAction] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  useEffect(() => {
    fetchPlans()
    fetchMySubscription()
  }, [fetchPlans, fetchMySubscription])

  const handleSubscribeClick = (planId) => {
    setSelectedPlanId(planId)
    setActionError(null)
    setActionSuccess(null)
  }

  const handleSimulatedPay = async (planId) => {
    setProcessingAction(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await processSimulatedPayment(planId)
      setActionSuccess("Paiement simulé effectué — votre abonnement est désormais actif.")
      setSelectedPlanId(null)
      fetchMySubscription()
    } catch (err) {
      setActionError(err.message || "Erreur lors du paiement simulé.")
    } finally {
      setProcessingAction(false)
    }
  }

  if (loading && !plans.length) {
    return <SkeletonPage cols={3} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const activePlan = currentSubscription?.plan || currentSubscription?.SubscriptionPlan || null

  return (
    <div>
      <PageHeader
        title="Mon Abonnement"
        description="Gérez votre forfait pour publier plus d'annonces."
      />

      {/* État actuel */}
      <div className="card border-0 shadow-sm mb-5 bg-primary-subtle text-primary-emphasis">
        <div className="card-body">
          <h2 className="h5 fw-bold mb-3">Statut actuel</h2>
          {currentSubscription ? (
            <div>
              <p className="mb-1">
                Forfait : <strong>{activePlan?.label || "Inconnu"}</strong>
              </p>
              <p className="mb-1">
                Statut : <strong>{getSubscriptionStatusLabel(currentSubscription.status)}</strong>
              </p>
              {currentSubscription.end_date && (
                <p className="mb-0 small">
                  Valide jusqu'au : {formatDate(currentSubscription.end_date)}
                </p>
              )}
            </div>
          ) : (
            <p className="mb-0">Vous n'avez aucun abonnement actif.</p>
          )}
        </div>
      </div>

      <h2 className="h5 fw-bold mb-3">Nos forfaits</h2>
      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
      {actionError && <div className="alert alert-danger">{actionError}</div>}

      <div className="row g-4">
        {plans.map((plan) => {
          const featureList = planFeaturesList(plan.features || {})
          const durationText = plan.duration_days ? `${plan.duration_days} jours de validité` : "Validité illimitée"

          return (
            <div key={plan.id} className="col-md-6 col-lg-4">
              <div className={`card h-100 shadow-sm ${activePlan?.id === plan.id && currentSubscription?.status === "ACTIVE" ? "border-primary border-2" : "border-0"}`}>
                <div className="card-body d-flex flex-column">
                  <h3 className="h5 fw-bold text-center mb-1">{plan.label}</h3>
                  <h4 className="h3 fw-bold text-center text-primary mb-3">
                    {plan.price > 0 ? `${formatXAF(plan.price)} FCFA` : "Gratuit"}
                  </h4>

                  <p className="text-secondary small text-center mb-4">
                    {plan.description || "Fonctionnalités avancées pour vos biens."}
                  </p>

                  <ul className="list-unstyled flex-grow-1 small mb-4">
                    <li className="mb-2"><Check size={15} className="me-2 text-success" />{durationText}</li>
                    {featureList.map((f, i) => <li key={i} className="mb-2"><Check size={15} className="me-2 text-success" />{f}</li>)}
                  </ul>

                  {activePlan?.id === plan.id && currentSubscription?.status === "ACTIVE" ? (
                    <button className="btn btn-outline-primary w-100" disabled>Forfait actuel</button>
                  ) : Number(plan.price) === 0 ? (
                    <button className="btn btn-outline-secondary w-100" disabled>Gratuit — forfait par défaut</button>
                  ) : (
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleSubscribeClick(plan.id)}
                    >
                      Choisir ce forfait
                    </button>
                  )}

                  {/* Zone d'action si ce plan est sélectionné */}
                  {selectedPlanId === plan.id && (
                    <div className="mt-4 pt-3 border-top">
                      <h5 className="h6 fw-bold mb-3">Paiement simulé</h5>
                      <p className="text-secondary small">
                        Mode démonstration : le paiement est simulé. Votre abonnement sera activé immédiatement.
                      </p>
                      <div className="d-flex gap-2 mt-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary w-50" onClick={() => setSelectedPlanId(null)} disabled={processingAction}>Annuler</button>
                        <button type="button" className="btn btn-sm btn-success w-50" onClick={() => handleSimulatedPay(plan.id)} disabled={processingAction}>
                          {processingAction ? "Paiement..." : "Payer (simulation)"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OwnerSubscription
