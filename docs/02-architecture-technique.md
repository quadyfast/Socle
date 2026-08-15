# 02 — Architecture technique et stack

---

## 1. Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 15 (App Router)                  │
│                                                              │
│  /               Landing (statique, ISR)                     │
│  /creer          Tunnel acte 1 (client components)           │
│  /studio/[token] Acte 2 — maquette + panneau chantiers       │
│  /maquette/[id]  Vue publique lecture seule (partage)        │
│  /admin/*        Espace administrateur (protégé)             │
│                                                              │
│  Route Handlers (API) :                                      │
│  /api/projects, /api/generate (SSE), /api/uploads,           │
│  /api/admin/*, /api/auth/*                                   │
└───────────────┬──────────────────────────────────────────────┘
                │
   ┌────────────┼───────────────┬────────────────┬───────────┐
   ▼            ▼               ▼                ▼           ▼
PostgreSQL   Stockage S3     Claude API      Resend       PostHog EU
(Neon/       (Cloudflare R2) (textes,        (emails      (analytics
 Supabase)   + images        classification)  transac.)    produit)
             sectorielles
             Unsplash/Pexels)
```

**Un seul déploiement** (Vercel ou VPS européen + Coolify). Pas de microservices, pas de queue dédiée, pas de Redis au MVP — la charge d'un tunnel de leads ne le justifie pas, et chaque pièce d'infrastructure en plus est un point de panne en plus.

---

## 2. Stack retenue et justifications

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 + React 19 + TypeScript strict** | Un seul langage partout ; SSR pour la landing (SEO) ; Route Handlers suffisent comme backend ; écosystème maximal |
| Styles | **Tailwind CSS 4** + design tokens CSS variables | Les 4 thèmes de maquette = 4 jeux de variables ; changement de thème instantané sans re-render lourd |
| Composants UI (plateforme) | **shadcn/ui** + Framer Motion | Base sobre et accessible ; Motion pour les transitions du tunnel et la révélation |
| État client | **Zustand** (tunnel + studio) + TanStack Query (admin) | Le studio est un éditeur : état local optimiste, persistance debounced ; Redux serait surdimensionné |
| Validation | **Zod** partout | Le même schéma valide le `SiteSpec` côté client, côté API et en sortie d'IA (structured output) |
| ORM | **Drizzle** | Typé bout en bout, migrations SQL lisibles, léger |
| Base de données | **PostgreSQL** (Neon ou Supabase, région UE) | JSONB pour le `SiteSpec` versionné + relationnel pour projets/statuts ; RGPD : données en UE |
| Fichiers | **Cloudflare R2** (compatible S3, UE) | Pas de frais de sortie ; upload direct navigateur → R2 via URL présignée |
| IA | **Claude API** — Haiku 4.5 pour classification/suggestions, Sonnet 5 pour la rédaction | Voir doc 05 ; structured outputs = JSON garanti conforme au schéma Zod |
| Emails | **Resend** + React Email | Templates en React (dont l'email de relance avec capture de maquette) |
| Auth admin | **Auth.js v5** — magic link + TOTP optionnel | Voir §6 |
| Analytics | **PostHog Cloud EU** | Funnel par étape, session replay sur le tunnel, hébergement UE |
| Monitoring | **Sentry** | Erreurs front + API |
| Tests | Vitest + Testing Library + Playwright (parcours critique complet) | Le tunnel de bout en bout est LE test qui compte |

### Écarté, et pourquoi

- **Backend séparé (NestJS/Fastify)** : rien dans ce produit ne le justifie ; complexité doublée pour zéro gain.
- **HTML généré par l'IA** : imprévisible, non éditable, non versionnable, XSS. L'IA ne produit que du JSON validé (doc 04).
- **GrapesJS / builder embarqué** : c'est un autre produit. L'édition en place sur composants contrôlés suffit.
- **Firebase** : hébergement US par défaut, lock-in, modèle de données mal adapté au relationnel de l'admin.
- **WebSockets** : aucune fonctionnalité temps réel multi-utilisateurs ; SSE suffit pour le streaming IA.

---

## 3. Architecture frontend

### 3.1 Arborescence

```
src/
├── app/
│   ├── (marketing)/page.tsx            # Landing
│   ├── creer/page.tsx                  # Acte 1 (orchestrateur du tunnel)
│   ├── studio/[token]/page.tsx         # Acte 2 + 3
│   ├── maquette/[publicId]/page.tsx    # Lecture seule / partage
│   ├── admin/
│   │   ├── layout.tsx                  # Garde d'auth
│   │   ├── page.tsx                    # Pipeline kanban
│   │   └── projets/[id]/page.tsx       # Détail projet
│   └── api/
│       ├── projects/route.ts           # POST création dès l'écran 1
│       ├── projects/[id]/route.ts      # PATCH autosave (SiteSpec + réponses)
│       ├── projects/[id]/submit/route.ts
│       ├── generate/route.ts           # SSE : classification + textes IA
│       ├── uploads/sign/route.ts       # URL présignées R2
│       └── admin/…
├── components/
│   ├── funnel/                         # Écrans acte 1, transitions, révélation
│   ├── studio/                         # Panneau chantiers, cartes, éditeurs
│   ├── site-renderer/                  # ⭐ LE cœur : SiteSpec → React
│   │   ├── SiteRenderer.tsx            # Dispatch section → composant
│   │   ├── sections/                   # Hero, Services, Gallery, About,
│   │   │                               #   Testimonials, Contact, Footer…
│   │   ├── themes/                     # 4 thèmes = 4 jeux de tokens CSS
│   │   └── frame/                      # Cadre desktop/tablette/mobile
│   └── ui/                             # shadcn
├── lib/
│   ├── site-spec/                      # Schémas Zod + types + migrations de spec
│   ├── packs/                          # 12 packs métiers (données pures)
│   ├── ai/                             # Prompts, appels Claude, fallbacks
│   └── db/                             # Drizzle schema + queries
└── emails/                             # Templates React Email
```

### 3.2 Le `site-renderer`, pièce maîtresse

Un module **pur et isolé** : `(spec: SiteSpec, viewport) → JSX`. Aucune dépendance vers le store, l'API ou le studio. Il est utilisé par quatre consommateurs :

1. Les **vignettes de l'écran 3** (rendu miniature, 4 thèmes en parallèle)
2. La **maquette du studio** (avec surcouche d'édition en place)
3. La **vue publique** en lecture seule
4. L'**aperçu admin** — et plus tard, l'**export du vrai site** (produit B)

C'est cette pureté qui garantit que « maquette » et « futur site » sont le même objet.

### 3.3 Flux de données du studio

```
Frappe utilisateur
  → Zustand (optimiste, re-render maquette < 100 ms)
  → debounce 800 ms
  → PATCH /api/projects/[id]  { specPatch, answersPatch }
  → indicateur « Enregistré ✓ »
Échec réseau → retry exponentiel + bandeau « reconnexion… » (l'état local fait foi)
```

Le token du studio (URL `/studio/[token]`) est un identifiant opaque 128 bits — c'est l'« authentification » du prospect anonyme. Le lien email de reprise contient ce même token.

---

## 4. Architecture backend

### 4.1 Endpoints

| Endpoint | Rôle | Auth |
|---|---|---|
| `POST /api/projects` | Création dès l'écran 1 ; retourne `{id, token}` | — (rate-limité) |
| `PATCH /api/projects/[id]` | Autosave réponses + SiteSpec (validé Zod) | token projet |
| `POST /api/projects/[id]/email` | Attache l'email, envoie le lien de reprise | token projet |
| `POST /api/projects/[id]/submit` | Acte 3 : gel de la spec, passage en `nouveau`, notification admin | token projet |
| `POST /api/generate` | SSE — classification métier, accroches, textes de sections | token projet, rate-limité, budget tokens/projet |
| `POST /api/uploads/sign` | URL présignée R2 (type/taille vérifiés) | token projet |
| `GET/PATCH /api/admin/projects…` | Pipeline, statuts, notes, demandes d'info | session admin |
| `POST /api/admin/projects/[id]/request-info` | Email au client avec lien de reprise ciblé sur un chantier | session admin |

### 4.2 Tâches différées sans infrastructure de queue

Relances J+1/J+3, captures de maquette pour les emails : **Vercel Cron** (ou cron système sur VPS) appelant des Route Handlers idempotents. Une table `scheduled_emails` fait office de file. Suffisant jusqu'à plusieurs milliers de projets/mois ; le jour où ça ne l'est plus, Inngest ou Trigger.dev s'insèrent sans refonte.

### 4.3 Sécurité

- **Validation Zod sur chaque entrée** (y compris les sorties IA avant persistance).
- Rate limiting par IP sur `POST /projects` et `/generate` (10 projets/h, budget IA plafonné par projet) — un tunnel anonyme avec de l'IA est une cible d'abus de coût.
- Uploads : types MIME whitelist (jpeg/png/webp), 10 Mo max, re-encodage serveur des images (strip EXIF/GPS — donnée personnelle), noms de fichiers régénérés.
- Tokens projet : 128 bits aléatoires, comparés en temps constant, expiration d'édition à 60 jours.
- Admin : voir §6. CSP stricte, cookies `HttpOnly/Secure/SameSite=Lax`, headers via middleware.
- Secrets en variables d'environnement, jamais en repo.

---

## 5. Base de données (résumé — schéma complet en doc 04)

```
projects        id, public_id, token_hash, status, email, phone, contact_name,
                business_name, sector_slug, lead_score, created_at, submitted_at…
site_specs      project_id, version, spec JSONB, created_by (user|ai|admin)
answers         project_id, step_key, value JSONB          # réponses brutes du tunnel
uploads         project_id, kind (logo|photo), r2_key, mime, size
admin_users     id, email, totp_secret…
project_events  project_id, type, payload, actor, created_at   # historique complet
scheduled_emails project_id, template, send_at, sent_at
info_requests   project_id, message, target_section, resolved_at
```

Choix structurant : le `SiteSpec` est **versionné en append-only** (une ligne par sauvegarde significative). Coût négligeable, et cela donne : l'historique des modifications demandé au §16 du brief, un undo futur gratuit, et la traçabilité de ce que l'IA a produit vs ce que l'humain a corrigé.

---

## 6. Authentification

**Prospects : pas de compte.** Le token d'URL est l'auth. Un compte (mot de passe, réinitialisation, vérification) est la friction maximale au pire moment ; le magic link de reprise donne 100 % de la valeur pour 0 % du coût. *(Si le produit B arrive, Auth.js est déjà en place — il suffira d'attacher les projets à un userId.)*

**Admin : Auth.js v5**, magic link vers une liste blanche d'emails + TOTP optionnel. Sessions JWT courtes (24 h), middleware sur `/admin/*` et `/api/admin/*`.

---

## 7. RGPD

- **Hébergement et données en UE** (Neon/Supabase UE, R2 juridiction UE, PostHog EU, Resend région UE).
- **Base légale** : exécution précontractuelle (le prospect demande un devis/maquette) + consentement explicite pour les relances email (case dédiée à la capture d'email : cochée = relances OK).
- **Minimisation** : aucune donnée sensible demandée ; EXIF/GPS strippés des photos.
- **Durées** : projets anonymes jamais soumis → purge à 90 jours (cron). Projets soumis → durée de la relation commerciale + archivage.
- **Droits** : email de contact DPO dans le footer ; suppression = cascade DB + objets R2 (implémentée dès le MVP, pas « plus tard »).
- **Sous-traitants** : listés dans la politique de confidentialité (Anthropic, Cloudflare, Neon, Resend, PostHog, Sentry) avec DPA signés.
- **Cookies** : aucun cookie tiers de tracking au MVP → pas de bannière nécessaire si PostHog est configuré en mode cookieless. Un bandeau sobre sinon.
- Les contenus envoyés à l'API Claude ne servent pas à l'entraînement (politique Anthropic) — à mentionner dans la politique de confidentialité.

---

## 8. Sauvegarde et résilience

- PostgreSQL managé : PITR (point-in-time recovery) activé, rétention 7–30 j.
- R2 : versioning activé sur le bucket.
- Le versionnage applicatif des `site_specs` protège en plus contre l'erreur logicielle (spec corrompue = on repart de la version N-1).
- Export hebdomadaire chiffré (dump + manifest R2) vers un second stockage.
- Sentry + healthcheck + alerte si le taux d'erreur de `/api/generate` dépasse un seuil (dépendance critique à l'API IA → fallback packs, voir doc 05).

---

## 9. Mise en production

```
GitHub → CI (lint, typecheck, tests unitaires, Playwright sur le parcours complet)
       → Preview deployment par PR (Vercel)
       → main = production
```

- **Semaine type de lancement** : déploiement continu, feature flags simples (env vars) pour couper l'IA ou un pack défaillant sans redéployer.
- Environnements : `production`, `preview` (données de test), `local` (Docker Postgres + R2 émulé par MinIO).
- Domaine : landing + tunnel sur le domaine principal ; admin sur `/admin` (pas de sous-domaine à gérer au MVP).

---

## 10. Évolution vers le produit B (génération du vrai site)

Rien à réécrire, tout à ajouter :

1. **Export statique** : `SiteSpec` → build Next.js (les mêmes composants `site-renderer` en mode production : SEO, sitemap, formulaire branché) → déploiement automatisé (Vercel API / Cloudflare Pages) sur sous-domaine puis domaine client.
2. **Comptes clients** : Auth.js déjà en place ; attacher `projects.user_id`.
3. **Paiement** : Stripe Checkout sur la validation (acompte) puis abonnements (maintenance).
4. **Éditeur post-livraison** : le studio existant, pointé sur le site livré.
5. **Nouvelles sections/thèmes** : ajout d'un composant + entrée de schéma — le format `SiteSpec` est extensible par conception (doc 04).
