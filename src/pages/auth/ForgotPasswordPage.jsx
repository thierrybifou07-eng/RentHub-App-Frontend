import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { forgotPasswordSchema } from "../../schemas/userSchema"
import * as authApi from "../../api/authApi"
import { APP_ROUTES } from "../../constants/routes"
import FormField from "../../components/forms/FormField"

function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data) => {
    setGlobalError(null)
    try {
      await authApi.forgotPassword(data.email)
      setIsSuccess(true)
    } catch (error) {
      setGlobalError(error.message || "Une erreur est survenue lors de l'envoi de l'email.")
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center page-enter">
        <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>✅</div>
        <h2 style={{ marginBottom: "var(--space-3)" }}>Vérifiez votre boîte mail</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
          Si un compte est associé à cette adresse e-mail, nous vous avons envoyé un lien pour réinitialiser votre mot de passe.
        </p>
        <Link
          to={APP_ROUTES.login}
          className="btn-primary-gradient"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <h2 style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>Mot de passe oublié</h2>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
        Entrez votre adresse e-mail et nous vous enverrons les instructions pour réinitialiser votre mot de passe.
      </p>

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
          <span aria-hidden="true">⚠</span> {globalError}
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

        <button
          type="submit"
          className="btn-primary-gradient"
          disabled={isSubmitting}
          style={{ marginTop: "var(--space-2)", position: "relative" }}
        >
          {isSubmitting ? (
            <span className="btn-spinner" />
          ) : (
            "Envoyer le lien"
          )}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)" }}>
        Vous vous souvenez de votre mot de passe ?{" "}
        <Link
          to={APP_ROUTES.login}
          style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}

export default ForgotPasswordPage
