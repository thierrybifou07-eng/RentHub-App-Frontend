function ErrorState({ message = "Une erreur est survenue.", onRetry }) {
  return (
    <div className="error-state text-center py-5">
      <div className="display-6 text-danger mb-3" aria-hidden="true">&#9888;</div>
      <h2 className="h5 fw-bold mb-2">Erreur</h2>
      <p className="text-secondary mb-3">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline-success btn-sm" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  )
}

export default ErrorState
