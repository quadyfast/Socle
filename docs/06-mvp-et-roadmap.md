# 06 — Périmètre MVP et feuille de route

---

## 1. La ligne de partage

**Critère unique d'inclusion au MVP :** la fonctionnalité est-elle nécessaire pour que
*(a)* un prospect vive le parcours 3 actes jusqu'à la soumission, ou
*(b)* l'admin transforme cette soumission en devis ?
Tout le reste attend.

### ✅ MVP (v1 commercialisable)

**Tunnel & studio**
- Landing + acte 1 complet (5 écrans, autocomplétion métiers, transitions)
- 12 packs métiers + pack générique
- Révélation animée avec textes IA en streaming + fallback packs
- 4 thèmes × variantes de palette/typo — travaillés au pixel
- Sections : hero, services, about, gallery, testimonials, menu, faq, contactBlock, ctaBanner, footer
- Studio : cartes-chantiers, édition en place, complétion par section, toggle responsive
- Uploads logo/photos (R2, recadrage, compression, strip EXIF)
- Sélection de pages (suggestions justifiées + page personnalisée)
- Personnalisation : palettes, paires typo, densité
- Capture email + lien de reprise + relances H+24 / J+3
- Acte 3 : plein écran, récapitulatif, qualification, consentements, soumission
- Vue publique partageable en lecture seule

**IA**
- Classification métier (Haiku) + rédaction home (Sonnet, streaming) + « Reformuler » plafonné
- Feature flag de coupure, budgets, logs de coût

**Admin**
- Auth magic link (liste blanche), kanban 5 statuts, fiche projet complète,
  score de lead, demandes d'info ciblées, export PDF du brief, vue brouillons abandonnés

**Socle**
- PostgreSQL UE + Drizzle, specs versionnées, `project_events`
- RGPD complet (purge 90 j, suppression cascade, politique de confidentialité, DPA)
- PostHog EU (funnel instrumenté AVANT lancement), Sentry, rate limiting
- CI + Playwright sur le parcours complet, backups PITR

### 🕐 Phase 2 (après premiers clients payants)

- Devis automatique 3 formules depuis la spec + acompte Stripe
- Édition de la maquette par l'admin
- Pré-analyse IA des projets soumis côté admin
- 10–15 packs métiers supplémentaires (guidés par les données réelles du champ libre)
- Import/refonte d'un site existant
- Undo visible côté studio (les versions existent déjà)
- Composition des pages secondaires (pas seulement la home)

### 🔭 Phase 3 (produit B)

- Export statique du `SiteSpec` → site réel déployé (mêmes composants)
- Comptes clients, paiements récurrents (maintenance), éditeur post-livraison
- Formulaire de contact fonctionnel, SEO, domaines clients

### ❌ Explicitement hors roadmap tant que rien ne le justifie

Drag & drop libre, messagerie temps réel, multi-langue, e-commerce, blog géré,
app mobile, marketplace de templates.

---

## 2. Ordre de construction (≈ 10–12 semaines à temps plein)

Le principe : **le renderer d'abord** — tout le reste s'y branche.

| Sem. | Livrable | Critère de sortie |
|---|---|---|
| 1–2 | `SiteSpec` (Zod) + `site-renderer` + les 4 thèmes + toutes les sections | Une spec JSON écrite à la main rend une home magnifique dans les 4 thèmes, responsive |
| 3 | 12 packs métiers + banque d'images sectorielles | Chaque pack rend une belle maquette sans IA |
| 4 | Tunnel acte 1 + création projet + autosave | Parcours écran 0 → 5 fluide, mobile parfait |
| 5 | Révélation + intégration IA streaming + fallbacks | La révélation est spectaculaire même API coupée |
| 6–7 | Studio complet (chantiers, édition en place, uploads, pages, personnalisation) | Un vrai utilisateur complète son site sans aide |
| 8 | Acte 3 + emails (capture, reprise, relances, confirmation) | Soumission de bout en bout |
| 9 | Admin (kanban, fiche, demandes d'info, PDF) | Un projet soumis est traité en < 5 min |
| 10 | RGPD, sécurité, rate limiting, analytics, Playwright, backups | Checklist de mise en prod verte |
| 11–12 | **Beta fermée : 10–15 vrais utilisateurs observés** + corrections | Taux de révélation > 60 % sur la beta |

La semaine 11–12 n'est pas du confort : le doc 01 est une hypothèse tant que de vrais
artisans et photographes ne l'ont pas traversée sous vos yeux. C'est là que le tunnel
se règle (formulations, étapes qui bloquent, latences perçues).

---

## 3. Décisions à prendre avant la semaine 1

1. **Nom + domaine** de la plateforme.
2. **Les 12 secteurs** exacts des packs (selon ta cible commerciale locale réelle).
3. **Fourchettes de prix** des 3 formules (affichées ou non à la validation — je
   recommande : affichées, c'est un filtre de leads sain).
4. Vercel vs VPS UE (Vercel pour démarrer ; la question se repose à volume).
5. Direction artistique des 4 thèmes (moodboards avant d'écrire le CSS).
