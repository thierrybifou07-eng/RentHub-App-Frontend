import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { loginSchema } from "../../schemas/userSchema"
import { useAuthStore } from "../../stores/authStore"
import { APP_ROUTES } from "../../constants/routes"
import { USER_STATUS } from "../../constants/apiStatuses"
import FormField from "../../components/forms/FormField"
import { TriangleAlert } from "lucide-react"

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()

  const [globalError, setGlobalError] = useState(null)

  const registered = location.state?.registered === true

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: location.state?.email || "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    setGlobalError(null)
    try {
      const user = await login(data.email, data.password)
      
      // Gestion du cas PENDING_VERIFICATION
      if (user.userStatus === USER_STATUS.PENDING_VERIFICATION.id || !user.emailVerified) {
        navigate(APP_ROUTES.verifyEmail, { replace: true })
        return
      }

      // Redirection normale selon le rôle
      const dashRoute = APP_ROUTES[`${user.role}Dashboard`] || APP_ROUTES.home
      navigate(dashRoute, { replace: true })
    } catch (error) {
      setGlobalError(error.message || "Identifiants incorrects. Veuillez réessayer.")
    }
  }

  return (
    <div className="page-enter">
      <h2 style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>Connexion</h2>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
        Accédez à votre espace RentHub.
      </p>

      {registered && (
        <div
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: "var(--color-success-light)",
            color: "var(--color-success-dark)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
          }}
          role="status"
        >
          Votre compte a été créé avec succès. Connectez-vous pour continuer.
        </div>
      )}

      {globalError && (
        <div
          className="field-error"
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: "var(--color-danger-light)",
            borderRadius: "var(--radius-md)",
          }}
          role="alert"
        >
          <TriangleAlert size={16} aria-hidden="true" /> {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <FormField
          label="Adresse e-mail"
          htmlFor="email"
          error={errors.email?.message}
          required
        >
          <input
            id="email"
            type="email"
            className="input-premium"
            placeholder="jean.dupont@exemple.com"
            autoComplete="email"
            disabled={isSubmitting}
            {...register("email")}
          />
        </FormField>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-1)" }}>
            <label htmlFor="password" className="form-label" style={{ margin: 0 }}>
              Mot de passe <span className="required-star" aria-hidden="true">*</span>
            </label>
            <Link
              to={APP_ROUTES.forgotPassword || "/mot-de-passe-oublie"}
              style={{ fontSize: "var(--text-xs)", color: "var(--color-primary-600)", textDecoration: "none", fontWeight: 500 }}
              tabIndex={-1}
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <FormField
            htmlFor="password"
            error={errors.password?.message}
          >
            <input
              id="password"
              type="password"
              className="input-premium"
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register("password")}
            />
          </FormField>
        </div>

        <button
          type="submit"
          className="btn-primary-gradient"
          disabled={isSubmitting}
          style={{ marginTop: "var(--space-2)", position: "relative" }}
        >
          {isSubmitting ? (
            <span className="btn-spinner" />
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)" }}>
        Pas encore de compte ?{" "}
        <Link
          to={APP_ROUTES.register}
          style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}
        >
          Créer un compte
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
