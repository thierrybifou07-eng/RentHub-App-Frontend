import { useState } from "react"
import { createReport } from "../../api/reportsApi"
import { reportSchema } from "../../schemas/reportSchema"
import FormField from "../forms/FormField"

function ReportModal({ announcementId, onClose, onSuccess }) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    
    const parsed = reportSchema.safeParse({ reason })
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    setSubmitting(true)
    try {
      await createReport({
        announcementId,
        reason,
      })
      onSuccess()
    } catch (err) {
      if (err.status === 429) {
        setError("Vous avez déjà signalé cette annonce récemment.")
      } else if (err.status === 400) {
        setError("Vous ne pouvez pas signaler votre propre annonce.")
      } else if (err.status === 409) {
        setError("Vous avez déjà signalé cette annonce.")
      } else {
        setError(err.message || "Une erreur est survenue lors du signalement.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom-0">
            <h5 className="modal-title fw-bold">Signaler cette annonce</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Fermer" disabled={submitting}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-0">
              {error && <div className="alert alert-danger small py-2 mb-3">{error}</div>}
              
              <p className="small text-secondary mb-3">
                Votre signalement nous aide à garder notre communauté sûre. Il sera examiné par notre équipe de modération.
              </p>

              <FormField label="Raison du signalement" htmlFor="report-reason" required>
                <textarea
                  id="report-reason"
                  className="form-control"
                  rows={4}
                  placeholder="Décrivez précisément ce qui ne va pas avec cette annonce (min 10 caractères)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={submitting}
                  required
                />
              </FormField>
            </div>

            <div className="modal-footer border-top-0 mt-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                Annuler
              </button>
              <button type="submit" className="btn btn-danger" disabled={submitting || !reason.trim()}>
                {submitting ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReportModal
