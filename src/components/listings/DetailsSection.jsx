import FormField from "../forms/FormField"

export default function DetailsSection({ form, setField, errors }) {
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
