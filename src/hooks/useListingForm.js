import { useState, useEffect } from "react"
import { listingFormSchema } from "../schemas/listingSchema"
import { getCities, getPropertyTypes } from "../api/catalogApi"
import { EMPTY_FORM, STEP_FIELDS } from "../components/listings/listingFormShared"

export default function useListingForm(initialForm = EMPTY_FORM) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [cities, setCities] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])

  useEffect(() => {
    let active = true
    async function loadCatalog() {
      try {
        const [citiesData, typesData] = await Promise.all([
          getCities(),
          getPropertyTypes(),
        ])
        if (active) {
          setCities(citiesData)
          setPropertyTypes(typesData)
        }
      } catch (err) {
        console.error("Failed to load catalog", err)
      }
    }
    loadCatalog()
    return () => { active = false }
  }, [])

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

  function validateStep(step) {
    const result = listingFormSchema.safeParse(form)
    if (result.success) {
      setErrors({})
      return true
    }

    const relevantFields = STEP_FIELDS[step] || []
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

  return {
    form,
    setForm,
    errors,
    setErrors,
    cities,
    propertyTypes,
    setField,
    validate,
    validateStep,
  }
}
