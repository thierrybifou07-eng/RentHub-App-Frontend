import { Check } from "lucide-react"

export default function WizardStepper({ steps, currentStep }) {
  return (
    <div className="d-flex align-items-center justify-content-center mb-4 gap-0">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep
        const isDone = idx < currentStep
        const StepIcon = step.icon
        return (
          <div key={step.key} className="d-flex align-items-center">
            <div className="text-center" style={{ minWidth: 90 }}>
              <div
                className="d-flex align-items-center justify-content-center mx-auto rounded-circle"
                style={{
                  width: 44,
                  height: 44,
                  background: isDone
                    ? "var(--bs-success, #198754)"
                    : isActive
                    ? "var(--bs-primary, #0d6efd)"
                    : "#dee2e6",
                  color: isDone || isActive ? "#fff" : "#6c757d",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  transition: "all .3s ease",
                  boxShadow: isActive ? "0 0 0 4px rgba(13,110,253,.25)" : "none",
                }}
              >
                {isDone ? <Check size={20} /> : <StepIcon size={20} />}
              </div>
              <p
                className="mb-0 mt-1 small"
                style={{
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "var(--bs-primary)" : isDone ? "var(--bs-success)" : "#6c757d",
                }}
              >
                {step.label}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div
                style={{
                  width: 48,
                  height: 3,
                  borderRadius: 2,
                  background: idx < currentStep ? "var(--bs-success, #198754)" : "#dee2e6",
                  transition: "background .3s ease",
                  marginBottom: 20,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
