import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getListingById } from "../../services/listingsService"
import { createListing, updateListing } from "../../services/ownerService"
import { useAuthStore } from "../../stores/authStore"
import { listingFormSchema } from "../../schemas/listingSchema"
import { getCities, getPropertyTypes } from "../../api/catalogApi"
import { uploadAnnouncementImages, uploadAnnouncementVideos, deleteMedia } from "../../api/mediaApi"
import FormField from "../forms/FormField"
import LoadingState from "../feedback/LoadingState"
import MediaUploader from "../media/MediaUploader"

const EMPTY_FORM = {
  title: "",
  property_type_id: "",
  price: "",
  city_id: "",
  surface_area: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  furnished: false,
  description: "",
}

const WIZARD_STEPS = [
  { key: "general", label: "Informations", icon: "📝" },
  { key: "details", label: "Caractéristiques", icon: "🏠" },
  { key: "media", label: "Médias", icon: "📷" },
]

/* ── Stepper visuel ─────────────────────────────────────────────── */

function WizardStepper({ steps, currentStep }) {
  return (
    <div className="d-flex align-items-center justify-content-center mb-4 gap-0">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep
        const isDone = idx < currentStep
        return (
          <div key={step.key} className="d-flex align-items-center">
            <div className="text-center" style={{ minWidth: 90 }}>
              <div
                className="d-flex align-items-center justify-content-center mx-auto rounded-circle"
                style={{
                  width: 44,
                  height: 44,
                  background: isDone
                    ? "var(--bs-success, #198754)"
                    : isActive
                    ? "var(--bs-primary, #0d6efd)"
                    : "#dee2e6",
                  color: isDone || isActive ? "#fff" : "#6c757d",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  transition: "all .3s ease",
                  boxShadow: isActive ? "0 0 0 4px rgba(13,110,253,.25)" : "none",
                }}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <p
                className="mb-0 mt-1 small"
                style={{
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "var(--bs-primary)" : isDone ? "var(--bs-success)" : "#6c757d",
                }}
              >
                {step.label}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div
                style={{
                  width: 48,
                  height: 3,
                  borderRadius: 2,
                  background: idx < currentStep ? "var(--bs-success, #198754)" : "#dee2e6",
                  transition: "background .3s ease",
                  marginBottom: 20,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Sections de formulaire ─────────────────────────────────────── */

function GeneralSection({ form, setField, errors, cities, propertyTypes }) {
  return (
    <>
      <FormField label="Titre de l'annonce" htmlFor="listing-title" error={errors.title}>
        <input
          type="text"
          id="listing-title"
          className={`form-control ${errors.title ? "is-invalid" : ""}`}
          placeholder="Ex: Studio meublé à Akwa"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          maxLength={255}
        />
      </FormField>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <FormField label="Type de bien" htmlFor="listing-type" error={errors.property_type_id}>
            <select
              id="listing-type"
              className={`form-select ${errors.property_type_id ? "is-invalid" : ""}`}
              value={form.property_type_id}
              onChange={(e) => setField("property_type_id", e.target.value)}
            >
              <option value="">Sélectionnez un type</option>
              {propertyTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="col-md-6">
          <FormField label="Prix mensuel (XAF)" htmlFor="listing-price" error={errors.price}>
            <input
              type="number"
              id="listing-price"
              className={`form-control ${errors.price ? "is-invalid" : ""}`}
              placeholder="Ex: 75000"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <FormField label="Ville" htmlFor="listing-city" error={errors.city_id}>
            <select
              id="listing-city"
              className={`form-select ${errors.city_id ? "is-invalid" : ""}`}
              value={form.city_id}
              onChange={(e) => setField("city_id", e.target.value)}
            >
              <option value="">Sélectionnez une ville</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="col-md-6">
          <FormField label="Surface (m²)" htmlFor="listing-surface" error={errors.surface_area}>
            <input
              type="number"
              id="listing-surface"
              className={`form-control ${errors.surface_area ? "is-invalid" : ""}`}
              placeholder="Ex: 45"
              min={1}
              value={form.surface_area}
              onChange={(e) => setField("surface_area", e.target.value)}
            />
          </FormField>
        </div>
      </div>
    </>
  )
}

function DetailsSection({ form, setField, errors }) {
  return (
    <>
      <div className="row g-3">
        <div className="col-md-4">
          <FormField label="Nombre total de pièces" htmlFor="listing-rooms" error={errors.rooms}>
            <input
              type="number"
              id="listing-rooms"
              className={`form-control ${errors.rooms ? "is-invalid" : ""}`}
              min={0}
              value={form.rooms}
              onChange={(e) => setField("rooms", e.target.value)}
            />
          </FormField>
        </div>
        <div className="col-md-4">
          <FormField label="Chambres à coucher" htmlFor="listing-bedrooms" error={errors.bedrooms}>
            <input
              type="number"
              id="listing-bedrooms"
              className={`form-control ${errors.bedrooms ? "is-invalid" : ""}`}
              min={0}
              value={form.bedrooms}
              onChange={(e) => setField("bedrooms", e.target.value)}
            />
          </FormField>
        </div>
        <div className="col-md-4">
          <FormField label="Salles de bain" htmlFor="listing-bathrooms" error={errors.bathrooms}>
            <input
              type="number"
              id="listing-bathrooms"
              className={`form-control ${errors.bathrooms ? "is-invalid" : ""}`}
              min={0}
              value={form.bathrooms}
              onChange={(e) => setField("bathrooms", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      <div className="form-check mt-3 mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="listing-furnished"
          checked={form.furnished}
          onChange={(e) => setField("furnished", e.target.checked)}
        />
        <label className="form-check-label" htmlFor="listing-furnished">
          Ce bien est meublé
        </label>
      </div>

      <FormField label="Description" htmlFor="listing-description" error={errors.description}>
        <textarea
          id="listing-description"
          className={`form-control ${errors.description ? "is-invalid" : ""}`}
          rows={5}
          placeholder="Décrivez votre bien en détail..."
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          maxLength={2000}
        />
      </FormField>
    </>
  )
}

function MediaSection({ existingMedia, onDeleteExisting, onChange }) {
  return (
    <MediaUploader
      existingMedia={existingMedia}
      onDeleteExisting={onDeleteExisting}
      onChange={onChange}
      maxImages={10}
      maxVideos={3}
    />
  )
}

/* ── Composant principal ────────────────────────────────────────── */

function ListingForm() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEdit = Boolean(listingId)

  const [form, setForm] = useState(EMPTY_FORM)

  // Nouveaux médias sélectionnés
  const [newMediaFiles, setNewMediaFiles] = useState({ images: [], videos: [] })

  // Médias existants (pour le mode édition)
  const [existingMedia, setExistingMedia] = useState([])

  const [cities, setCities] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])

  const [loadingListing, setLoadingListing] = useState(isEdit)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [globalSuccess, setGlobalSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Wizard state (création uniquement)
  const [wizardStep, setWizardStep] = useState(0)

  // Chargement du catalogue
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [citiesData, typesData] = await Promise.all([
          getCities(),
          getPropertyTypes(),
        ])
        setCities(citiesData)
        setPropertyTypes(typesData)
      } catch (err) {
        console.error("Failed to load catalog", err)
      }
    }
    loadCatalog()
  }, [])

  // Chargement de l'annonce si mode édition
  useEffect(() => {
    if (!isEdit) return
    let active = true
    getListingById(listingId).then((listing) => {
      if (!active) return
      if (!listing) {
        setGlobalError("Annonce introuvable.")
        setLoadingListing(false)
        return
      }
      setForm({
        title: listing.title || "",
        property_type_id: listing.property_type_id || listing.propertyType?.id || "",
        price: listing.price ? String(listing.price) : "",
        city_id: listing.city_id || listing.city?.id || "",
        surface_area: listing.surface_area ? String(listing.surface_area) : "",
        rooms: listing.rooms ? String(listing.rooms) : "",
        bedrooms: listing.bedrooms ? String(listing.bedrooms) : "",
        bathrooms: listing.bathrooms ? String(listing.bathrooms) : "",
        furnished: Boolean(listing.furnished),
        description: listing.description || "",
      })

      if (listing.media && Array.isArray(listing.media)) {
        setExistingMedia(listing.media)
      }

      setLoadingListing(false)
    }).catch(() => {
      if (active) {
        setGlobalError("Erreur lors du chargement de l'annonce.")
        setLoadingListing(false)
      }
    })
    return () => { active = false }
  }, [isEdit, listingId])

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const result = listingFormSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return null
    }
    setErrors({})
    return result.data
  }

  // Validation partielle pour le Wizard (étape par étape)
  function validateStep(step) {
    const result = listingFormSchema.safeParse(form)
    if (result.success) {
      setErrors({})
      return true
    }

    const stepFields = {
      0: ["title", "property_type_id", "price", "city_id", "surface_area"],
      1: ["rooms", "bedrooms", "bathrooms", "description"],
      2: [], // Pas de validation côté médias
    }

    const relevantFields = stepFields[step] || []
    const stepErrors = {}
    let hasError = false

    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (relevantFields.includes(key)) {
        if (!stepErrors[key]) stepErrors[key] = issue.message
        hasError = true
      }
    }

    setErrors(stepErrors)
    return !hasError
  }

  const handleDeleteExistingMedia = async (mediaId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) return

    try {
      await deleteMedia(mediaId)
      setExistingMedia(prev => prev.filter(m => m.id !== mediaId))
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la suppression du média.")
    }
  }

  // Stable callback pour MediaUploader
  const handleMediaChange = useCallback((files) => {
    setNewMediaFiles(files)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setGlobalError(null)
    setGlobalSuccess(null)
    const parsed = validate()
    if (!parsed) return

    setSubmitting(true)
    try {
      let payload = { ...parsed }
      // Nettoyer les champs vides pour le payload JSON
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === undefined) {
          delete payload[key]
        }
      })

      let savedListing
      if (isEdit) {
        savedListing = await updateListing(listingId, payload)
      } else {
        savedListing = await createListing(payload)
      }

      const targetListingId = isEdit ? listingId : savedListing?.id || savedListing?.data?.id

      if (targetListingId) {
        let mediaErrors = []

        // Upload des images
        if (newMediaFiles.images.length > 0) {
          try {
            await uploadAnnouncementImages(targetListingId, newMediaFiles.images)
          } catch (imgErr) {
            mediaErrors.push("images")
            console.error("Image upload failed", imgErr)
          }
        }

        // Upload des vidéos
        if (newMediaFiles.videos.length > 0) {
          try {
            await uploadAnnouncementVideos(targetListingId, newMediaFiles.videos)
          } catch (vidErr) {
            mediaErrors.push("vidéos")
            console.error("Video upload failed", vidErr)
          }
        }

        if (mediaErrors.length > 0) {
          setGlobalSuccess(`L'annonce a bien été enregistrée, mais certains médias (${mediaErrors.join(', ')}) n'ont pas pu être uploadés.`)
          setSubmitting(false)
          return
        }
      }

      navigate(APP_ROUTES.ownerListings, { replace: true })
    } catch (err) {
      setGlobalError(err.message || "Une erreur est survenue lors de l'enregistrement.")
      setSubmitting(false)
    }
  }

  function handleWizardNext() {
    if (validateStep(wizardStep)) {
      setWizardStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1))
    }
  }

  function handleWizardBack() {
    setWizardStep((s) => Math.max(s - 1, 0))
  }

  if (loadingListing) return (
    <div className="py-4">
      <LoadingState message="Chargement de l'annonce..." />
    </div>
  )

  /* ── Mode Création : Wizard ───────────────────────────────────── */
  if (!isEdit) {
    return (
      <div>
        <h1 className="h3 mb-1">Nouvelle annonce</h1>
        <p className="text-secondary mb-4">
          Suivez les étapes pour publier votre bien.
        </p>

        {globalError && (
          <div className="alert alert-danger small py-2" role="alert">
            {globalError}
          </div>
        )}

        {globalSuccess && (
          <div className="alert alert-warning small py-2" role="alert">
            {globalSuccess}
            <div className="mt-2">
              <button className="btn btn-sm btn-outline-dark" onClick={() => navigate(APP_ROUTES.ownerListings)}>
                Retourner à mes annonces
              </button>
            </div>
          </div>
        )}

        <WizardStepper steps={WIZARD_STEPS} currentStep={wizardStep} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3 border-bottom pb-2">
                {WIZARD_STEPS[wizardStep].icon} {WIZARD_STEPS[wizardStep].label}
              </h5>

              {wizardStep === 0 && (
                <GeneralSection
                  form={form}
                  setField={setField}
                  errors={errors}
                  cities={cities}
                  propertyTypes={propertyTypes}
                />
              )}

              {wizardStep === 1 && (
                <DetailsSection
                  form={form}
                  setField={setField}
                  errors={errors}
                />
              )}

              {wizardStep === 2 && (
                <MediaSection
                  existingMedia={existingMedia}
                  onDeleteExisting={handleDeleteExistingMedia}
                  onChange={handleMediaChange}
                />
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between gap-2 mt-4">
            <div>
              {wizardStep > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleWizardBack}
                  disabled={submitting}
                >
                  ← Retour
                </button>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(APP_ROUTES.ownerListings)}
                disabled={submitting}
              >
                Annuler
              </button>

              {wizardStep < WIZARD_STEPS.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleWizardNext}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? "Création en cours..." : "Créer l'annonce"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    )
  }

  /* ── Mode Édition : Formulaire classique ──────────────────────── */
  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-1">
        <h1 className="h3 mb-0">Modifier l'annonce</h1>
        <span className="badge bg-warning text-dark">Mode édition</span>
      </div>
      <p className="text-secondary mb-4">
        Modifiez les informations de votre bien. Les modifications seront soumises à une nouvelle modération.
      </p>

      {globalError && (
        <div className="alert alert-danger small py-2" role="alert">
          {globalError}
        </div>
      )}

      {globalSuccess && (
        <div className="alert alert-warning small py-2" role="alert">
          {globalSuccess}
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-dark" onClick={() => navigate(APP_ROUTES.ownerListings)}>
              Retourner à mes annonces
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3 border-bottom pb-2">Informations principales</h5>
            <GeneralSection
              form={form}
              setField={setField}
              errors={errors}
              cities={cities}
              propertyTypes={propertyTypes}
            />
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3 border-bottom pb-2">Pièces & Description</h5>
            <DetailsSection
              form={form}
              setField={setField}
              errors={errors}
            />
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <MediaSection
              existingMedia={existingMedia}
              onDeleteExisting={handleDeleteExistingMedia}
              onChange={handleMediaChange}
            />
          </div>
        </div>

        <div className="d-flex gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting}
          >
            {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(APP_ROUTES.ownerListings)}
            disabled={submitting}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default ListingForm
