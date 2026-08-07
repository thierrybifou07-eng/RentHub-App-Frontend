import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { getListingById } from "../../services/listingsService"
import { createListing, updateListing } from "../../services/ownerService"
import { useAuthStore } from "../../stores/authStore"
import { listingFormSchema } from "../../schemas/listingSchema"
import { getCities, getPropertyTypes } from "../../api/catalogApi"
import FormField from "../forms/FormField"
import LoadingState from "../feedback/LoadingState"

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

function ListingForm() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEdit = Boolean(listingId)

  const [form, setForm] = useState(EMPTY_FORM)
  const [mediaFiles, setMediaFiles] = useState([])
  
  const [cities, setCities] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  
  const [loadingListing, setLoadingListing] = useState(isEdit)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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

  function handleFileChange(e) {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files))
    }
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

  async function handleSubmit(e) {
    e.preventDefault()
    setGlobalError(null)
    const parsed = validate()
    if (!parsed) return

    setSubmitting(true)
    try {
      let payload
      
      // Si des fichiers sont présents, on utilise FormData
      if (mediaFiles.length > 0) {
        payload = new FormData()
        Object.entries(parsed).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            payload.append(key, value)
          }
        })
        mediaFiles.forEach((file) => {
          payload.append("media", file)
        })
      } else {
        payload = { ...parsed }
        // Nettoyer les champs vides pour le payload JSON
        Object.keys(payload).forEach((key) => {
          if (payload[key] === "" || payload[key] === undefined) {
            delete payload[key]
          }
        })
      }

      if (isEdit) {
        await updateListing(listingId, payload)
      } else {
        await createListing(payload)
      }
      navigate(APP_ROUTES.ownerListings, { replace: true })
    } catch (err) {
      setGlobalError(err.message || "Une erreur est survenue lors de l'enregistrement.")
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
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3 border-bottom pb-2">Informations principales</h5>
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

            <div className="row g-3">
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

            <div className="form-check mt-3 mb-2">
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
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3 border-bottom pb-2">Pièces & Description</h5>
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

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3 border-bottom pb-2">Médias</h5>
            <FormField label="Images (max 10)" htmlFor="listing-media">
              <input
                type="file"
                id="listing-media"
                className="form-control"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="form-text">
                Vous pouvez sélectionner plusieurs images (jpeg, png, webp, gif). Max 10 Mo par image.
              </div>
            </FormField>
            {mediaFiles.length > 0 && (
              <p className="small text-success mt-2 mb-0">
                {mediaFiles.length} fichier(s) sélectionné(s) prêt(s) à être envoyé(s).
              </p>
            )}
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
