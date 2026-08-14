import WizardStepper from "./WizardStepper"
import GeneralSection from "./GeneralSection"
import DetailsSection from "./DetailsSection"
import MediaSection from "./MediaSection"
import { WIZARD_STEPS } from "./listingFormShared"

export default function ListingWizardShell({
  title,
  subtitle,
  isEdit,
  statusBadge,
  form,
  setField,
  errors,
  cities,
  propertyTypes,
  wizardStep,
  handleWizardNext,
  handleWizardBack,
  existingMedia,
  onDeleteExisting,
  onMediaChange,
  submitting,
  onSubmit,
  onSubmitLabel,
  globalError,
  globalSuccess,
  onBackToList,
}) {
  const isLastStep = wizardStep === WIZARD_STEPS.length - 1

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-1">
        <h1 className="h3 mb-0">{title}</h1>
        {statusBadge}
      </div>
      <p className="text-secondary mb-4">{subtitle}</p>

      {globalError && (
        <div className="alert alert-danger small py-2" role="alert">
          {globalError}
        </div>
      )}

      {globalSuccess && (
        <div className="alert alert-warning small py-2" role="alert">
          {globalSuccess}
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-dark" onClick={onBackToList}>
              Retourner à mes annonces
            </button>
          </div>
        </div>
      )}

      <WizardStepper steps={WIZARD_STEPS} currentStep={wizardStep} />

      <form onSubmit={onSubmit} noValidate>
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
                onDeleteExisting={onDeleteExisting}
                onChange={onMediaChange}
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
              onClick={onBackToList}
              disabled={submitting}
            >
              Annuler
            </button>

            {!isLastStep ? (
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
                {submitting
                  ? (isEdit ? "Enregistrement..." : "Création en cours...")
                  : onSubmitLabel}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
