import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { getListingById } from "../../services/listingsService"
import { updateListing, removeListing } from "../../services/ownerService"
import { uploadAnnouncementImages, uploadAnnouncementVideos, deleteMedia } from "../../api/mediaApi"
import { ANNOUNCEMENT_STATUS, getAnnouncementStatusLabel } from "../../constants/apiStatuses"
import useListingForm from "../../hooks/useListingForm"
import ListingWizardShell from "../../components/listings/ListingWizardShell"
import LoadingState from "../../components/feedback/LoadingState"
import ErrorState from "../../components/feedback/ErrorState"

function EditListingPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const {
    form,
    setForm,
    setField,
    errors,
    cities,
    propertyTypes,
    validate,
    validateStep,
  } = useListingForm()

  const [listing, setListing] = useState(null)
  const [existingMedia, setExistingMedia] = useState([])
  const [newMediaFiles, setNewMediaFiles] = useState({ images: [], videos: [] })
  const [wizardStep, setWizardStep] = useState(0)
  const [globalError, setGlobalError] = useState(null)
  const [globalSuccess, setGlobalSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingListing, setLoadingListing] = useState(true)
  const [blocked, setBlocked] = useState(null)

  useEffect(() => {
    let active = true
    getListingById(listingId).then((data) => {
      if (!active) return

      if (!data) {
        setGlobalError("Annonce introuvable.")
        setLoadingListing(false)
        return
      }

      // L'annonce doit appartenir à l'utilisateur connecté
      if (data.user_id && user?.id && Number(data.user_id) !== Number(user.id)) {
        setGlobalError("Vous n'êtes pas autorisé à modifier cette annonce.")
        setLoadingListing(false)
        return
      }

      // Seules les annonces en attente de revue peuvent être modifiées
      if (Number(data.status_id) !== ANNOUNCEMENT_STATUS.PENDING_REVIEW.id) {
        setListing(data)
        setBlocked({ statusId: data.status_id, title: data.title })
        setLoadingListing(false)
        return
      }

      setListing(data)
      setForm({
        title: data.title || "",
        property_type_id: data.property_type_id || data.propertyType?.id || "",
        price: data.price ? String(data.price) : "",
        city_id: data.city_id || data.city?.id || "",
        surface_area: data.surface_area ? String(data.surface_area) : "",
        rooms: data.rooms ? String(data.rooms) : "",
        bedrooms: data.bedrooms ? String(data.bedrooms) : "",
        bathrooms: data.bathrooms ? String(data.bathrooms) : "",
        furnished: Boolean(data.furnished),
        description: data.description || "",
      })

      if (data.media && Array.isArray(data.media)) {
        setExistingMedia(data.media)
      }

      setLoadingListing(false)
    }).catch((err) => {
      if (active) {
        setGlobalError(err.status === 404 ? "Annonce introuvable." : "Erreur lors du chargement de l'annonce.")
        setLoadingListing(false)
      }
    })
    return () => { active = false }
  }, [listingId, user?.id, setForm])

  const handleMediaChange = useCallback((files) => {
    setNewMediaFiles(files)
  }, [])

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

  async function handleSubmit(e) {
    e.preventDefault()
    setGlobalError(null)
    setGlobalSuccess(null)
    const parsed = validate()
    if (!parsed) return

    const payload = { ...parsed }
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) {
        delete payload[key]
      }
    })

    const images = newMediaFiles.images || []
    const videos = newMediaFiles.videos || []

    setSubmitting(true)
    try {
      // Édition : mise à jour JSON, puis upload des nouveaux médias
      await updateListing(listingId, payload)

      const mediaErrors = []
      if (images.length > 0) {
        try {
          await uploadAnnouncementImages(listingId, images)
        } catch (imgErr) {
          mediaErrors.push("images")
          console.error("Image upload failed", imgErr)
        }
      }
      if (videos.length > 0) {
        try {
          await uploadAnnouncementVideos(listingId, videos)
        } catch (vidErr) {
          mediaErrors.push("vidéos")
          console.error("Video upload failed", vidErr)
        }
      }

      if (mediaErrors.length > 0) {
        setGlobalSuccess(`Les informations ont bien été enregistrées, mais certains médias (${mediaErrors.join(', ')}) n'ont pas pu être uploadés.`)
        setSubmitting(false)
        return
      }

      navigate(APP_ROUTES.ownerListings, { replace: true })
    } catch (err) {
      setGlobalError(err.message || "Une erreur est survenue lors de l'enregistrement.")
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Supprimer l'annonce « ${blocked?.title || listing?.title || ''} » ? Cette action est irréversible.`)) return
    setSubmitting(true)
    try {
      await removeListing(listingId)
      navigate(APP_ROUTES.ownerListings, { replace: true })
    } catch (err) {
      setGlobalError(err.message || "Erreur lors de la suppression de l'annonce.")
      setSubmitting(false)
    }
  }

  function handleWizardNext() {
    if (validateStep(wizardStep)) {
      setWizardStep((s) => Math.min(s + 1, 2))
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

  if (globalError && !listing && !blocked) {
    return (
      <div className="py-4">
        <ErrorState message={globalError} />
        <div className="text-center mt-4">
          <button className="btn btn-outline-success btn-sm" onClick={() => navigate(APP_ROUTES.ownerListings)}>
            &larr; Retour à mes annonces
          </button>
        </div>
      </div>
    )
  }

  if (blocked) {
    return (
      <div>
        <div className="d-flex align-items-center gap-3 mb-1">
          <h1 className="h3 mb-0">Modifier l'annonce</h1>
        </div>
        <p className="text-secondary mb-4">Cette annonce n'est plus modifiable.</p>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="alert alert-danger mb-0" role="alert">
              <p className="mb-2 fw-semibold">
                Annonce « {blocked.title} » — statut : {getAnnouncementStatusLabel(blocked.statusId)}
              </p>
              <p className="mb-3 small">
                Seules les annonces en attente de revue peuvent être modifiées.
                Une annonce active, louée, archivée ou rejetée doit être supprimée ou resoumise.
              </p>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Supprimer l'annonce
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate(APP_ROUTES.ownerListings)}
                >
                  Retour à mes annonces
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = (
    <span className="badge bg-warning text-dark">Mode édition</span>
  )

  return (
    <ListingWizardShell
      title="Modifier l'annonce"
      subtitle="Modifiez les informations de votre bien en attente de validation."
      isEdit
      statusBadge={statusBadge}
      form={form}
      setField={setField}
      errors={errors}
      cities={cities}
      propertyTypes={propertyTypes}
      wizardStep={wizardStep}
      handleWizardNext={handleWizardNext}
      handleWizardBack={handleWizardBack}
      existingMedia={existingMedia}
      onDeleteExisting={handleDeleteExistingMedia}
      onMediaChange={handleMediaChange}
      submitting={submitting}
      onSubmit={handleSubmit}
      onSubmitLabel="Enregistrer les modifications"
      globalError={globalError}
      globalSuccess={globalSuccess}
      onBackToList={() => navigate(APP_ROUTES.ownerListings)}
    />
  )
}

export default EditListingPage
