import { useState } from "react"
import FormField from "../../components/forms/FormField"

const CONTACT_EMAIL = "contact@renthub.cm"

const CONTACT_INFO = [
  { title: "E-mail", value: CONTACT_EMAIL, detail: "Réponse sous 24h ouvrées" },
  { title: "Localisation", value: "Douala / Yaoundé", detail: "Cameroun" },
  { title: "Horaires", value: "Lun – Sam : 8h – 18h", detail: "Support et modération" },
]

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = "Veuillez indiquer votre nom."
    if (!form.email.trim()) nextErrors.email = "Veuillez indiquer votre e-mail."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Adresse e-mail invalide."
    if (!form.message.trim()) nextErrors.message = "Veuillez rédiger votre message."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const subject = encodeURIComponent(form.subject || `Demande via RentHub — ${form.name}`)
    const body = encodeURIComponent(
      `Nom : ${form.name}\nE-mail : ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="app-shell">
      {/* ── En-tête ─────────────────────────────────────────── */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold text-white">Contactez-nous</h1>
              <p className="lead text-white-75 mt-3 mb-0">
                Une question sur une annonce, votre compte ou notre plateforme ?
                Notre équipe vous répond rapidement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          {/* ── Coordonnées ──────────────────────────────────── */}
          <div className="col-lg-5">
            <h2 className="h4 fw-bold mb-4">Nos coordonnées</h2>
            <div className="d-flex flex-column gap-3">
              {CONTACT_INFO.map((info) => (
                <div key={info.title} className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <p className="fw-semibold mb-1" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                      {info.title}
                    </p>
                    <p className="fw-bold mb-1">{info.value}</p>
                    <p className="text-secondary mb-0" style={{ fontSize: "var(--text-xs)" }}>
                      {info.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Formulaire ───────────────────────────────────── */}
          <div className="col-lg-7">
            <div className="foundation-card card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h2 className="h4 fw-bold mb-1">Envoyez-nous un message</h2>
                <p className="text-secondary mb-4" style={{ fontSize: "var(--text-sm)" }}>
                  Ce formulaire ouvre votre client e-mail avec le message pré-rempli.
                </p>

                {sent && (
                  <div
                    style={{
                      marginBottom: "var(--space-4)",
                      padding: "var(--space-3)",
                      background: "var(--color-success-light)",
                      color: "var(--color-success-dark)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-sm)",
                    }}
                    role="status"
                  >
                    Votre client e-mail a été ouvert. Si rien ne s'est affiché, vérifiez votre boîte
                    d'envoi ou écrivez-nous directement à {CONTACT_EMAIL}.
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <FormField label="Votre nom" htmlFor="contact-name" error={errors.name} required>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          className="input-premium"
                          placeholder="Jean Dupont"
                          value={form.name}
                          onChange={handleChange}
                        />
                      </FormField>
                    </div>
                    <div className="col-md-6">
                      <FormField label="Votre e-mail" htmlFor="contact-email" error={errors.email} required>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          className="input-premium"
                          placeholder="jean.dupont@exemple.com"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </FormField>
                    </div>
                  </div>

                  <FormField label="Sujet" htmlFor="contact-subject" error={errors.subject}>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      className="input-premium"
                      placeholder="Question sur une annonce, problème de compte…"
                      value={form.subject}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Message" htmlFor="contact-message" error={errors.message} required>
                    <textarea
                      id="contact-message"
                      name="message"
                      className="input-premium"
                      rows={5}
                      placeholder="Décrivez votre demande…"
                      value={form.message}
                      onChange={handleChange}
                    />
                  </FormField>

                  <div>
                    <button type="submit" className="btn-primary-gradient">
                      Envoyer le message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
