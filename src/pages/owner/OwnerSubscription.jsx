import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useAuthStore } from "../../stores/authStore"
import { useSubscriptionsStore } from "../../stores/subscriptionsStore"
import { processManualSubscription, initStripePayment, confirmStripePayment } from "../../services/subscriptionsService"
import PageHeader from "../../components/common/PageHeader"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"
import FormField from "../../components/forms/FormField"

// Idéalement à mettre dans le .env (VITE_STRIPE_PUBLIC_KEY)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder")

function StripePaymentForm({ clientSecret, planId, onSuccess, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (stripeError) {
        setError(stripeError.message)
      } else if (paymentIntent.status === "succeeded") {
        await confirmStripePayment(paymentIntent.id)
        onSuccess()
      } else {
        setError("Le statut du paiement est inattendu.")
      }
    } catch (err) {
      setError("Erreur lors de la confirmation du paiement côté serveur.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border p-3 rounded bg-light mt-3">
      <h4 className="h6 fw-bold mb-3">Paiement sécurisé par carte</h4>
      {error && <div className="alert alert-danger p-2 small">{error}</div>}
      
      <div className="bg-white p-2 border rounded mb-3">
        <CardElement options={{ style: { base: { fontSize: "16px", color: "#32325d" } } }} />
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel} disabled={processing}>
          Annuler
        </button>
        <button type="submit" className="btn btn-sm btn-success" disabled={!stripe || processing}>
          {processing ? "Traitement..." : "Payer maintenant"}
        </button>
      </div>
    </form>
  )
}

function OwnerSubscription() {
  const { user } = useAuthStore()
  const { plans, currentSubscription, loading, error, fetchPlans, fetchMySubscription } = useSubscriptionsStore()

  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("manual") // "manual" ou "stripe"
  const [paymentReference, setPaymentReference] = useState("")
  
  const [clientSecret, setClientSecret] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  useEffect(() => {
    fetchPlans()
    fetchMySubscription()
  }, [fetchPlans, fetchMySubscription])

  const handleSubscribeClick = (planId) => {
    setSelectedPlanId(planId)
    setClientSecret(null)
    setActionError(null)
    setActionSuccess(null)
    setPaymentReference("")
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPlanId) return

    setProcessingAction(true)
    setActionError(null)
    try {
      await processManualSubscription(selectedPlanId, paymentReference)
      setActionSuccess("Votre demande de souscription manuelle a été envoyée. Elle est en attente de validation.")
      setSelectedPlanId(null)
    } catch (err) {
      setActionError(err.message || "Erreur lors de la souscription manuelle.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleStripeInit = async () => {
    if (!selectedPlanId) return
    setProcessingAction(true)
    setActionError(null)
    try {
      const result = await initStripePayment(selectedPlanId)
      if (result.clientSecret) {
        setClientSecret(result.clientSecret)
      } else {
        setActionError("Impossible d'initialiser le paiement Stripe.")
      }
    } catch (err) {
      setActionError(err.message || "Erreur lors de l'initialisation Stripe.")
    } finally {
      setProcessingAction(false)
    }
  }

  if (loading && !plans.length) {
    return <LoadingState message="Chargement des offres..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const activePlan = currentSubscription?.plan || null
  const statusLabels = {
    PENDING: "En attente de validation",
    ACTIVE: "Actif",
    EXPIRED: "Expiré",
    CANCELLED: "Annulé",
    REJECTED: "Rejeté",
  }

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
                Forfait : <strong>{activePlan?.name || "Inconnu"}</strong>
              </p>
              <p className="mb-1">
                Statut : <strong>{statusLabels[currentSubscription.status] || currentSubscription.status}</strong>
              </p>
              {currentSubscription.validUntil && (
                <p className="mb-0 small">
                  Valide jusqu'au : {new Date(currentSubscription.validUntil).toLocaleDateString("fr-FR")}
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
        {plans.map((plan) => (
          <div key={plan.id} className="col-md-6 col-lg-4">
            <div className={`card h-100 shadow-sm ${activePlan?.id === plan.id ? "border-primary border-2" : "border-0"}`}>
              <div className="card-body d-flex flex-column">
                <h3 className="h5 fw-bold text-center mb-1">{plan.name}</h3>
                <h4 className="h3 fw-bold text-center text-primary mb-3">
                  {plan.price > 0 ? `${plan.price} FCFA` : "Gratuit"}
                </h4>
                
                <p className="text-secondary small text-center mb-4">
                  {plan.description || "Fonctionnalités avancées pour vos biens."}
                </p>
                
                <ul className="list-unstyled flex-grow-1 small mb-4">
                  <li className="mb-2">✔️ {plan.durationDays} jours de validité</li>
                  {plan.features?.map((f, i) => <li key={i} className="mb-2">✔️ {f}</li>)}
                </ul>

                {activePlan?.id === plan.id && currentSubscription?.status === "ACTIVE" ? (
                  <button className="btn btn-outline-primary w-100" disabled>Forfait actuel</button>
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
                    <h5 className="h6 fw-bold mb-3">Méthode de paiement</h5>
                    <div className="d-flex gap-2 mb-3">
                      <button 
                        type="button" 
                        className={`btn btn-sm ${paymentMethod === "manual" ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => setPaymentMethod("manual")}
                        disabled={processingAction || !!clientSecret}
                      >
                        Manuel
                      </button>
                      <button 
                        type="button" 
                        className={`btn btn-sm ${paymentMethod === "stripe" ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => setPaymentMethod("stripe")}
                        disabled={processingAction || !!clientSecret}
                      >
                        Carte (Stripe)
                      </button>
                    </div>

                    {paymentMethod === "manual" && (
                      <form onSubmit={handleManualSubmit}>
                        <FormField label="Référence de paiement (ex: Mobile Money)" htmlFor={`ref-${plan.id}`}>
                          <input
                            type="text"
                            id={`ref-${plan.id}`}
                            className="form-control form-control-sm"
                            placeholder="Optionnel..."
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            disabled={processingAction}
                          />
                        </FormField>
                        <div className="d-flex gap-2 mt-2">
                          <button type="button" className="btn btn-sm btn-outline-secondary w-50" onClick={() => setSelectedPlanId(null)}>Annuler</button>
                          <button type="submit" className="btn btn-sm btn-success w-50" disabled={processingAction}>
                            Valider
                          </button>
                        </div>
                      </form>
                    )}

                    {paymentMethod === "stripe" && !clientSecret && (
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary w-50" onClick={() => setSelectedPlanId(null)}>Annuler</button>
                        <button type="button" className="btn btn-sm btn-success w-50" onClick={handleStripeInit} disabled={processingAction}>
                          Payer en ligne
                        </button>
                      </div>
                    )}

                    {paymentMethod === "stripe" && clientSecret && (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentForm 
                          clientSecret={clientSecret}
                          planId={plan.id}
                          onSuccess={() => {
                            setActionSuccess("Paiement réussi. Votre abonnement est activé !")
                            setSelectedPlanId(null)
                            setClientSecret(null)
                          }}
                          onCancel={() => {
                            setClientSecret(null)
                            setSelectedPlanId(null)
                          }}
                        />
                      </Elements>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OwnerSubscription
