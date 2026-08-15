# 04 — Le système d'intelligence : packs métiers + IA

> Principe : **le déterministe pour la structure, l'IA pour les mots.**
> L'« intelligence » que l'utilisateur perçoit (« la plateforme comprend mon métier »)
> vient à 90 % des packs métiers — latence nulle, coût nul, qualité maîtrisée, testable.
> L'IA n'intervient que là où elle est irremplaçable : le langage.

---

## 1. Répartition des rôles

| Besoin | Qui | Pourquoi |
|---|---|---|
| Question de spécialisation (« Quel type de photographie ? ») | **Pack** | Écrite une fois, parfaite à jamais |
| Structure de la home, pages suggérées, sections | **Pack** | Un expert humain fait mieux qu'un LLM, une fois pour toutes |
| Objectifs proposés, CTA, services pré-remplis | **Pack** | idem |
| Images provisoires sectorielles | **Pack** (banque taguée) | Choisies à la main = toujours belles |
| Classifier un métier saisi librement hors référentiel | **IA — Haiku 4.5** | Seul cas vraiment ouvert |
| Accroche, sous-titre, textes de sections personnalisés (nom + différenciateur intégrés) | **IA — Sonnet 5** | Le langage sur mesure est LA valeur ajoutée IA |
| Reformulation valorisante du métier dans les micro-feedbacks | **IA — Haiku 4.5** | Petite touche, petit modèle |
| Affiner suggestions si `differentiator` riche | **IA — Haiku 4.5** | Optionnel, non bloquant |

**Règle d'or : l'IA n'est jamais sur le chemin critique.** Chaque appel a un fallback
déterministe (textes du pack) et un timeout court. Si l'API Claude tombe, le produit
fonctionne à 100 % — les textes sont juste moins personnalisés.

---

## 2. Anatomie d'un pack métier

```ts
// lib/packs/photographe.ts
export const photographe: SectorPack = {
  slug: 'photographe',
  labels: ['photographe', 'photo', 'shooting'],        // pour l'autocomplétion
  specializationQuestion: {
    title: 'Quel type de photographie pratiquez-vous ?',
    options: ['Mariage', 'Portrait', 'Entreprise', 'Immobilier', 'Événement', 'Autre'],
  },
  goals: [
    { id: 'showcase', label: 'Montrer mon travail' },
    { id: 'contact',  label: 'Être contacté pour des devis' },
    { id: 'book',     label: 'Faire réserver mes prestations' },
  ],
  homeSections: ['hero', 'gallery', 'services', 'about', 'testimonials', 'contactBlock'],
  suggestedPages: [
    { slug: 'galerie',    reason: 'La page que vos visiteurs chercheront en premier.' },
    { slug: 'prestations',reason: 'Détaillez vos formules et tarifs.' },
    { slug: 'a-propos',   reason: 'On choisit un photographe autant qu\'un style.' },
    { slug: 'contact',    reason: 'Indispensable.' },
  ],
  prefilledServices: [
    { name: 'Reportage mariage',   description: 'Une journée complète, des préparatifs à la soirée…' },
    { name: 'Séance portrait',     description: 'En studio ou en extérieur, seul ou en famille…' },
    { name: 'Séance engagement',   description: '…' },
  ],
  fallbackCopy: { heroHeading: '…', heroSub: '…', aboutBody: '…' },   // si l'IA échoue
  stockImageTags: ['wedding-photography', 'portrait', 'camera'],
  lexicon: ['lumière', 'instant', 'émotion', 'naturel'],              // injecté au prompt IA
};
```

**MVP : 12 packs** — photographe, restaurant/café, artisan BTP, coiffure & beauté,
coach & bien-être, thérapeute/praticien, consultant/freelance B2B, commerce local,
association, profession libérale (avocat, comptable…), créateur/artiste, **générique**.

Le pack générique est soigné (c'est le filet de sécurité de tous les métiers non couverts) ;
la spécialisation saisie librement est alors classifiée par Haiku vers le pack le plus
proche, ou reste générique. Ajouter un pack = un fichier de données + relecture → l'offre
« la plateforme comprend mon métier » s'élargit sans toucher au code.

---

## 3. Les appels IA en détail

### 3.1 Classification (écran 1, hors référentiel) — Haiku 4.5

Entrée : la saisie libre. Sortie (structured output) : `{ packSlug, specialization, confidence }`.
< 1 s, lancé pendant que l'utilisateur tape l'écran 2 — jamais d'attente perçue.
`confidence < 0.6` → pack générique.

### 3.2 Rédaction de la révélation — Sonnet 5, streaming SSE

Un **seul appel** génère tous les textes de la home (économie + cohérence de ton), en
structured output conforme aux champs `Provenanced` de la spec :

```
Contexte : métier, spécialisation, nom, objectif, différenciateur, thème choisi,
           lexique du pack, liste exacte des champs à remplir.
Contraintes : français, vouvoiement du visiteur final, pas de superlatifs creux,
              longueurs max par champ, intégrer le différenciateur dans l'accroche,
              ton aligné au thème (Élégant ≠ Chaleureux).
```

Le SSE renvoie les champs au fil de l'eau → la maquette se remplit section par section
pendant l'animation de révélation (l'attente EST le spectacle, doc 01 §2).
Timeout 6 s par section → `fallbackCopy` du pack s'affiche, l'IA remplace en silence si
elle finit ensuite. Un champ passé en `source:'user'` n'est **jamais** écrasé par l'IA.

### 3.3 Régénération ciblée (acte 2)

Bouton « ✨ Reformuler » sur chaque texte de la maquette : régénère ce champ seul
(3 propositions, l'utilisateur choisit). Plafond par projet (ex. 20 régénérations)
pour borner le coût.

---

## 4. Coûts et garde-fous

Ordre de grandeur par projet : 1 appel Sonnet (~2–3 k tokens) + 2–3 appels Haiku
≈ **1 à 2 centimes d'euro**. Négligeable — mais sans plafond, un abus (script qui crée
des projets en boucle) coûte cher :

- Rate limit IP sur la création de projet et sur `/api/generate`.
- Budget tokens par projet, compteur en base.
- Feature flag `AI_ENABLED` : coupe l'IA globalement → tout bascule sur les packs.
- Log de chaque appel (projet, modèle, tokens, latence) dans `project_events` → suivi du
  coût réel et des latences P95 dès le premier jour.

---

## 5. Les images sectorielles

Une **banque interne** constituée à la main (Unsplash/Pexels, licences vérifiées, stockée
sur R2, taguée par pack et par usage : hero / service / galerie / about).
~15–25 images par pack suffisent au MVP.

Pourquoi pas l'API Unsplash à la volée : résultats inégaux (une image moche à la révélation
détruit l'effet), dépendance réseau au pire moment, conditions d'utilisation contraignantes.
La banque interne garantit que **chaque maquette est belle dès la première seconde** —
c'est la contre-mesure du risque R2 (doc 00).

Pas de génération d'images par IA au MVP : coût, latence, et rendu « IA » identifiable qui
dévaloriserait la promesse d'un travail humain.

---

## 6. Trajectoire IA post-MVP

1. **Devis automatique commenté** : `spec → prix` est déterministe, l'IA rédige la
   justification de chaque ligne.
2. **Pré-analyse admin** : résumé du projet + points d'attention + questions à poser au
   client, généré à la soumission (gain de temps réel côté agence).
3. **Import de l'existant** : « Vous avez déjà un site ? » → scrape + extraction vers la
   spec → le tunnel devient aussi un outil de refonte (segment de marché énorme).
4. **Sections composées par IA** pour les pages secondaires (produit B).
