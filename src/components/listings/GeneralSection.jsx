import FormField from "../forms/FormField"
import SearchableSelect from "../common/SearchableSelect"

export default function GeneralSection({ form, setField, errors, cities, propertyTypes }) {
  const cityOptions = cities.map((c) => ({ value: c.id, label: c.name }))
  const typeOptions = propertyTypes.map((t) => ({ value: t.id, label: t.label }))

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
            <SearchableSelect
              id="listing-type"
              options={typeOptions}
              value={form.property_type_id}
              onChange={(v) => setField("property_type_id", v)}
              placeholder="Sélectionnez un type"
              emptyLabel="Sélectionnez un type"
              className={errors.property_type_id ? "is-invalid" : ""}
            />
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
            <SearchableSelect
              id="listing-city"
              options={cityOptions}
              value={form.city_id}
              onChange={(v) => setField("city_id", v)}
              placeholder="Sélectionnez une ville"
              emptyLabel="Sélectionnez une ville"
              className={errors.city_id ? "is-invalid" : ""}
            />
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
