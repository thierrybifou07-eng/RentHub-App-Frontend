import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { verifyEmailSchema } from "../../schemas/userSchema"
import { useAuthStore } from "../../stores/authStore"
import * as authApi from "../../api/authApi"
import { APP_ROUTES } from "../../constants/routes"
import FormField from "../../components/forms/FormField"
import { CircleCheck, Info, TriangleAlert } from "lucide-react"

// S'assure qu'on ne lance l'auto-régénération qu'une seule fois par chargement
// de page, même si React remonte le composant (StrictMode en développement).
let autoRegenerateRan = false

function VerifyEmailPage() {
  const navigate = useNavigate()
  const { user, verifyEmail } = useAuthStore()
  
  const [globalError, setGlobalError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [codeExpired, setCodeExpired] = useState(false)
  const [autoInfo, setAutoInfo] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  })

  // À l'arrivée sur la page (ex: login avec e-mail non vérifié), on s'assure
  // qu'un code est disponible : s'il n'existe plus (expiré ou jamais reçu),
  // on en régénère un automatiquement.
  useEffect(() => {
    if (!user?.email || autoRegenerateRan) return
    autoRegenerateRan = true
    ;(async () => {
      try {
        await authApi.regenerateCode()
        setAutoInfo("Un code a été envoyé à votre adresse e-mail.")
      } catch (error) {
        // Code actuel encore valide : rien à faire, l'utilisateur saisit son code.
        if (!/still valid/i.test(error.message || "")) {
          setAutoInfo("Saisissez le code reçu par e-mail. Vous pourrez en demander un nouveau si besoin.")
        }
      }
    })()
  }, [user?.email])

  const onSubmit = async (data) => {
    setGlobalError(null)
    setSuccessMessage(null)
    try {
      // On utilise l'email du store s'il existe
      await verifyEmail(user?.email, data.code)
      setSuccessMessage("Votre adresse e-mail a été vérifiée avec succès. Redirection...")
      
      // Redirection vers le tableau de bord approprié selon le rôle
      setTimeout(() => {
        if (user?.role === "admin") navigate(APP_ROUTES.adminDashboard)
        else if (user?.role === "owner") navigate(APP_ROUTES.ownerDashboard)
        else navigate(APP_ROUTES.tenantDashboard || APP_ROUTES.home)
      }, 2000)
    } catch (error) {
      const expired =
        error.body?.error === "EMAIL_CODE_EXPIRED" ||
        error.body?.error === "Please regenerate a new code" ||
        /expired/i.test(error.message || "")
      if (expired) setCodeExpired(true)
      setGlobalError(error.message || "Le code de vérification est invalide ou a expiré.")
    }
  }

  const handleRegenerateCode = async () => {
    setGlobalError(null)
    setSuccessMessage(null)
    setIsRegenerating(true)
    try {
      await authApi.regenerateCode()
      setCodeExpired(false)
      reset({ code: "" })
      setSuccessMessage("Un nouveau code a été envoyé à votre adresse e-mail.")
    } catch (error) {
      setGlobalError(error.message || "Impossible de renvoyer le code. Veuillez réessayer plus tard.")
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="page-enter">
      <h2 style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>Vérification de l'e-mail</h2>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
        Un code à 6 chiffres a été envoyé à {user?.email ? <strong>{user.email}</strong> : "votre adresse"}. Veuillez le saisir ci-dessous.
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

      {successMessage && (
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
          <CircleCheck size={18} aria-hidden="true" /> {successMessage}
        </div>
      )}

      {autoInfo && (
        <div
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: "var(--color-info-light)",
            color: "var(--color-info-dark)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-sm)",
          }}
          role="status"
        >
          <Info size={18} aria-hidden="true" /> {autoInfo}
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
          label="Code de vérification"
          htmlFor="code"
          error={errors.code?.message}
          required
        >
          <input
            id="code"
            type="text"
            className="input-premium"
            placeholder="123456"
            maxLength={6}
            autoComplete="one-time-code"
            disabled={isSubmitting || isRegenerating || codeExpired}
            {...register("code")}
          />
        </FormField>

        {codeExpired ? (
          <button
            type="button"
            className="btn-primary-gradient"
            onClick={handleRegenerateCode}
            disabled={isRegenerating || isSubmitting}
            style={{ marginTop: "var(--space-2)", position: "relative" }}
          >
            {isRegenerating ? (
              <span className="btn-spinner" />
            ) : (
              "Regénérer le code"
            )}
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary-gradient"
            disabled={isSubmitting || isRegenerating}
            style={{ marginTop: "var(--space-2)", position: "relative" }}
          >
            {isSubmitting ? (
              <span className="btn-spinner" />
            ) : (
              "Vérifier mon e-mail"
            )}
          </button>
        )}
      </form>

      <div style={{ textAlign: "center", marginTop: "var(--space-6)" }}>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>
          Vous n'avez pas reçu le code ?
        </p>
        <button
          type="button"
          onClick={handleRegenerateCode}
          disabled={isRegenerating || isSubmitting}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-primary-600)",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isRegenerating ? "Envoi en cours..." : "Renvoyer le code"}
        </button>
      </div>
    </div>
  )
}

export default VerifyEmailPage
