import { ChevronLeft, ChevronRight } from "lucide-react"

function Pagination({ page, totalPages, onPageChange, ariaLabel = "Pagination" }) {
  if (!totalPages || totalPages <= 1) return null

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) onPageChange(p)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => {
      if (totalPages <= 7) return true
      if (p === 1 || p === totalPages) return true
      return Math.abs(p - page) <= 2
    })
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p)
      acc.push(p)
      return acc
    }, [])

  return (
    <nav className="d-flex justify-content-center mt-4" aria-label={ariaLabel}>
      <ul className="pagination pagination-sm pagination-renthub mb-0">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            aria-label="Page précédente"
          >
            <ChevronLeft size={16} />
          </button>
        </li>
        {pages.map((p) => {
          if (typeof p === "string") {
            return (
              <li key={p} className="page-item disabled">
                <span className="page-link">…</span>
              </li>
            )
          }
          return (
            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
              <button className="page-link" onClick={() => goToPage(p)}>
                {p}
              </button>
            </li>
          )
        })}
        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Page suivante"
          >
            <ChevronRight size={16} />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
