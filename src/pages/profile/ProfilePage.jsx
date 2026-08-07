import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import { getMyMedia, uploadAvatar, deleteAvatar } from "../../api/mediaApi"
import { getCities } from "../../api/catalogApi"
import FormField from "../../components/forms/FormField"
import { APP_ROUTES } from "../../constants/routes"

function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const changePassword = useAuthStore((s) => s.changePassword)
  const deleteAccount = useAuthStore((s) => s.deleteAccount)
  const navigate = useNavigate()

  const [avatarUrl, setAvatarUrl] = useState(null)
  const [cities, setCities] = useState([])

  // State pour les formulaires
  const [profileForm, setProfileForm] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    phone: user?.phone || "",
    birth_date: user?.birth_date || "",
    gender: user?.gender || "",
    address: user?.address || "",
    city_id: user?.cityId || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const [deletePassword, setDeletePassword] = useState("")

  // États de chargement et erreurs
  const [loading, setLoading] = useState({
    avatar: true,
    profile: false,
    password: false,
    delete: false,
  })
  const [messages, setMessages] = useState({
    profile: null,
    password: null,
    delete: null,
    avatar: null,
  })

  useEffect(() => {
    let active = true
    Promise.all([getCities(), getMyMedia()])
      .then(([citiesData, mediaData]) => {
        if (!active) return
        setCities(citiesData)
        // mediaData might be an array of media, or an object. Let's assume it returns an array of media or an object containing the avatar.
        // If it's a list, find the one where type === "AVATAR" or similar.
        const avatarMedia = Array.isArray(mediaData) 
          ? mediaData.find(m => m.collection_name === "avatar")
          : mediaData?.avatar
        if (avatarMedia) {
          setAvatarUrl(avatarMedia.url || avatarMedia.original_url)
        }
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(p => ({ ...p, avatar: false }))
      })
    return () => { active = false }
  }, [])

  function setProfileField(field, value) {
    setProfileForm(p => ({ ...p, [field]: value }))
  }

  function setPasswordField(field, value) {
    setPasswordForm(p => ({ ...p, [field]: value }))
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(p => ({ ...p, avatar: true }))
    setMessages(p => ({ ...p, avatar: null }))
    try {
      await uploadAvatar(file)
      // Refetch media or just assume success and set a local preview
      const preview = URL.createObjectURL(file)
      setAvatarUrl(preview)
      setMessages(p => ({ ...p, avatar: { type: "success", text: "Avatar mis à jour." } }))
    } catch (err) {
      setMessages(p => ({ ...p, avatar: { type: "danger", text: err.message || "Erreur lors de l'upload de l'avatar." } }))
    } finally {
      setLoading(p => ({ ...p, avatar: false }))
    }
  }

  async function handleAvatarDelete() {
    if (!window.confirm("Supprimer votre avatar ?")) return
    setLoading(p => ({ ...p, avatar: true }))
    setMessages(p => ({ ...p, avatar: null }))
    try {
      await deleteAvatar()
      setAvatarUrl(null)
      setMessages(p => ({ ...p, avatar: { type: "success", text: "Avatar supprimé." } }))
    } catch (err) {
      setMessages(p => ({ ...p, avatar: { type: "danger", text: err.message || "Erreur lors de la suppression." } }))
    } finally {
      setLoading(p => ({ ...p, avatar: false }))
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setLoading(p => ({ ...p, profile: true }))
    setMessages(p => ({ ...p, profile: null }))
    try {
      await updateProfile(profileForm)
      setMessages(p => ({ ...p, profile: { type: "success", text: "Profil mis à jour avec succès." } }))
    } catch (err) {
      setMessages(p => ({ ...p, profile: { type: "danger", text: err.message || "Erreur lors de la mise à jour." } }))
    } finally {
      setLoading(p => ({ ...p, profile: false }))
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setLoading(p => ({ ...p, password: true }))
    setMessages(p => ({ ...p, password: null }))
    try {
      await changePassword(passwordForm)
      setMessages(p => ({ ...p, password: { type: "success", text: "Mot de passe modifié avec succès." } }))
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" })
    } catch (err) {
      setMessages(p => ({ ...p, password: { type: "danger", text: err.message || "Erreur lors du changement de mot de passe." } }))
    } finally {
      setLoading(p => ({ ...p, password: false }))
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault()
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")) return
    setLoading(p => ({ ...p, delete: true }))
    setMessages(p => ({ ...p, delete: null }))
    try {
      await deleteAccount(deletePassword)
      navigate(APP_ROUTES.home)
    } catch (err) {
      setMessages(p => ({ ...p, delete: { type: "danger", text: err.message || "Mot de passe incorrect ou erreur lors de la suppression." } }))
      setLoading(p => ({ ...p, delete: false }))
    }
  }

  return (
    <div className="page-enter pb-5">
      <h1 className="h3 fw-bold mb-4">Mon Profil</h1>
      
      <div className="row g-4">
        {/* Colonne gauche : Avatar et Infos */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center">
              <h5 className="card-title mb-4">Photo de profil</h5>
              
              <div className="mb-3 position-relative d-inline-block">
                {loading.avatar ? (
                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: "120px", height: "120px", margin: "0 auto" }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="rounded-circle object-fit-cover shadow-sm" style={{ width: "120px", height: "120px" }} />
                ) : (
                  <div className="rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center display-1 shadow-sm" style={{ width: "120px", height: "120px", margin: "0 auto" }}>
                    {user?.firstname?.charAt(0) || user?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>

              {messages.avatar && (
                <div className={`alert alert-${messages.avatar.type} small py-1 px-2 mb-3`}>
                  {messages.avatar.text}
                </div>
              )}

              <div className="d-flex flex-column gap-2 mt-3">
                <label className="btn btn-outline-primary btn-sm">
                  Modifier la photo
                  <input type="file" className="d-none" accept="image/*" onChange={handleAvatarUpload} disabled={loading.avatar} />
                </label>
                {avatarUrl && (
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleAvatarDelete} disabled={loading.avatar}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite : Formulaires */}
        <div className="col-md-8">
          
          {/* Informations personnelles */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2 mb-4">Informations personnelles</h5>
              
              {messages.profile && (
                <div className={`alert alert-${messages.profile.type} small py-2 mb-3`}>
                  {messages.profile.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <FormField label="Prénom" htmlFor="profile-firstname">
                      <input type="text" id="profile-firstname" className="form-control" value={profileForm.firstname} onChange={e => setProfileField("firstname", e.target.value)} />
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField label="Nom" htmlFor="profile-lastname">
                      <input type="text" id="profile-lastname" className="form-control" value={profileForm.lastname} onChange={e => setProfileField("lastname", e.target.value)} />
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField label="Téléphone" htmlFor="profile-phone">
                      <input type="tel" id="profile-phone" className="form-control" value={profileForm.phone} onChange={e => setProfileField("phone", e.target.value)} />
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField label="Date de naissance" htmlFor="profile-birthdate">
                      <input type="date" id="profile-birthdate" className="form-control" value={profileForm.birth_date} onChange={e => setProfileField("birth_date", e.target.value)} />
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField label="Genre" htmlFor="profile-gender">
                      <select id="profile-gender" className="form-select" value={profileForm.gender} onChange={e => setProfileField("gender", e.target.value)}>
                        <option value="">Sélectionnez...</option>
                        <option value="M">Homme</option>
                        <option value="F">Femme</option>
                      </select>
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField label="Ville" htmlFor="profile-city">
                      <select id="profile-city" className="form-select" value={profileForm.city_id} onChange={e => setProfileField("city_id", e.target.value)}>
                        <option value="">Sélectionnez une ville...</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </FormField>
                  </div>
                  <div className="col-12">
                    <FormField label="Adresse" htmlFor="profile-address">
                      <textarea id="profile-address" className="form-control" rows={2} value={profileForm.address} onChange={e => setProfileField("address", e.target.value)} />
                    </FormField>
                  </div>
                </div>
                <div className="mt-4 text-end">
                  <button type="submit" className="btn btn-primary" disabled={loading.profile}>
                    {loading.profile ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2 mb-4">Changer le mot de passe</h5>
              
              {messages.password && (
                <div className={`alert alert-${messages.password.type} small py-2 mb-3`}>
                  {messages.password.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <FormField label="Mot de passe actuel" htmlFor="pwd-current">
                      <input type="password" id="pwd-current" className="form-control" value={passwordForm.currentPassword} onChange={e => setPasswordField("currentPassword", e.target.value)} required />
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField label="Nouveau mot de passe" htmlFor="pwd-new">
                      <input type="password" id="pwd-new" className="form-control" value={passwordForm.newPassword} onChange={e => setPasswordField("newPassword", e.target.value)} required />
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField label="Confirmer le mot de passe" htmlFor="pwd-confirm">
                      <input type="password" id="pwd-confirm" className="form-control" value={passwordForm.confirmNewPassword} onChange={e => setPasswordField("confirmNewPassword", e.target.value)} required />
                    </FormField>
                  </div>
                </div>
                <div className="mt-4 text-end">
                  <button type="submit" className="btn btn-warning" disabled={loading.password}>
                    {loading.password ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Zone Danger */}
          <div className="card border-0 shadow-sm border-danger">
            <div className="card-body">
              <h5 className="card-title text-danger border-bottom border-danger pb-2 mb-4">Zone Danger</h5>
              <p className="small text-secondary">
                La suppression de votre compte est définitive. Toutes vos données, annonces et messages seront supprimés.
              </p>
              
              {messages.delete && (
                <div className={`alert alert-${messages.delete.type} small py-2 mb-3`}>
                  {messages.delete.text}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="d-flex align-items-end gap-3 mt-3">
                <div className="flex-grow-1">
                  <FormField label="Mot de passe pour confirmer" htmlFor="delete-pwd">
                    <input type="password" id="delete-pwd" className="form-control border-danger" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required placeholder="Entrez votre mot de passe..." />
                  </FormField>
                </div>
                <div>
                  <button type="submit" className="btn btn-danger" disabled={loading.delete || !deletePassword}>
                    {loading.delete ? "Suppression..." : "Supprimer mon compte"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage
