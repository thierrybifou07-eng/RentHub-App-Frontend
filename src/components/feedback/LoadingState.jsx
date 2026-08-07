function LoadingState({ message = "Chargement en cours..." }) {
  return (
    <div className="loading-state text-center py-5" role="status" aria-busy="true">
      <div className="spinner-border text-success mb-3" aria-hidden="true">
        <span className="visually-hidden">Chargement</span>
      </div>
      <p className="text-secondary mb-0">{message}</p>
    </div>
  )
}

export default LoadingState
