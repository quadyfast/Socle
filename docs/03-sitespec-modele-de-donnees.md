# 03 — Le `SiteSpec` : la donnée qui EST le produit

> Tout le système repose sur cette décision : la maquette n'est pas un rendu, c'est un
> document JSON typé. Le tunnel le remplit, l'IA le complète, le renderer l'affiche,
> l'admin le lit, l'export (produit B) le compilera.

---

## 1. Principes

1. **L'IA ne produit jamais de HTML/CSS.** Elle remplit des champs de ce schéma via structured output, validé par Zod avant persistance. Rendu 100 % prévisible, éditable, sûr.
2. **Chaque section est un type fermé** avec des variantes finies. La liberté visuelle vient de la combinatoire (thème × variante × contenu), pas de l'arbitraire.
3. **Versionné et migrable** : `specVersion` + fonctions de migration, comme un schéma de BDD.
4. **Traçabilité de la provenance** : chaque bloc de contenu note s'il vient de l'IA, du pack ou de l'utilisateur — l'admin voit ce qui a été validé humainement.

---

## 2. Schéma (extraits TypeScript/Zod)

```ts
// lib/site-spec/schema.ts

export const SiteSpec = z.object({
  specVersion: z.literal(2),

  identity: z.object({
    businessName: z.string(),
    tagline: Provenanced(z.string()),          // accroche
    sectorSlug: z.string(),                     // ex. "photographe-mariage"
    goal: z.enum(['contact','showcase','sell','book','inform']),
    differentiator: z.string().optional(),      // « ce qui vous rend différent »
    logo: AssetRef.optional(),
  }),

  theme: z.object({
    id: z.enum(['moderne','elegant','chaleureux','minimal']),
    palette: z.enum(['default','alt1','alt2','alt3']),   // variantes par thème
    fontPair: z.enum(['a','b','c']),
    density: z.enum(['airy','normal','compact']).default('normal'),
  }),

  pages: z.array(z.object({
    slug: z.string(),                 // 'accueil', 'galerie', 'contact'…
    title: z.string(),
    suggested: z.boolean(),           // proposée par le pack
    custom: z.boolean(),              // demandée librement par l'utilisateur
    enabled: z.boolean(),
    note: z.string().optional(),      // précision du client pour cette page
  })),

  // Seule la home est composée en sections au MVP ; les autres pages
  // sont des intentions listées. Le format n'interdit pas de les composer plus tard.
  home: z.array(Section),

  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    hours: z.array(z.object({ days: z.string(), open: z.string() })).optional(),
    socials: z.array(z.object({
      network: z.enum(['instagram','facebook','tiktok','linkedin','youtube','x','other']),
      url: z.string().url(),
    })),
  }),

  meta: z.object({
    completion: z.record(z.string(), z.number()),  // % par chantier, calculé serveur
    specialRequests: z.string().optional(),        // demandes particulières libres
  }),
});
```

### Les sections

```ts
const Section = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    variant: z.enum(['imageRight','imageFull','centered']),
    heading: Provenanced(z.string()),
    subheading: Provenanced(z.string()),
    cta: z.object({ label: z.string(), goal: z.string() }),
    image: AssetRef,                               // upload OU image sectorielle
  }),
  z.object({
    type: z.literal('services'),
    variant: z.enum(['cards3','list','alternating']),
    title: Provenanced(z.string()),
    items: z.array(z.object({
      name: Provenanced(z.string()),
      description: Provenanced(z.string()),
      price: z.string().optional(),
      image: AssetRef.optional(),
    })).max(8),
  }),
  z.object({ type: z.literal('about'),        /* heading, body, image, variant */ }),
  z.object({ type: z.literal('gallery'),      /* images[], layout: grid|masonry */ }),
  z.object({ type: z.literal('testimonials'), /* items: {quote, author}[] */ }),
  z.object({ type: z.literal('menu'),         /* restaurants : catégories + items */ }),
  z.object({ type: z.literal('faq'),          /* items: {q, a}[] */ }),
  z.object({ type: z.literal('contactBlock'), /* affiche contact + carte statique */ }),
  z.object({ type: z.literal('ctaBanner'),    /* bandeau d'appel à l'action */ }),
]);
```

