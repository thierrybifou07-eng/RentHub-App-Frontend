import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getListingById } from "../../services/listingsService"
import { createListing, updateListing } from "../../services/ownerService"
import { useAuthStore } from "../../stores/authStore"
import { listingFormSchema } from "../../schemas/listingSchema"
import { PROPERTY_TYPES, CAMEROON_CITIES } from "../../constants/listingOptions"
import FormField from "../forms/FormField"
import LoadingState from "../feedback/LoadingState"

const EMPTY_FORM = {
  title: "",
  type: "",
  price: "",
  city: "",
  neighborhood: "",
  rooms: "",
  description: "",
}

function ListingForm() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEdit = Boolean(listingId)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loadingListing, setLoadingListing] = useState(isEdit)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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
        title: listing.title,
        type: listing.type,
        price: String(listing.price),
        city: listing.city,
        neighborhood: listing.neighborhood || "",
        rooms: String(listing.rooms),
        description: listing.description,
      })
      setLoadingListing(false)
    })
    return () => { active = false }
  }, [isEdit, listingId])

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const parsed = {
      title: form.title,
      type: form.type,
      price: Number(form.price),
      city: form.city,
      neighborhood: form.neighborhood,
      rooms: Number(form.rooms),
      description: form.description,
    }
    const result = listingFormSchema.safeParse(parsed)
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
    return parsed
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGlobalError(null)
    const parsed = validate()
    if (!parsed) return

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateListing(listingId, parsed)
      } else {
        await createListing(parsed, user.id)
      }
      navigate(APP_ROUTES.ownerListings, { replace: true })
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingListing) return (
    <div className="py-4">
      <LoadingState message="Chargement de l'annonce..." />
    </div>
  )

  return (
    <div>
      <h1 className="h3 mb-1">
        {isEdit ? "Modifier l'annonce" : "Nouvelle annonce"}
      </h1>
      <p className="text-secondary mb-4">
        {isEdit
          ? "Modifiez les informations de votre bien."
          : "Remplissez les informations pour publier votre bien."}
      </p>

      {globalError && (
        <div className="alert alert-danger small py-2" role="alert">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <FormField label="Titre de l'annonce" htmlFor="listing-title" error={errors.title}>
              <input
                type="text"
                id="listing-title"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                placeholder="Ex: Studio meublé à Akwa"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                maxLength={100}
              />
            </FormField>

            <div className="row g-3">
              <div className="col-md-6">
                <FormField label="Type de bien" htmlFor="listing-type" error={errors.type}>
                  <select
                    id="listing-type"
                    className={`form-select ${errors.type ? "is-invalid" : ""}`}
                    value={form.type}
                    onChange={(e) => setField("type", e.target.value)}
                  >
                    <option value="">Sélectionnez un type</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
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
                    min={1}
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <FormField label="Ville" htmlFor="listing-city" error={errors.city}>
                  <select
                    id="listing-city"
                    className={`form-select ${errors.city ? "is-invalid" : ""}`}
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  >
                    <option value="">Sélectionnez une ville</option>
                    {CAMEROON_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="col-md-6">
                <FormField label="Quartier" htmlFor="listing-neighborhood" error={errors.neighborhood}>
                  <input
                    type="text"
                    id="listing-neighborhood"
                    className={`form-control ${errors.neighborhood ? "is-invalid" : ""}`}
                    placeholder="Ex: Akwa, Bastos..."
                    value={form.neighborhood}
                    onChange={(e) => setField("neighborhood", e.target.value)}
                    maxLength={50}
                  />
                </FormField>
              </div>
            </div>

            <FormField label="Nombre de chambres" htmlFor="listing-rooms" error={errors.rooms}>
              <input
                type="number"
                id="listing-rooms"
                className={`form-control ${errors.rooms ? "is-invalid" : ""}`}
                min={1}
                max={10}
                value={form.rooms}
                onChange={(e) => setField("rooms", e.target.value)}
              />
            </FormField>

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
          </div>
        </div>

        <div className="d-flex gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting}
          >
            {submitting
              ? (isEdit ? "Enregistrement..." : "Création...")
              : (isEdit ? "Enregistrer les modifications" : "Créer l'annonce")}
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
