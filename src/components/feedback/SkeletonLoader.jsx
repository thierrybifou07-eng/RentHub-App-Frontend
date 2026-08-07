function SkeletonLoader({ lines = 3, className = "" }) {
  return (
    <div className={`skeleton-loader ${className}`} aria-busy="true" aria-label="Chargement">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton-line mb-2" />
      ))}
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card border-0 shadow-sm skeleton-card" aria-busy="true" aria-label="Chargement">
      <div className="skeleton-image" />
      <div className="card-body">
        <SkeletonLoader lines={2} />
        <div className="skeleton-line short mt-2" />
      </div>
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

export function SkeletonPage({ title }) {
  return (
    <div className="container py-4" aria-busy="true" aria-label="Chargement de la page">
      {title && <h1 className="h3 mb-4">{title}</h1>}
      <div className="row g-4">
        <div className="col-md-4"><SkeletonCard /></div>
        <div className="col-md-4"><SkeletonCard /></div>
        <div className="col-md-4"><SkeletonCard /></div>
      </div>
      <span className="visually-hidden">Chargement en cours...</span>
    </div>
  )
}

export default SkeletonLoader
