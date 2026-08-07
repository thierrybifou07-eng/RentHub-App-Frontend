import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { loginSchema } from "../../schemas/userSchema"
import FormField from "../../components/forms/FormField"

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const registered = location.state?.registered === true

  function validate() {
    const result = loginSchema.safeParse({ email, password })
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
      const user = await login(email, password)
      const dashRoute = APP_ROUTES[`${user.role}Dashboard`] || APP_ROUTES.home
      navigate(dashRoute, { replace: true })
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-1">Connexion</h1>
      <p className="text-secondary small mb-4">
        Accédez à votre espace RentHub.
      </p>

      {registered && (
        <div className="alert alert-success small py-2" role="alert">
          Votre compte a été créé avec succès. Un code de vérification vous a été envoyé
          par e-mail : connectez-vous pour continuer.
        </div>
      )}

      {globalError && (
        <div className="alert alert-danger small py-2" role="alert">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Adresse e-mail" htmlFor="login-email" error={errors.email}>
          <input
            type="email"
            id="login-email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="votrenom@exemple.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField label="Mot de passe" htmlFor="login-password" error={errors.password}>
          <input
            type="password"
            id="login-password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            placeholder="Entrer un mot de passe valide..."
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={submitting}
        >
          {submitting ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-secondary small mt-3 mb-0">
        Pas encore de compte ?{" "}
        <Link to={APP_ROUTES.register}>Créer un compte</Link>
      </p>
    </div>
  )
}

export default LoginPage
