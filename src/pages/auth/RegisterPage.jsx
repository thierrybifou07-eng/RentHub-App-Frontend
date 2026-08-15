import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { registerSchema } from "../../schemas/userSchema"
import { useAuthStore } from "../../stores/authStore"
import { APP_ROUTES } from "../../constants/routes"
import FormField from "../../components/forms/FormField"
import { TriangleAlert } from "lucide-react"

function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerApi } = useAuthStore()

  const [globalError, setGlobalError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      gender: "M",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data) => {
    setGlobalError(null)
    try {
      await registerApi(data)
      // On redirige vers la page de connexion, qui affichera un message de succès.
      // Une fois connectés, ils seront redirigés vers VerifyEmailPage s'ils sont PENDING_VERIFICATION.
      navigate(APP_ROUTES.login, { replace: true, state: { registered: true, email: data.email } })
    } catch (error) {
      setGlobalError(error.message || "Une erreur est survenue lors de l'inscription.")
    }
  }

  return (
    <div className="page-enter">
      <h2 style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>Inscription</h2>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
        Créez votre compte RentHub pour commencer.
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
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <FormField
            label="Prénom"
            htmlFor="firstname"
            error={errors.firstname?.message}
            required
          >
            <input
              id="firstname"
              type="text"
              className="input-premium"
              placeholder="Jean"
              autoComplete="given-name"
              disabled={isSubmitting}
              {...register("firstname")}
            />
          </FormField>

          <FormField
            label="Nom"
            htmlFor="lastname"
            error={errors.lastname?.message}
            required
          >
            <input
              id="lastname"
              type="text"
              className="input-premium"
              placeholder="Dupont"
              autoComplete="family-name"
              disabled={isSubmitting}
              {...register("lastname")}
            />
          </FormField>
        </div>

        <FormField
          label="Sexe"
          htmlFor="gender"
          error={errors.gender?.message}
        >
          <select
            id="gender"
            className="input-premium"
            disabled={isSubmitting}
            {...register("gender")}
          >
            <option value="M">Homme</option>
            <option value="F">Femme</option>
          </select>
        </FormField>

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

        <FormField
          label="Mot de passe"
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
            placeholder="Répétez votre mot de passe"
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
            "Créer mon compte"
          )}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "var(--space-6)", fontSize: "var(--text-sm)" }}>
        Déjà inscrit ?{" "}
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

export default RegisterPage
