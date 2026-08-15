import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useSearchParams } from "react-router-dom"
import { resetPasswordSchema } from "../../schemas/userSchema"
import * as authApi from "../../api/authApi"
import { APP_ROUTES } from "../../constants/routes"
import FormField from "../../components/forms/FormField"
import { PartyPopper, TriangleAlert } from "lucide-react"

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [globalError, setGlobalError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Pré-remplir l'email si présent dans l'URL (ex: depuis le lien reçu par mail)
  const defaultEmail = searchParams.get("email") || ""
  const defaultCode = searchParams.get("code") || ""

  const {
    register,
    handleSubmit,
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
      await authApi.resetPassword(data)
      setIsSuccess(true)
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate(APP_ROUTES.login)
      }, 3000)
    } catch (error) {
      setGlobalError(error.message || "Impossible de réinitialiser le mot de passe. Le code est peut-être invalide ou expiré.")
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
          Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
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
            disabled={isSubmitting || defaultEmail !== ""}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            {...register("confirmPassword")}
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
            "Enregistrer"
          )}
        </button>
      </form>
    </div>
  )
}

export default ResetPasswordPage
