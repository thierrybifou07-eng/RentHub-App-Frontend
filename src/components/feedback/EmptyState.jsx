import { Link } from "react-router-dom"

function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state text-center py-5">
      <div className="display-6 text-secondary mb-3" aria-hidden="true">&#128196;</div>
      <h2 className="h5 fw-bold mb-2">{title}</h2>
      {description && <p className="text-secondary mb-3">{description}</p>}
      {action && (
        action.to ? (
          <Link to={action.to} className="btn btn-success btn-sm">
            {action.label}
          </Link>
        ) : (
          <button type="button" className="btn btn-success btn-sm" onClick={action.onClick}>
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

export default EmptyState
