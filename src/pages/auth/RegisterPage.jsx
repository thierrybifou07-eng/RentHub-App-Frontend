import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { registerSchema } from "../../schemas/userSchema"
import FormField from "../../components/forms/FormField"

function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const result = registerSchema.safeParse({
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
    })
    if (!result.success) {
      const fieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGlobalError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await register({ firstname, lastname, email, password, confirmPassword })
      navigate(APP_ROUTES.login, { replace: true, state: { registered: true } })
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-1">Inscription</h1>
      <p className="text-secondary small mb-4">
        Créez votre compte pour commencer.
      </p>

      {globalError && (
        <div className="alert alert-danger small py-2" role="alert">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Prénom" htmlFor="register-firstname" error={errors.firstname}>
          <input
            type="text"
            id="register-firstname"
            className={`form-control ${errors.firstname ? "is-invalid" : ""}`}
            placeholder="Votre prénom"
            autoComplete="given-name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
        </FormField>

        <FormField label="Nom" htmlFor="register-lastname" error={errors.lastname}>
          <input
            type="text"
            id="register-lastname"
            className={`form-control ${errors.lastname ? "is-invalid" : ""}`}
            placeholder="Votre nom"
            autoComplete="family-name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </FormField>

        <FormField label="Adresse e-mail" htmlFor="register-email" error={errors.email}>
          <input
            type="email"
            id="register-email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="vous@exemple.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField label="Mot de passe" htmlFor="register-password" error={errors.password}>
          <input
            type="password"
            id="register-password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            placeholder="8 caractères min., majuscule, chiffre et caractère spécial"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <FormField label="Confirmer le mot de passe" htmlFor="register-confirm" error={errors.confirmPassword}>
          <input
            type="password"
            id="register-confirm"
            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
            placeholder="Veuillez confirmer le mot de passe"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormField>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={submitting}
        >
          {submitting ? "Création en cours..." : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center text-secondary small mt-3 mb-0">
        Déjà inscrit ?{" "}
        <Link to={APP_ROUTES.login}>Se connecter</Link>
      </p>
    </div>
  )
}

export default RegisterPage
