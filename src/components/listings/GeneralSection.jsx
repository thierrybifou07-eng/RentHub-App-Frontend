import FormField from "../forms/FormField"

export default function GeneralSection({ form, setField, errors, cities, propertyTypes }) {
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
