/**
 * FormField — Champ de formulaire premium
 *
 * Props:
 *  label    — libellé du champ (optionnel)
 *  htmlFor  — id du champ associé
 *  error    — message d'erreur Zod/API (optionnel)
 *  hint     — texte d'aide sous le champ (optionnel)
 *  required — affiche une étoile rouge sur le label
 *  children — l'élément input/select/textarea
 */

function FormField({ label, htmlFor, error, hint, required = false, children }) {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={htmlFor} className="form-label">
          {label}
          {required && (
            <span className="required-star" aria-hidden="true"> *</span>
          )}
        </label>
      )}

      {children}

      {error && (
        <div className="field-error" role="alert" aria-live="polite">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="field-hint">
          {hint}
        </div>
      )}
    </div>
  )
}

export default FormField
