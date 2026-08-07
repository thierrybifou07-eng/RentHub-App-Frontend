# RentHub — Documentation de l'API REST

**Version du document** : 1.0
**Généré à partir du code source** : analyse statique du dossier `backend/` (Node.js / Express 5 / Sequelize / MySQL)
**Base URL** : `http://localhost:{PORT}/api/v1` (le port est défini par la variable d'environnement `PORT`, aucune valeur par défaut n'est fixée dans le code)
**Format des échanges** : `application/json` (sauf le webhook Stripe, voir §7.8, qui reçoit du `application/json` brut non parsé)

## Sommaire

1. [Conventions générales](#1-conventions-générales)
2. [Authentification & autorisations](#2-authentification--autorisations)
3. [Limitation de débit (rate limiting)](#3-limitation-de-débit-rate-limiting)
4. [Upload de fichiers](#4-upload-de-fichiers)
5. [Référentiels de statuts](#5-référentiels-de-statuts)
6. [Table de référence rapide de tous les endpoints](#6-table-de-référence-rapide)
7. [Détail des endpoints par module](#7-détail-des-endpoints-par-module)
   - 7.1 [Catalogue](#71-catalogue-apiv1)
   - 7.2 [Authentification & compte](#72-authentification--compte-apiv1auth)
   - 7.3 [Annonces](#73-annonces-apiv1announcements)
   - 7.4 [Médias](#74-médias-apiv1media)
   - 7.5 [Favoris](#75-favoris-apiv1favorites)
   - 7.6 [Messagerie](#76-messagerie-apiv1conversations)
   - 7.7 [Signalements](#77-signalements-apiv1reports)
   - 7.8 [Abonnements & paiement Stripe](#78-abonnements--paiement-stripe-apiv1subscriptions)
   - 7.9 [Administration](#79-administration-apiv1admin)
8. [Variables d'environnement requises](#8-variables-denvironnement-requises)
9. [Points de vigilance relevés dans le code](#9-points-de-vigilance-relevés-dans-le-code)

---

## 1. Conventions générales

### 1.1 Enveloppe de réponse standard

La quasi-totalité des endpoints renvoient un JSON structuré ainsi (helpers `src/shared/helpers/response.helpers.js`) :

**Succès simple**
```json
{
  "status": "success",
  "message": "Resource retrieved successfully",
  "data": { }
}
```

**Succès paginé** (`paginated(...)`, utilisé par toutes les listes)
```json
{
  "status": "success",
  "message": "Announcements retrieved successfully",
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**Échec côté client (4xx)**
```json
{
  "status": "fail",
  "message": "Announcement not found"
}
```

**Échec de validation** (`validationFail`, peu utilisé directement — voir note ci-dessous)
```json
{
  "status": "fail",
  "message": "Validation error",
  "errors": []
}
```

**Erreur serveur (5xx)**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

> ⚠️ **Incohérence à connaître** : le middleware `validate()` (utilisé par la quasi-totalité des routes avec `Joi`) ne renvoie **pas** l'enveloppe standard ci-dessus en cas d'erreur de validation. Il renvoie directement :
> ```json
> { "message": "\"email\" must be a valid email" }
> ```
> avec un statut `400`, sans champ `status`. C'est différent du gestionnaire d'erreurs global (`errorHandler.js`) qui, lui, renvoie `{ success: false, message, error? }` (avec un booléen `success`, pas une chaîne `status`). Un consommateur de l'API (frontend) doit donc gérer **trois formats d'erreurs différents** selon l'origine de l'erreur :
> 1. Erreur Joi via `validate()` → `{ message }`
> 2. Erreur métier renvoyée par un contrôleur → `{ status: "fail"|"error", message }`
> 3. Erreur non interceptée remontée à `errorHandler` → `{ success: false, message, error? }`

### 1.2 Pagination

Les endpoints de liste acceptent en query string :

| Paramètre | Type | Défaut | Contraintes |
|---|---|---|---|
| `page` | integer | `1` | ≥ 1 |
| `limit` | integer | `20` | 1 à 100 |

La réponse inclut alors un objet `pagination: { page, limit, total, totalPages }`.

### 1.3 Codes HTTP utilisés

| Code | Usage |
|---|---|
| `200 OK` | Lecture ou mise à jour réussie |
| `201 Created` | Création réussie |
| `400 Bad Request` | Validation échouée / requête invalide / règle métier non respectée |
| `401 Unauthorized` | Authentification manquante ou invalide |
| `403 Forbidden` | Authentifié mais non autorisé (rôle, propriété de la ressource, compte inactif) |
| `404 Not Found` | Ressource introuvable |
| `409 Conflict` | Doublon (email, favori déjà existant, conversation déjà existante...) |
| `429 Too Many Requests` | Rate limiting déclenché, ou signalement répété sous 24h |
| `500 Internal Server Error` | Erreur non gérée |


---

## 2. Authentification & autorisations

### 2.1 Mécanisme

L'API utilise un schéma **JWT access token + refresh token opaque avec rotation**.

- **Access token** : JWT signé (`JWT_SECRET`), durée de vie définie par `JWT_EXPIRES_IN`. Envoyé dans l'en-tête :
  ```
  Authorization: Bearer <accessToken>
  ```
- **Refresh token** : chaîne opaque aléatoire, stockée hachée en base (`sessions`), renvoyée au client et utilisée sur `POST /auth/refresh` pour obtenir un nouveau couple de tokens. À chaque rafraîchissement, l'ancien refresh token est invalidé et remplacé (**rotation**) ; toute réutilisation d'un ancien refresh token déclenche la **destruction de toutes les sessions** de l'utilisateur (détection de vol de session).

### 2.2 Payload du token d'accès

```json
{
  "id": 14,
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean.dupont@mail.com",
  "phone": "+33612345678",
  "role": 4,
  "roleName": "ROLE_TENANT",
  "userStatus": 1,
  "emailVerifyAt": "2026-07-01T10:00:00.000Z",
  "cityId": 12
}
```

### 2.3 Rôles (`role_id`)

| id | Code | Libellé |
|---|---|---|
| 1 | `ROLE_USER` | Utilisateur générique |
| 2 | `ROLE_ADMIN` | Administrateur |
| 3 | `ROLE_ROOT` | Super administrateur |
| 4 | `ROLE_TENANT` | Locataire (rôle assigné par défaut à l'inscription) |
| 5 | `ROLE_OWNER` | Propriétaire |
| 6 | `ROLE_AGENCY` | Agence immobilière |

> Note : `POST /auth/register` assigne systématiquement `ROLE_TENANT` au nouvel utilisateur. Il n'existe, dans le code fourni, aucun endpoint public permettant de s'inscrire directement en tant que `ROLE_OWNER`. Le changement de rôle passe uniquement par `PATCH /admin/manage-user-role` (voir §7.9).

### 2.4 Statuts de compte (`user_status_id`)

| id | Code | Effet |
|---|---|---|
| 1 | `ACTIVE` | Compte pleinement opérationnel |
| 2 | `INACTIVE` | Bloque la connexion et le refresh |
| 3 | `SUSPENDED` | Bloque la connexion et le refresh |
| 4 | `PENDING_VERIFICATION` | Statut initial après inscription ; bloque le refresh tant que l'email n'est pas vérifié |

### 2.5 Middleware d'authentification

`authenticate` (`src/modules/auth/auth.middleware.js`) : extrait le Bearer token, le vérifie (`jwt.verify`), et peuple `req.user` avec le payload décodé. En cas d'absence ou d'invalidité → `401`.

`isAdmin` (`src/modules/admin/admin.middleware.js`) : exige `role === ROLE_ADMIN (2)` ou `role === ROLE_ROOT (3)` → sinon `403`.

`existence` : re-vérifie en base que l'utilisateur admin existe toujours et que son statut (issu du token) est `ACTIVE` → sinon `403`. Utilisé sur toutes les routes `/admin/*`.

`isOwner` (annonces) / `isAnnouncementOwner` (médias) : vérifie que `announcement.user_id === req.user.id` → sinon `403` ; sinon `404` si l'annonce n'existe pas.


---

## 3. Limitation de débit (rate limiting)

Trois limiteurs (`express-rate-limit`) sont appliqués **avant** le routeur applicatif, directement dans `server.js` :

| Route ciblée | Fenêtre | Max requêtes / IP | Message renvoyé si dépassé |
|---|---|---|---|
| `POST /api/v1/auth/login` | 60 s | 10 | "Too many login attempts, please try again later" |
| `POST /api/v1/auth/forgot-password` | 60 s | 10 | "Too many password reset requests, please try again later" |
| `POST /api/v1/auth/register` | 60 s | 10 | "Too many registration attempts, please try again later" |

En complément, la création de signalement (`POST /reports`) applique une règle métier applicative (pas un rate limiter générique) : un même utilisateur ne peut signaler la même annonce qu'une fois par tranche de 24h (→ `429`).

---

## 4. Upload de fichiers

Les uploads sont gérés par `multer` avec un stockage disque configuré dynamiquement par type de média (`config/media/upload.js`), à partir de la table `media_types` (seed `media-type.seeder.js`). Les fichiers sont enregistrés sous `public/uploads/{CODE_TYPE}/{sous-dossier}/` et exposés statiquement via `GET /uploads/...` (monté sur `server.js`, **hors** préfixe `/api/v1`).

| Code type média | Utilisé par | Extensions autorisées | Types MIME autorisés | Taille max / fichier | Nb max fichiers |
|---|---|---|---|---|---|
| `USER_AVATAR` | `POST /media/avatar` | jpg, jpeg, png, webp | image/jpeg, image/png, image/webp | 5 Mo | 1 |
| `ANNOUNCEMENT_IMAGE` | `POST /media/announcements/:id/images`, `POST /announcements` (champ `media`) | jpg, jpeg, png, webp, gif | image/jpeg, image/png, image/webp, image/gif | 10 Mo | 10 |
| `ANNOUNCEMENT_VIDEO` | `POST /media/announcements/:id/videos` | mp4, webm, mov | video/mp4, video/webm, video/quicktime | 100 Mo | 3 |

Un fichier dont l'extension **ou** le type MIME ne correspond pas à la liste autorisée est rejeté avec `400` et un message `Invalid file type. Allowed: ...`.

Le champ de formulaire (`multipart/form-data`) attendu diffère selon l'endpoint :

| Endpoint | Nom du champ |
|---|---|
| `POST /media/avatar` | `avatar` (fichier unique) |
| `POST /media/announcements/:id/images` | `images` (tableau, max 10) |
| `POST /media/announcements/:id/videos` | `videos` (tableau, max 3) |
| `POST /announcements` | `media` (tableau, max 10 — images uniquement) |


---

## 5. Référentiels de statuts

### 5.1 Statut d'annonce (`announcement_status_id`)

| id | Code | Libellé | Visible publiquement (`GET /announcements`) |
|---|---|---|---|
| 1 | `ACTIVE` | Active | ✅ Oui |
| 2 | `PENDING_REVIEW` | En attente de validation | ❌ Non |
| 3 | `RENTED` | Louée | ❌ Non |
| 4 | `ARCHIVED` | Archivée | ❌ Non |
| 5 | `REJECTED` | Rejetée | ❌ Non |

Cycle de vie :
```
création ──────► PENDING_REVIEW ──approve──► ACTIVE ──archive──► ARCHIVED ──resubmit──► PENDING_REVIEW
                       │                        │
                     reject                  (édition d'une annonce ACTIVE
                       │                       la repasse automatiquement
                       ▼                       en PENDING_REVIEW)
                   REJECTED ──resubmit──► PENDING_REVIEW
```
Une annonce `REJECTED` ne peut pas être modifiée via `PUT /announcements/:id` (→ `400`), elle doit d'abord être resoumise (`PATCH /:id/resubmit`).

### 5.2 Statut de signalement (`report_status_id`)

| id | Code | Libellé |
|---|---|---|
| 1 | `PENDING` | En attente |
| 2 | `REVIEWED` | Examiné |
| 3 | `DISMISSED` | Rejeté (classé sans suite) |
| 4 | `ACTION_TAKEN` | Action prise (l'annonce liée passe automatiquement à `REJECTED`) |

### 5.3 Statut d'abonnement (`user_subscriptions.status`, chaîne libre)

| Valeur | Signification |
|---|---|
| `PENDING` | Demande soumise (paiement hors-ligne / référence manuelle), en attente de validation admin |
| `WAITING_PAYMENT` | Un `PaymentIntent` Stripe a été créé, en attente de confirmation de paiement |
| `ACTIVE` | Abonnement actif (dates `start_date` / `end_date` renseignées) |
| `REJECTED` | Demande refusée par un administrateur |
| `FAILED` | Paiement Stripe échoué (mis à jour par le webhook) |
| `EXPIRED` | Valeur acceptée par le filtre admin (`subscriptionFilterSchema`) mais aucune transition automatique vers cet état n'est implémentée dans le code fourni — l'expiration doit être gérée par un job externe non présent dans le projet |

### 5.4 Types de bien (`property_type_id`)

| id (ordre de seed) | Code | Libellé |
|---|---|---|
| 1 | `APARTMENT` | Appartement |
| 2 | `HOUSE` | Maison |
| 3 | `STUDIO` | Studio |
| 4 | `COMMERCIAL` | Local commercial |

> Ces types sont exposés dynamiquement via `GET /property-types` — préférer cet endpoint à une valeur codée en dur côté frontend.


---

## 6. Table de référence rapide

Légende colonne **Auth** : 🌐 = public · 🔑 = authentifié · 👮 = admin/root uniquement · 🏠 = propriétaire de la ressource

### Catalogue — `/api/v1`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/cities` | 🌐 | Liste des villes |
| GET | `/property-types` | 🌐 | Liste des types de bien |

### Authentification & compte — `/api/v1/auth`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | 🌐 | Créer un compte (rôle `TENANT` par défaut) |
| POST | `/login` | 🌐 | Connexion |
| POST | `/refresh` | 🌐 | Rafraîchir le token d'accès |
| POST | `/logout` | 🌐 | Déconnexion (invalide un refresh token) |
| POST | `/logout-all` | 🔑 | Déconnexion de tous les appareils |
| POST | `/forgot-password` | 🌐 | Demander un code de réinitialisation |
| POST | `/reset-password` | 🌐 | Réinitialiser le mot de passe via code OTP |
| POST | `/verify-email` | 🔑 | Vérifier l'email via code OTP |
| POST | `/regenerate-code` | 🔑 | Régénérer un code de vérification d'email |
| GET | `/me` | 🔑 | Récupérer le profil courant |
| PATCH | `/me` | 🔑 | Modifier le profil courant |
| PATCH | `/me/password` | 🔑 | Changer le mot de passe |
| DELETE | `/me` | 🔑 | Supprimer (soft delete) son compte |

### Annonces — `/api/v1/announcements`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | 🌐 | Liste publique des annonces `ACTIVE` (filtres, tri, pagination) |
| GET | `/me` | 🔑 | Mes annonces (tous statuts) |
| GET | `/admin/pending` | 👮 | File d'attente de modération |
| PUT | `/admin/:id/approve` | 👮 | Approuver une annonce en attente |
| PUT | `/admin/:id/reject` | 👮 | Rejeter une annonce en attente |
| GET | `/:id` | 🌐* | Détail d'une annonce (*le propriétaire authentifié voit son annonce quel que soit son statut) |
| POST | `/` | 🔑 | Créer une annonce (+ upload d'images optionnel) |
| PUT | `/:id` | 🏠 | Modifier une annonce |
| DELETE | `/:id` | 🏠 | Supprimer (soft delete) une annonce |
| PATCH | `/:id/archive` | 🏠 | Archiver une annonce `ACTIVE`/`RENTED` |
| PATCH | `/:id/resubmit` | 🏠 | Resoumettre une annonce `ARCHIVED`/`REJECTED` |

### Médias — `/api/v1/media`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔑 | Mes médias (avatar, etc.) |
| POST | `/avatar` | 🔑 | Uploader/remplacer sa photo de profil |
| DELETE | `/avatar` | 🔑 | Supprimer sa photo de profil |
| POST | `/announcements/:id/images` | 🏠 | Ajouter des images à une annonce |
| POST | `/announcements/:id/videos` | 🏠 | Ajouter des vidéos à une annonce |
| DELETE | `/:id` | 🔑* | Supprimer un média (*propriétaire du média ou admin) |

### Favoris — `/api/v1/favorites`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔑 | Mes favoris |
| POST | `/:id` | 🔑 | Ajouter une annonce aux favoris |
| DELETE | `/:id` | 🔑 | Retirer une annonce des favoris |

### Messagerie — `/api/v1/conversations`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔑 (`TENANT`) | Démarrer une conversation sur une annonce |
| GET | `/` | 🔑 | Mes conversations |
| GET | `/unread-count` | 🔑 | Nombre de messages non lus (toutes conversations) |
| GET | `/:id/messages` | 🔑* | Messages d'une conversation (*participant uniquement) — marque les messages reçus comme lus |
| POST | `/:id/messages` | 🔑* | Envoyer un message (*participant uniquement) |

### Signalements — `/api/v1/reports`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔑 | Signaler une annonce |
| GET | `/admin` | 👮 | Liste des signalements (filtrable par statut) |
| GET | `/admin/:id` | 👮 | Détail d'un signalement |
| PATCH | `/admin/:id/review` | 👮 | Marquer comme examiné |
| PATCH | `/admin/:id/dismiss` | 👮 | Classer sans suite |
| PATCH | `/admin/:id/take-action` | 👮 | Agir (rejette l'annonce concernée) |

### Abonnements & Stripe — `/api/v1/subscriptions`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/plans` | 🌐 | Liste des plans d'abonnement |
| POST | `/subscribe` | 🔑 (`OWNER`/`AGENCY`) | Demande d'abonnement (paiement manuel/référence) |
| GET | `/me` | 🔑 | Mon abonnement courant (le plus récent) |
| GET | `/history` | 🔑 | Historique de mes abonnements |
| GET | `/admin` | 👮 | Liste de tous les abonnements (filtrable) |
| GET | `/admin/:id` | 👮 | Détail d'un abonnement |
| PATCH | `/admin/:id/activate` | 👮 | Activer un abonnement `PENDING` |
| PATCH | `/admin/:id/reject` | 👮 | Rejeter un abonnement `PENDING` |
| POST | `/create-payment-intent` | 🔑 (`OWNER`/`AGENCY`) | Créer un `PaymentIntent` Stripe |
| POST | `/confirm-payment` | 🔑 | Confirmer un paiement Stripe côté client |
| POST | `/api/v1/stripe/webhook` *(hors préfixe subscriptions, monté à la racine)* | 🌐 (signature Stripe) | Webhook Stripe (`payment_intent.succeeded` / `.payment_failed`) |

### Administration — `/api/v1/admin`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/stats` | 👮 | Statistiques globales de la plateforme |
| GET | `/stats/evolution` | 👮 | Évolution utilisateurs/annonces sur 30 jours |
| GET | `/pending-counts` | 👮 | Compteurs d'éléments en attente (annonces, signalements, abonnements) |
| GET | `/recent-activity` | 👮 | Activité récente (10 derniers éléments en attente par type) |
| PATCH | `/manage-announcements-status/:id` | 👮 | Changer le statut d'une annonce |
| PATCH | `/manage-user-status` | 👮 | Changer le statut d'un utilisateur |
| PATCH | `/manage-user-role` | 👮 | Changer le rôle d'un utilisateur |
| PATCH | `/verify-user/:id` | 👮 | Vérifier manuellement un compte utilisateur |
| GET | `/users` | 👮 | Liste des utilisateurs (recherche, filtres, pagination) |
| GET | `/users/:id` | 👮 | Détail d'un utilisateur |


---

## 7. Détail des endpoints par module

### 7.1 Catalogue — `/api/v1`

#### `GET /cities`
Liste toutes les villes, triées par nom.
- **Auth** : aucune
- **Réponse `200`**
```json
{
  "status": "success",
  "message": "Cities retrieved successfully",
  "data": [
    { "id": 1, "name": "Paris" },
    { "id": 2, "name": "Lyon" }
  ]
}
```

#### `GET /property-types`
Liste tous les types de bien, triés par libellé.
- **Auth** : aucune
- **Réponse `200`**
```json
{
  "status": "success",
  "message": "Property types retrieved successfully",
  "data": [
    { "id": 1, "code": "APARTMENT", "label": "Appartement" }
  ]
}
```


### 7.2 Authentification & compte — `/api/v1/auth`

#### `POST /auth/register`
Crée un compte (rôle `TENANT` assigné automatiquement, statut `PENDING_VERIFICATION`) et envoie un email avec un code de vérification (OTP, 6 chiffres, valable 5 minutes).
- **Auth** : aucune · **Rate limit** : `registerLimiter`
- **Body**

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `firstname` | string | ✅ | min 3 caractères |
| `lastname` | string | ✅ | min 3 caractères |
| `email` | string | ✅ | format email, unique |
| `phone` | string | ❌ | 10 à 20 caractères, unique |
| `gender` | string | ❌ | `M` ou `F` |
| `password` | string | ✅ | min 8 car., 1 minuscule, 1 majuscule, 1 chiffre, 1 spécial (`@$!%*?&`), pas plus de 3 répétitions consécutives du même caractère |
| `confirmPassword` | string | ✅ | doit être identique à `password` |

- **Réponses**
  - `201` → `{ "status": "success", "message": "Your account has been successfully created...", "emailSent": true }`
  - `409` → email ou téléphone déjà utilisé
  - `400` → validation Joi échouée

#### `POST /auth/login`
- **Auth** : aucune · **Rate limit** : `loginLimiter`
- **Body** : `{ "email": string, "password": string }`
- **Réponses**
  - `200` →
    ```json
    {
      "status": "success",
      "message": "Login successful",
      "data": {
        "token": "eyJ...",
        "refreshToken": "a1b2c3...",
        "user": { "id": 14, "firstname": "...", "lastname": "...", "email": "...", "phone": null, "role_id": 4, "user_status_id": 1, "email_verified_at": null, "city_id": null }
      }
    }
    ```
  - `400` → identifiants invalides
  - `403` → compte `SUSPENDED` ou `INACTIVE`

#### `POST /auth/refresh`
Rotation du refresh token. Détecte le rejeu d'un token déjà consommé (vol de session) et révoque alors **toutes** les sessions de l'utilisateur.
- **Auth** : aucune (le refresh token en tient lieu)
- **Body** : `{ "refreshToken": string }`
- **Réponses**
  - `200` → `{ "status": "success", "message": "Token refreshed", "data": { "token": "...", "refreshToken": "..." } }`
  - `401` → token manquant / invalide / expiré / session compromise
  - `403` → compte non `ACTIVE`

#### `POST /auth/logout`
- **Auth** : aucune (accepte un `refreshToken` optionnel dans le body pour invalider la session correspondante)
- **Body** : `{ "refreshToken": string }`
- **Réponse `200`** → `{ "status": "success", "message": "Logged out successfully" }`

#### `POST /auth/logout-all`
Révoque toutes les sessions actives de l'utilisateur connecté.
- **Auth** : 🔑
- **Réponse `200`** → `{ "status": "success", "message": "Logged out from all devices" }`

#### `POST /auth/forgot-password`
- **Auth** : aucune · **Rate limit** : `forgotPasswordLimiter`
- **Body** : `{ "email": string }`
- **Comportement** : renvoie toujours `200` (pour ne pas confirmer l'existence d'un email), sauf si le compte est suspendu/inactif (`401`) ou si un code encore valide existe déjà (`400 Conflict` : "The last code is still valid").
- **Réponse `200`** → `{ "status": "success", "message": "If this email is registered, you will receive a code", "data": { "emailSent": true } }`

#### `POST /auth/reset-password`
- **Auth** : aucune
- **Body**

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `email` | string | ✅ | format email |
| `code` | string | ✅ | 6 chiffres |
| `password` | string | ✅ | même règle de complexité que l'inscription |
| `confirmPassword` | string | ✅ | identique à `password` |

- **Réponses** : `201` succès · `404` utilisateur introuvable · `400` code absent/invalide/expiré

#### `POST /auth/verify-email`
Valide le code OTP reçu par email et fait passer le compte en `ACTIVE`. **Renvoie un nouveau token d'accès** (le payload `emailVerifyAt` change).
- **Auth** : 🔑 (le token doit correspondre au compte à vérifier)
- **Body** : `{ "email": string, "code": string(6) }`
- **Réponses**
  - `200` → `{ "status": "success", "message": "Your Email has been successfully verified", "token": "eyJ...", "emailSent": true }`
  - `400` → déjà vérifié / code invalide / code expiré
  - `403` → le token ne correspond pas au compte ciblé
  - `404` → utilisateur ou code introuvable (avec `error: "Please regenerate a new code"`)

#### `POST /auth/regenerate-code`
Régénère un code de vérification d'email si aucun n'existe ou si le précédent est expiré.
- **Auth** : 🔑
- **Réponses** : `200` succès (`{ emailSent }`) · `400` email déjà vérifié / code encore valide

#### `GET /auth/me`
- **Auth** : 🔑
- **Réponse `200`** → utilisateur courant (sans mot de passe)

#### `PATCH /auth/me`
Met à jour le profil de l'utilisateur connecté.
- **Auth** : 🔑
- **Body** (tous les champs optionnels)

| Champ | Type | Contraintes |
|---|---|---|
| `firstname` | string | 3 à 150 caractères |
| `lastname` | string | 3 à 150 caractères |
| `phone` | string \| null | 10 à 20 caractères, unique |
| `birth_date` | date ISO \| null | |
| `gender` | string \| null | `M` ou `F` |
| `address` | string \| null | max 255 caractères |
| `city_id` | integer \| null | |

- **Réponses** : `200` succès · `409` téléphone déjà utilisé · `404` utilisateur introuvable

#### `PATCH /auth/me/password`
- **Auth** : 🔑
- **Body** : `{ "currentPassword": string, "newPassword": string, "confirmNewPassword": string }` (`newPassword` suit la même règle de complexité)
- **Réponses** : `200` succès · `401` mot de passe actuel invalide

#### `DELETE /auth/me`
Suppression douce (soft delete, `paranoid: true`) du compte + révocation de toutes les sessions.
- **Auth** : 🔑
- **Body** : `{ "password": string }`
- **Réponses** : `200` succès · `401` mot de passe invalide


### 7.3 Annonces — `/api/v1/announcements`

Chaque annonce renvoyée inclut par défaut : `City`, `PropertyType`, `Media` (avec `MediaType`), et un champ calculé `favoritesCount`.

#### `GET /announcements`
Liste publique — ne montre que les annonces au statut `ACTIVE`. Le tri met en avant les annonces des propriétaires ayant un abonnement actif (`priority` du plan), puis applique le tri demandé.
- **Auth** : aucune
- **Query params**

| Paramètre | Type | Contraintes |
|---|---|---|
| `minPrice` / `maxPrice` | number | positif |
| `property_type_id` | integer | |
| `city_id` | integer | |
| `furnished` | boolean | |
| `minRooms` / `maxRooms` | integer | ≥ 0 |
| `search` | string | max 255 — recherche sur le titre (`LIKE %search%`) |
| `sort` | string | `price_asc` \| `price_desc` \| `newest` (défaut) \| `oldest` |
| `page` / `limit` | integer | défauts 1 / 20, max `limit` 100 |

- **Réponse `200`** : liste paginée (voir §1.1)

#### `GET /announcements/me`
Mes annonces, tous statuts confondus.
- **Auth** : 🔑
- **Query params** : `page`, `limit`, `status_id` (optionnel, filtre par statut)

#### `GET /announcements/admin/pending`
File d'attente de modération (statut `PENDING_REVIEW`, tri du plus ancien au plus récent).
- **Auth** : 👮

#### `PUT /announcements/admin/:id/approve`
Fait passer une annonce `PENDING_REVIEW` → `ACTIVE`, envoie un email au propriétaire.
- **Auth** : 👮
- **Réponses** : `200` succès · `404` introuvable · `400` l'annonce n'est pas en attente de validation

#### `PUT /announcements/admin/:id/reject`
Fait passer une annonce `PENDING_REVIEW` → `REJECTED`, envoie un email au propriétaire.
- **Auth** : 👮
- **Body** : `{ "reason": string }` (optionnel, max 500 caractères — sinon un message par défaut est utilisé dans l'email)
- **Réponses** : `200` succès · `404` introuvable · `400` l'annonce n'est pas en attente de validation

#### `GET /announcements/:id`
Détail public d'une annonce. Si l'appelant est authentifié et propriétaire de l'annonce, il la voit quel que soit son statut ; sinon, seule une annonce `ACTIVE` est visible.
- **Auth** : optionnelle (le header `Authorization` est lu s'il est présent, mais son absence n'entraîne pas de `401`)
- **Réponses** : `200` succès · `404` introuvable ou non visible pour l'appelant

#### `POST /announcements`
Crée une annonce (statut initial `PENDING_REVIEW`), avec upload d'images optionnel (`multipart/form-data`, champ `media`, jusqu'à 10 images). Envoie un email de confirmation au propriétaire.
- **Auth** : 🔑
- **Body** (form-data ou JSON selon présence de fichiers)

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `title` | string | ✅ | 3 à 255 caractères |
| `description` | string | ❌ | |
| `price` | number | ✅ | positif, 2 décimales |
| `surface_area` | number | ❌ | positif, 2 décimales |
| `rooms` / `bedrooms` / `bathrooms` | integer | ❌ | ≥ 0 |
| `furnished` | boolean | ❌ | |
| `property_type_id` | integer | ✅ | |
| `city_id` | integer | ✅ | |

- **Réponse `201`** → l'annonce créée avec ses médias

#### `PUT /announcements/:id`
Modifie une annonce. Une annonce `REJECTED` ne peut pas être éditée (utiliser `resubmit` d'abord). Si l'annonce était `ACTIVE`, elle repasse automatiquement en `PENDING_REVIEW` après modification.
- **Auth** : 🏠 (propriétaire)
- **Body** : mêmes champs que la création, tous optionnels
- **Réponses** : `200` succès · `400` annonce `REJECTED` · `403` non propriétaire · `404` introuvable

#### `DELETE /announcements/:id`
Suppression douce (soft delete).
- **Auth** : 🏠

#### `PATCH /announcements/:id/archive`
Archive une annonce `ACTIVE` ou `RENTED`.
- **Auth** : 🏠
- **Réponses** : `200` succès · `400` statut non archivable

#### `PATCH /announcements/:id/resubmit`
Resoumet une annonce `ARCHIVED` ou `REJECTED` → repasse en `PENDING_REVIEW`.
- **Auth** : 🏠
- **Réponses** : `200` succès · `400` statut non resoumettable


### 7.4 Médias — `/api/v1/media`

#### `GET /media`
Liste les médias appartenant à l'utilisateur connecté (`mediable_id = req.user.id`, tous `mediable_type` confondus — en pratique l'avatar).
- **Auth** : 🔑

#### `POST /media/avatar`
Remplace la photo de profil (tout avatar existant est supprimé du disque et de la base avant l'ajout du nouveau).
- **Auth** : 🔑 · **Form-data** : champ `avatar` (fichier unique, voir §4)
- **Réponses** : `201` succès · `400` aucun fichier fourni / type de fichier invalide

#### `DELETE /media/avatar`
- **Auth** : 🔑
- **Réponses** : `200` succès · `404` aucun avatar

#### `POST /media/announcements/:id/images`
Ajoute des images à une annonce existante (n'écrase pas les images déjà présentes).
- **Auth** : 🏠 (propriétaire de l'annonce) · **Form-data** : champ `images` (jusqu'à 10 fichiers)
- **Réponses** : `201` succès · `400` aucun fichier / type invalide · `403` non propriétaire · `404` annonce introuvable

#### `POST /media/announcements/:id/videos`
- **Auth** : 🏠 · **Form-data** : champ `videos` (jusqu'à 3 fichiers)
- **Réponses** : identiques au précédent

#### `DELETE /media/:id`
Supprime un média (fichier disque + enregistrement). Autorisé pour : un admin/root, le propriétaire du compte pour un avatar, le propriétaire de l'annonce pour un média d'annonce.
- **Auth** : 🔑 (avec vérification de propriété, sauf admin/root)
- **Réponses** : `200` succès · `403` non autorisé · `404` média introuvable

### 7.5 Favoris — `/api/v1/favorites`

#### `GET /favorites`
Mes annonces favorites (paginé), avec les médias de chaque annonce.
- **Auth** : 🔑

#### `POST /favorites/:id`
Ajoute l'annonce `:id` aux favoris. Un locataire (`TENANT`) ne peut favoriser qu'une annonce `ACTIVE`.
- **Auth** : 🔑
- **Réponses** : `201` succès · `403` (locataire + annonce non active) · `404` annonce introuvable · `409` déjà en favori

#### `DELETE /favorites/:id`
- **Auth** : 🔑
- **Réponses** : `200` succès · `404` favori introuvable

### 7.6 Messagerie — `/api/v1/conversations`

Une conversation est liée à une annonce et relie un `tenant_id` (locataire) à un `owner_id` (propriétaire de l'annonce). Une seule conversation par couple (locataire, annonce) — contrainte unique en base.

#### `POST /conversations`
Démarre une conversation en envoyant le premier message. Réservé aux locataires (`ROLE_TENANT`). Envoie un email de notification au propriétaire.
- **Auth** : 🔑, rôle `TENANT` uniquement
- **Body** : `{ "announcementId": integer, "content": string(1-2000) }`
- **Réponses**
  - `201` → `{ "data": { "conversation": {...}, "message": {...} } }`
  - `400` → tentative de contacter sa propre annonce
  - `403` → rôle non `TENANT`
  - `404` → annonce introuvable
  - `409` → une conversation existe déjà pour ce couple locataire/annonce

#### `GET /conversations`
Mes conversations (en tant que locataire ou propriétaire), triées par dernier message.
- **Auth** : 🔑
- **Query** : `page`, `limit`

#### `GET /conversations/unread-count`
Nombre total de messages non lus, toutes conversations confondues.
- **Auth** : 🔑
- **Réponse `200`** → `{ "data": { "count": 3 } }`

#### `GET /conversations/:id/messages`
Récupère les messages d'une conversation (pagination `page`/`limit`, défaut `limit=50`). **Effet de bord** : marque automatiquement comme lus tous les messages reçus non lus de cette conversation.
- **Auth** : 🔑, participant de la conversation uniquement
- **Réponses** : `200` succès · `403` non participant · `404` conversation introuvable

#### `POST /conversations/:id/messages`
Envoie un message dans une conversation existante, met à jour `last_message_at`.
- **Auth** : 🔑, participant de la conversation uniquement
- **Body** : `{ "content": string(1-2000) }`
- **Réponses** : `201` succès · `403` non participant · `404` conversation introuvable


### 7.7 Signalements — `/api/v1/reports`

#### `POST /reports`
Signale une annonce. Impossible de signaler sa propre annonce ; limité à un signalement par utilisateur et par annonce toutes les 24h.
- **Auth** : 🔑
- **Body** : `{ "announcementId": integer, "reason": string(10-2000) }`
- **Réponses**
  - `201` succès (statut initial `PENDING`)
  - `400` → tentative de signaler sa propre annonce
  - `404` → annonce introuvable
  - `429` → déjà signalé dans les dernières 24h

#### `GET /reports/admin`
Liste des signalements, filtrable par `status_id` (1 à 4).
- **Auth** : 👮
- **Query** : `status_id`, `page`, `limit`

#### `GET /reports/admin/:id`
Détail complet d'un signalement (annonce, auteur, statut, admin traitant).
- **Auth** : 👮

#### `PATCH /reports/admin/:id/review`
Passe le signalement en statut `REVIEWED` (id 2), enregistre l'admin traitant.
- **Auth** : 👮
- **Réponses** : `200` succès · `400` déjà traité (statut ≠ `PENDING`)

#### `PATCH /reports/admin/:id/dismiss`
Passe le signalement en `DISMISSED` (id 3).
- **Auth** : 👮
- **Body** : `{ "adminNote": string(≤2000) }` (optionnel)
- **Réponses** : `200` succès · `400` déjà traité

#### `PATCH /reports/admin/:id/take-action`
Passe le signalement en `ACTION_TAKEN` (id 4) **et** fait passer l'annonce liée au statut `REJECTED`. Envoie un email au propriétaire de l'annonce.
- **Auth** : 👮
- **Body** : `{ "adminNote": string(≤2000) }` (optionnel — une note par défaut est utilisée pour l'email sinon)
- **Réponses** : `200` succès · `400` déjà traité · `404` introuvable

### 7.8 Abonnements & paiement Stripe — `/api/v1/subscriptions`

Réservé aux rôles `OWNER` et `AGENCY` pour la souscription. Deux parcours de paiement coexistent dans le code :
1. **Manuel** : `POST /subscribe` avec une simple référence de paiement, à valider ensuite par un admin (`activate`/`reject`).
2. **Stripe** : `POST /create-payment-intent` → paiement côté client avec le `clientSecret` → `POST /confirm-payment` (ou activation automatique via le webhook).

#### `GET /subscriptions/plans`
Liste des plans, triés par `priority`.
- **Auth** : aucune

#### `POST /subscriptions/subscribe`
Crée une demande d'abonnement au statut `PENDING` (à valider par un admin).
- **Auth** : 🔑, rôle `OWNER` ou `AGENCY`
- **Body** : `{ "planId": integer, "paymentReference": string(≤255, optionnel) }`
- **Réponses** : `201` succès · `403` rôle non autorisé · `404` plan introuvable · `400` (plan gratuit / abonnement actif ou en attente déjà existant)

#### `GET /subscriptions/me`
Mon abonnement le plus récent (avec le détail du plan).
- **Auth** : 🔑

#### `GET /subscriptions/history`
Historique paginé de mes abonnements.
- **Auth** : 🔑

#### `GET /subscriptions/admin`
Liste de tous les abonnements, filtrable par `status`.
- **Auth** : 👮
- **Query** : `status` (`PENDING`\|`ACTIVE`\|`EXPIRED`\|`REJECTED`), `page`, `limit`

#### `GET /subscriptions/admin/:id`
- **Auth** : 👮

#### `PATCH /subscriptions/admin/:id/activate`
Active un abonnement `PENDING` : calcule `start_date`/`end_date` (`+ duration_days` du plan), envoie un email.
- **Auth** : 👮
- **Body** : `{ "adminNote": string(≤2000, optionnel) }`
- **Réponses** : `200` succès · `400` non `PENDING` · `404` introuvable

#### `PATCH /subscriptions/admin/:id/reject`
- **Auth** : 👮
- **Body** : `{ "adminNote": string(≤2000, optionnel) }`
- **Réponses** : `200` succès · `400` non `PENDING` · `404` introuvable

#### `POST /subscriptions/create-payment-intent`
Crée un `PaymentIntent` Stripe (montant = `plan.price × 100`, devise `eur`) et un enregistrement d'abonnement au statut `WAITING_PAYMENT`.
- **Auth** : 🔑, rôle `OWNER` ou `AGENCY`
- **Body** : `{ "planId": integer }`
- **Réponse `201`** → `{ "data": { "clientSecret": "pi_..._secret_...", "subscriptionId": 7 } }`
- **Erreurs** : `403` rôle non autorisé · `404` plan introuvable · `400` (plan gratuit / abonnement actif ou paiement en attente déjà existant)

#### `POST /subscriptions/confirm-payment`
Confirme côté serveur qu'un `PaymentIntent` a bien le statut `succeeded` chez Stripe, puis active l'abonnement.
- **Auth** : 🔑
- **Body** : `{ "paymentIntentId": string (doit commencer par "pi_") }`
- **Réponses** : `200` succès · `400` paiement non abouti / abonnement pas en attente de paiement · `404` introuvable

#### `POST /api/v1/stripe/webhook` *(route racine, hors `/subscriptions`)*
Endpoint appelé par Stripe. Monté **avant** `express.json()` dans `server.js`, avec `express.raw({ type: "application/json" })`, car la vérification de signature Stripe nécessite le corps brut.
- **Auth** : vérification de signature via l'en-tête `Stripe-Signature` et `STRIPE_WEBHOOK_SECRET`
- **Événements gérés** :
  - `payment_intent.succeeded` → active l'abonnement correspondant (idempotent : ignoré si déjà traité)
  - `payment_intent.payment_failed` → passe l'abonnement en `FAILED`
- **Réponses** : `200` `{ "received": true }` · `400` signature invalide


### 7.9 Administration — `/api/v1/admin`

Toutes les routes de ce module exigent `authenticate` + `isAdmin` (rôle `ADMIN` ou `ROOT`) + `existence` (re-vérification en base que le compte admin existe et est `ACTIVE`).

#### `GET /admin/stats`
Statistiques globales agrégées.
- **Réponse `200`**
```json
{
  "status": "success",
  "message": "Stats retrieved successfully",
  "data": {
    "users": { "total": 120, "owners": 30, "tenants": 85, "newLast30d": 12 },
    "announcements": { "total": 64, "active": 40, "pending": 5, "rejected": 3, "rented": 8 },
    "reports": { "total": 9, "pending": 2 },
    "subscriptions": { "total": 22, "pending": 3, "active": 15 },
    "favorites": { "total": 210 },
    "messages": { "total": 512, "unread": 34 }
  }
}
```

#### `GET /admin/stats/evolution`
Évolution jour par jour (30 derniers jours) du nombre d'inscriptions et d'annonces créées.
- **Réponse `200`** → `{ "data": { "users": [{ "date": "2026-07-15", "count": 3 }], "announcements": [...] } }`

#### `GET /admin/pending-counts`
Compteurs légers pour badges de notification (annonces en attente, signalements en attente, abonnements en attente).

#### `GET /admin/recent-activity`
Les 10 dernières annonces en attente, les 10 derniers signalements, les 10 derniers abonnements en attente.

#### `PATCH /admin/manage-announcements-status/:id`
Change directement le statut d'une annonce vers n'importe quelle valeur du référentiel (hors `PENDING_REVIEW`, exclu volontairement car statut système initial). Envoie un email "annonce acceptée" **quel que soit le nouveau statut** (⚠️ voir §9).
- **Body** : `{ "newStatus": "ACTIVE" | "RENTED" | "ARCHIVED" | "REJECTED" }`
- **Réponses** : `200` succès (`{ ...updated, emailSent }`) · `400` déjà à ce statut · `404` introuvable

#### `PATCH /admin/manage-user-status`
Change le statut d'un utilisateur, avec vérification de cohérence (`currentStatus` doit correspondre à l'état réel en base — sinon `409`, pour éviter les mises à jour concurrentes basées sur un état obsolète côté client).
- **Body**

| Champ | Type | Requis |
|---|---|---|
| `userId` | integer | ✅ |
| `currentStatus` | string parmi `ACTIVE`, `INACTIVE`, `SUSPENDED` | ✅ |
| `newStatus` | string parmi `ACTIVE`, `INACTIVE`, `SUSPENDED` | ✅ |

  *(`PENDING_VERIFICATION` est exclu des valeurs acceptées par le schéma)*
- **Réponses**
  - `200` succès
  - `400` → `userId` = l'admin lui-même, ou `newStatus === currentStatus`
  - `401` → l'utilisateur ciblé est encore `PENDING_VERIFICATION`
  - `404` → utilisateur introuvable
  - `409` → `currentStatus` fourni ne correspond pas à l'état réel en base

#### `PATCH /admin/manage-user-role`
Change le rôle d'un utilisateur, avec la même logique de vérification de cohérence.
- **Body**

| Champ | Type | Requis |
|---|---|---|
| `userId` | integer | ✅ |
| `currentRole` | string parmi les codes rôle (hors `ROLE_ROOT`) | ✅ |
| `newRole` | string parmi les codes rôle (hors `ROLE_ROOT`) | ✅ |

- **Réponses**
  - `200` succès
  - `400` → `newRole === currentRole`, ou l'utilisateur ne remplit pas les conditions (non `ACTIVE`, email non vérifié, compte non `verified_at`)
  - `401` → `userId` = l'admin lui-même, ou tentative de modifier un compte `ADMIN`/`ROOT`
  - `404` → utilisateur introuvable
  - `409` → `currentRole` fourni ne correspond pas au rôle réel en base

#### `PATCH /admin/verify-user/:id`
Marque un compte comme "vérifié" (`verified_at`), distinct de la vérification d'email. Nécessite que l'email soit déjà vérifié. Envoie un email de félicitations.
- **Réponses** : `200` succès (`{ ...updated, emailSent }`) · `400` email non vérifié / déjà vérifié · `404` introuvable

#### `GET /admin/users`
Liste paginée des utilisateurs, avec recherche texte (prénom/nom/email) et filtres.
- **Query** : `page`, `limit`, `search` (≤255), `role_id`, `user_status_id`

#### `GET /admin/users/:id`
Détail d'un utilisateur.
- **Réponses** : `200` succès · `404` introuvable


---

## 8. Variables d'environnement requises

Ces variables sont lues directement via `process.env` dans le code (`config/env.js` charge `.env.local` puis `.env`). Elles doivent être renseignées pour que l'application démarre correctement — **aucune n'a de valeur par défaut en dur dans le code**.

| Variable | Utilisée pour |
|---|---|
| `PORT` | Port d'écoute du serveur Express |
| `NODE_ENV` | Bascule les messages d'erreur détaillés (`development`) vs génériques (`production`) |
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_DIALECT` | Connexion Sequelize/MySQL |
| `JWT_SECRET` | Signature/vérification des tokens d'accès |
| `JWT_EXPIRES_IN` | Durée de vie du token d'accès (ex. `15m`) |
| `EMAIL_SENDER` | Adresse d'expédition des emails transactionnels (nodemailer) |
| `APP_URL` | URL de base utilisée dans certains templates d'email (fallback `https://renthub.fr` si absente) |
| `STRIPE_SECRET_KEY` | Client API Stripe (`config/stripe.js`) |
| `STRIPE_WEBHOOK_SECRET` | Vérification de signature du webhook Stripe |

---

## 9. Points de vigilance relevés dans le code

Cette section liste des observations techniques identifiées lors de l'analyse, à traiter avant mise en production ou à garder en tête en tant que consommateur de l'API.

1. **Trois formats d'erreur différents** selon l'origine (Joi via `validate()`, contrôleur métier, `errorHandler` global) — voir §1.1. À homogénéiser côté backend, ou à gérer explicitement côté frontend.
2. **`PATCH /admin/manage-announcements-status/:id`** envoie systématiquement le template email "annonce acceptée" (`announcementApproved`) quel que soit le `newStatus` choisi (y compris pour `REJECTED` ou `ARCHIVED`) — le contenu de l'email ne reflète donc pas toujours l'action réalisée.
3. **Statut d'abonnement `EXPIRED`** accepté par le schéma de filtrage admin (`subscriptionFilterSchema`) mais aucune transition automatique (cron/job) ne fait passer un abonnement `ACTIVE` à `EXPIRED` une fois `end_date` dépassée dans le code fourni.
4. **`PORT`** n'a pas de valeur de repli dans `server.js` (`app.listen(process.env.PORT, ...)`) — une variable d'environnement absente entraînera un comportement indéfini au démarrage.
5. **`GET /media`** ne valide pas sa query string avec `mediaFilterSchema` bien que ce schéma existe (`page`/`limit` ne sont donc pas appliqués côté pagination sur cet endpoint — `getMyMedia` renvoie la liste complète, non paginée).
6. **CORS** est actuellement configuré en `origin: '*'` (`config/corsOptions.js`) — à restreindre au(x) domaine(s) du frontend avant mise en production, en particulier puisque `Authorization` est utilisé.
7. **`GET /announcements/:id`** lit un éventuel token dans l'en-tête `Authorization` sans passer par le middleware `authenticate` standard (fonction locale `getOptionalUser`) — comportement volontaire (accès public + vue enrichie si propriétaire connecté) mais à garder en tête si la logique d'auth évolue, pour ne pas dupliquer/diverger.

---