import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { resetPasswordSchema } from "../../schemas/userSchema"
import * as authApi from "../../api/authApi"
import { useAuthStore } from "../../stores/authStore"
import { APP_ROUTES } from "../../constants/routes"
import { USER_STATUS } from "../../constants/apiStatuses"
import FormField from "../../components/forms/FormField"
import { CircleCheck, PartyPopper, TriangleAlert } from "lucide-react"

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const [globalError, setGlobalError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [codeExpired, setCodeExpired] = useState(false)
  const [regenerated, setRegenerated] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const resetPasswordLogin = useAuthStore((s) => s.resetPasswordLogin)

  // Pré-remplir l'email si présent dans l'URL ou dans le state de navigation
  // (ex: redirigé depuis "Mot de passe oublié")
  const defaultEmail = searchParams.get("email") || state?.email || ""
  const defaultCode = searchParams.get("code") || ""

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: defaultEmail,
      code: defaultCode,
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data) => {
    setGlobalError(null)
    try {
      const response = await authApi.resetPassword(data)
      const user = await resetPasswordLogin(response)

      if (user.userStatus === USER_STATUS.PENDING_VERIFICATION.id || !user.emailVerified) {
        navigate(APP_ROUTES.verifyEmail, { replace: true })
        return
      }

      const dashRoute = APP_ROUTES[`${user.role}Dashboard`] || APP_ROUTES.home
      setIsSuccess(true)
      setTimeout(() => {
        navigate(dashRoute, { replace: true })
      }, 2000)
    } catch (error) {
      const expired = error.body?.error === "RESET_CODE_EXPIRED" || /expired/i.test(error.message || "")
      if (expired) setCodeExpired(true)
      setGlobalError(error.message || "Impossible de réinitialiser le mot de passe. Le code est peut-être invalide ou expiré.")
    }
  }

  const handleRegenerateCode = async () => {
    setGlobalError(null)
    setRegenerating(true)
    try {
      const email = getValues("email") || defaultEmail
      await authApi.forgotPassword(email)
      setCodeExpired(false)
      setRegenerated(true)
      reset({ email, code: "", password: "", confirmPassword: "" })
    } catch (error) {
      setGlobalError(error.message || "Impossible de renvoyer un nouveau code. Veuillez réessayer.")
    } finally {
      setRegenerating(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center page-enter">
        <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)", display: "flex", justifyContent: "center" }}>
          <PartyPopper size={48} />
        </div>
        <h2 style={{ marginBottom: "var(--space-3)" }}>Mot de passe modifié !</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
          Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers votre tableau de bord.
        </p>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <h2 style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>Nouveau mot de passe</h2>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
        Entrez le code à 6 chiffres reçu par e-mail et choisissez un nouveau mot de passe.
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

      {regenerated && (
        <div
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: "var(--color-success-light)",
            color: "var(--color-success-dark)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
          role="status"
        >
          <CircleCheck size={18} aria-hidden="true" /> Un nouveau code a été envoyé à votre adresse e-mail.
        </div>
      )}

      {codeExpired && (
        <div
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: "var(--color-danger-light)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
          role="status"
        >
          <TriangleAlert size={18} aria-hidden="true" /> Votre code a expiré. Générez un nouveau code pour continuer.
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
            disabled={isSubmitting || codeExpired || defaultEmail !== ""}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Code de vérification"
          htmlFor="code"
          error={errors.code?.message}
          hint="Code à 6 chiffres reçu par e-mail"
          required
        >
          <input
            id="code"
            type="text"
            className="input-premium"
            placeholder="123456"
            maxLength={6}
            autoComplete="one-time-code"
            disabled={isSubmitting || codeExpired}
            {...register("code")}
          />
        </FormField>

        <FormField
          label="Nouveau mot de passe"
          htmlFor="password"
          error={errors.password?.message}
          required
        >
          <input
            id="password"
            type="password"
            className="input-premium"
            placeholder="Min. 8 caractères, 1 maj, 1 chiffre, 1 spécial"
            autoComplete="new-password"
            disabled={isSubmitting || codeExpired}
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirmer le mot de passe"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <input
            id="confirmPassword"
            type="password"
            className="input-premium"
            placeholder="Répétez le nouveau mot de passe"
            autoComplete="new-password"
            disabled={isSubmitting || codeExpired}
            {...register("confirmPassword")}
          />
        </FormField>

        {codeExpired ? (
          <button
            type="button"
            className="btn-primary-gradient"
            onClick={handleRegenerateCode}
            disabled={regenerating}
            style={{ marginTop: "var(--space-2)", position: "relative" }}
          >
            {regenerating ? (
              <span className="btn-spinner" />
            ) : (
              "Regénérer le code"
            )}
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary-gradient"
            disabled={isSubmitting}
            style={{ marginTop: "var(--space-2)", position: "relative" }}
          >
            {isSubmitting ? (
              <span className="btn-spinner" />
            ) : (
              "Enregistrer"
            )}
          </button>
        )}
      </form>
    </div>
  )
}

export default ResetPasswordPage
