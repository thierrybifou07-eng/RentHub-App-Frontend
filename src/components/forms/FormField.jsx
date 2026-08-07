function FormField({ label, htmlFor, error, children }) {
  return (
    <div className="form-field mb-3">
      {label && (
        <label htmlFor={htmlFor} className="form-label small fw-semibold">
          {label}
        </label>
      )}
      {children}
      {error && (
        <div className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default FormField