### Les briques transverses

```ts
// Toute donnée textuelle « rédigée » porte sa provenance :
const Provenanced = <T extends z.ZodType>(inner: T) => z.object({
  value: inner,
  source: z.enum(['pack','ai','user']),   // 'user' dès que l'humain a touché
});

// Toute image est une référence, jamais un blob dans la spec :
const AssetRef = z.object({
  kind: z.enum(['upload','stock']),
  key: z.string(),          // clé R2 ou id d'image sectorielle
  alt: z.string(),
  provisional: z.boolean(), // true = badge « provisoire » dans la maquette
});
```

---

## 3. Cycle de vie d'un `SiteSpec`

```
Écran 1 (métier)   → spec initiale = squelette du pack métier (sections types, textes du pack)
Écran 2 (nom)      → identity.businessName
Écran 3 (univers)  → theme.id  (les 4 vignettes = 4 rendus de cette même spec, thème varié)
Écran 4 (objectif) → identity.goal → réordonne home[] + choisit le CTA
Écran 5 (phrase)   → identity.differentiator
RÉVÉLATION         → l'IA remplace les textes source:'pack' par source:'ai' (streaming)
ACTE 2             → chaque édition passe des champs en source:'user'
ACTE 3 (submit)    → la version courante est gelée (immutable), status → 'nouveau'
```

Le **pourcentage de complétion par chantier** est calculé côté serveur à partir de la spec
(règles simples : section touchée par l'utilisateur, images non provisoires, contact rempli…).
Il ne recule jamais : on stocke le max atteint.

---

## 4. Schéma relationnel complet

```sql
projects (
  id            uuid PK,
  public_id     text UNIQUE,            -- court, pour /maquette/[publicId]
  token_hash    text,                   -- sha256 du token studio
  status        text CHECK (status IN
                ('draft','nouveau','en_etude','en_creation','en_validation','termine','abandonne')),
  email         citext,
  contact_name  text,
  phone         text,
  business_name text,
  sector_slug   text,
  lead_score    int DEFAULT 0,          -- calculé : complétion, budget, échéance, photos
  consent_marketing boolean DEFAULT false,
  created_at / updated_at / submitted_at / purge_after timestamptz
)

site_specs (
  id serial PK, project_id FK, version int,
  spec jsonb,                            -- validé Zod avant insertion
  created_by text CHECK (created_by IN ('user','ai','system','admin')),
  created_at timestamptz,
  UNIQUE (project_id, version)
)

answers        (project_id FK, step_key text, value jsonb, answered_at)   -- brut du tunnel
uploads        (id, project_id FK, kind, r2_key, mime, size_bytes, width, height, created_at)
project_events (id, project_id FK, type text, payload jsonb, actor text, created_at)
  -- types : step_completed, reveal_shown, email_captured, section_edited,
  --         submitted, status_changed, info_requested, info_answered, email_sent…
scheduled_emails (id, project_id FK, template text, send_at, sent_at, cancelled boolean)
info_requests    (id, project_id FK, message text, target_chantier text,
                  created_by FK admin, resolved_at, client_reply text)
admin_users      (id, email citext UNIQUE, name, totp_secret, created_at)
```

`project_events` sert trois usages à la fois : l'« historique des modifications » de l'admin
(§16 du brief), l'audit, et une source secondaire d'analytics si PostHog manque un événement.

---

## 5. Ce que ce modèle rend gratuit plus tard

| Évolution | Coût grâce au modèle |
|---|---|
| Undo / restauration | lire `site_specs` version N-1 |
| Export du vrai site (produit B) | compiler la même spec avec les mêmes composants |
| Nouveaux thèmes / sections | ajouter une variante d'enum + un composant |
| A/B test de structures | deux specs initiales pour un même pack |
| Statistiques métier (« les photographes choisissent Élégant à 61 % ») | requêtes SQL sur `spec` JSONB |
| Devis automatique | fonction pure `spec → prix` (pages, sections, options) |
