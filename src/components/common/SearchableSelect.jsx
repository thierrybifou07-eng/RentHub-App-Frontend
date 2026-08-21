import { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown, X } from "lucide-react"

export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Rechercher...",
  emptyLabel = "Tous",
  id,
  className = "",
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = useMemo(() => options.find((o) => String(o.value) === String(value)), [options, value])

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery("")
        setHighlight(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      setHighlight(-1)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  function selectOption(opt) {
    onChange(opt.value)
    setOpen(false)
    setQuery("")
    setHighlight(-1)
  }

  function clearSelection(e) {
    e.stopPropagation()
    onChange("")
    setQuery("")
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlight >= 0 && highlight < filtered.length) selectOption(filtered[highlight])
    } else if (e.key === "Escape") {
      setOpen(false)
      setQuery("")
      setHighlight(-1)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`position-relative ${className}`}
      style={{ minWidth: 0 }}
    >
      <button
        type="button"
        id={id}
        className="form-select text-start d-flex align-items-center justify-content-between"
        style={{ cursor: "pointer", minHeight: 38, paddingRight: "2rem" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`text-truncate ${selected ? "" : "text-secondary"}`}>
          {selected ? selected.label : emptyLabel}
        </span>
        <span className="position-absolute" style={{ right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}>
          {selected ? (
            <X
              size={14}
              className="text-muted"
              style={{ cursor: "pointer" }}
              onClick={clearSelection}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <ChevronDown size={16} className="text-muted" />
          )}
        </span>
      </button>

      {open && (
        <div
          className="position-absolute w-100 shadow-sm border rounded-bottom"
          style={{
            top: "100%",
            left: 0,
            zIndex: 1060,
            background: "var(--color-surface-100, #fff)",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          <div className="p-2 border-bottom">
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-sm"
              placeholder="Taper pour filtrer..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlight(-1) }}
              onKeyDown={handleKeyDown}
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <ul className="list-unstyled mb-0 py-1" style={{ margin: 0 }}>
            <li>
              <button
                type="button"
                className="dropdown-item text-secondary"
                style={{
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: !value ? 600 : 400,
                }}
                onClick={() => selectOption({ value: "", label: emptyLabel })}
              >
                {emptyLabel}
              </button>
            </li>
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-secondary" style={{ fontSize: "0.82rem" }}>
                Aucun résultat
              </li>
            )}
            {filtered.map((opt, idx) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className="dropdown-item text-truncate"
                  style={{
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    background: idx === highlight ? "var(--color-primary-50, #eef2ff)" : undefined,
                    fontWeight: String(value) === String(opt.value) ? 600 : 400,
                  }}
                  onClick={() => selectOption(opt)}
                  onMouseEnter={() => setHighlight(idx)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
