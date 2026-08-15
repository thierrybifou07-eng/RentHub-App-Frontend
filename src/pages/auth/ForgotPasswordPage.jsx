import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { forgotPasswordSchema } from "../../schemas/userSchema"
import * as authApi from "../../api/authApi"
import { APP_ROUTES } from "../../constants/routes"
import FormField from "../../components/forms/FormField"
import { MailCheck, TriangleAlert } from "lucide-react"

function ForgotPasswordPage() {
  const [globalError, setGlobalError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState("")
  const navigate = useNavigate()

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

  const goToResetPassword = (email) => {
    navigate(`${APP_ROUTES.resetPassword}?email=${encodeURIComponent(email)}`)
  }

  const onSubmit = async (data) => {
    setGlobalError(null)
    try {
      await authApi.forgotPassword(data.email)
      setEmailSent(data.email)
      setIsSuccess(true)
    } catch (error) {
      setGlobalError(error.message || "Une erreur est survenue lors de l'envoi du code.")
    }
  }

  const handleResend = async () => {
    setGlobalError(null)
    try {
      await authApi.forgotPassword(emailSent)
    } catch (error) {
      setGlobalError(error.message || "Une erreur est survenue lors de l'envoi du code.")
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center page-enter">
        <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)", display: "flex", justifyContent: "center" }}>
          <MailCheck size={48} />
        </div>
        <h2 style={{ marginBottom: "var(--space-3)" }}>Code envoyé !</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-3)" }}>
          Un code de vérification à 6 chiffres a été envoyé à l'adresse{" "}
          <strong style={{ color: "var(--color-text)" }}>{emailSent}</strong>.
        </p>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
          Il est valable 5 minutes. Saisissez-le à l'étape suivante pour définir un nouveau mot de passe.
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
            <TriangleAlert size={16} aria-hidden="true" /> {globalError}
          </div>
        )}

        <button
          type="button"
          className="btn-primary-gradient"
          style={{ width: "100%", marginBottom: "var(--space-3)", position: "relative" }}
          onClick={() => goToResetPassword(emailSent)}
        >
          Saisir le code reçu
        </button>

        <button
          type="button"
          className="btn-secondary-outline"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleResend}
        >
          Renvoyer le code
        </button>

        <p style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)" }}>
          <Link
            to={APP_ROUTES.login}
            style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <h2 style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>Mot de passe oublié</h2>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
        Entrez votre adresse e-mail et nous vous enverrons un code de vérification pour réinitialiser votre mot de passe.
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

        <button
          type="submit"
          className="btn-primary-gradient"
          disabled={isSubmitting}
          style={{ marginTop: "var(--space-2)", position: "relative" }}
        >
          {isSubmitting ? (
            <span className="btn-spinner" />
          ) : (
            "Envoyer le code"
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
