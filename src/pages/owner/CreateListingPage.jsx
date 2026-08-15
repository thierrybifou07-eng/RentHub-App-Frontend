import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { createListing } from "../../services/ownerService"
import { uploadAnnouncementVideos } from "../../api/mediaApi"
import useListingForm from "../../hooks/useListingForm"
import ListingWizardShell from "../../components/listings/ListingWizardShell"

function CreateListingPage() {
  const navigate = useNavigate()
  const {
    form,
    setField,
    errors,
    cities,
    propertyTypes,
    validate,
    validateStep,
  } = useListingForm()

  const [newMediaFiles, setNewMediaFiles] = useState({ images: [], videos: [] })
  const [wizardStep, setWizardStep] = useState(0)
  const [globalError, setGlobalError] = useState(null)
  const [globalSuccess, setGlobalSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleMediaChange = useCallback((files) => {
    setNewMediaFiles(files)
  }, [])

  // Construit un FormData multipart : champs de l'annonce + fichiers "media"
  function buildCreateFormData(payload, images) {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      formData.append(key, typeof value === "boolean" ? String(value) : value)
    })
    images.forEach((file) => formData.append("media", file))
    return formData
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (wizardStep !== 2) return
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
      // Les images sont envoyées AVEC l'annonce (requête multipart atomique)
      const requestPayload = images.length > 0
        ? buildCreateFormData(payload, images)
        : payload

      const savedListing = await createListing(requestPayload)
      const targetListingId = savedListing?.id || savedListing?.data?.id

      if (!targetListingId) {
        throw new Error("Impossible de récupérer l'annonce créée.")
      }

      // Les vidéos ne peuvent pas être envoyées avec la création : upload séparé
      if (videos.length > 0) {
        try {
          await uploadAnnouncementVideos(targetListingId, videos)
        } catch (vidErr) {
          console.error("Video upload failed", vidErr)
          setGlobalSuccess("L'annonce a bien été créée, mais certaines vidéos n'ont pas pu être uploadées.")
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
      setWizardStep((s) => Math.min(s + 1, 2))
    }
  }

  function handleWizardBack() {
    setWizardStep((s) => Math.max(s - 1, 0))
  }

  return (
    <ListingWizardShell
      title="Nouvelle annonce"
      subtitle="Suivez les étapes pour publier votre bien."
      isEdit={false}
      form={form}
      setField={setField}
      errors={errors}
      cities={cities}
      propertyTypes={propertyTypes}
      wizardStep={wizardStep}
      handleWizardNext={handleWizardNext}
      handleWizardBack={handleWizardBack}
      existingMedia={[]}
      onMediaChange={handleMediaChange}
      submitting={submitting}
      onSubmit={handleSubmit}
      onSubmitLabel="Créer l'annonce"
      globalError={globalError}
      globalSuccess={globalSuccess}
      onBackToList={() => navigate(APP_ROUTES.ownerListings)}
    />
  )
}

export default CreateListingPage
