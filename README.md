# Plateforme de création de sites — Spécification complète

Conception d'une plateforme qui transforme le brief d'un futur site web en
**expérience de création interactive** : le prospect construit la base de son site,
voit sa maquette évoluer en temps réel, la valide — et le projet complet arrive
dans l'espace administrateur, prêt à être transformé en vrai site.

## Les documents

| # | Document | Contenu |
|---|---|---|
| 00 | [Produit et stratégie](docs/00-produit-et-strategie.md) | Positionnement, risques, arbitrages, modèle économique, KPI. **À lire en premier : contient les désaccords avec le brief initial et leurs justifications.** |
| 01 | [Expérience utilisateur](docs/01-experience-utilisateur.md) | Le parcours en 3 actes, écran par écran : micro-interactions, animations, révélation, psychologie, packs métiers côté UX |
| 02 | [Architecture technique](docs/02-architecture-technique.md) | Stack, frontend, backend, API, auth, sécurité, RGPD, sauvegardes, mise en prod, évolution |
| 03 | [SiteSpec — modèle de données](docs/03-sitespec-modele-de-donnees.md) | Le JSON typé qui est le produit : schéma Zod, cycle de vie, schéma SQL |
| 04 | [IA et packs métiers](docs/04-ia-et-packs-metiers.md) | Répartition déterministe/IA, prompts, streaming, coûts, images sectorielles |
| 05 | [Espace administrateur](docs/05-espace-admin.md) | Pipeline kanban, fiche projet, demandes d'info, notifications |
| 06 | [MVP et roadmap](docs/06-mvp-et-roadmap.md) | Périmètre v1 / phase 2 / phase 3, plan de construction sur 12 semaines |

## Les 3 décisions structurantes

1. **La maquette est révélée à 90 secondes**, pas à la fin — le questionnaire continue
   *après*, en mode « améliorez votre site » (effet de dotation).
2. **L'IA ne génère jamais de HTML** — elle remplit un `SiteSpec` JSON validé, rendu par
   des composants React. La maquette et le futur vrai site sont le même objet.
3. **MVP = tunnel + agence** (produit A), avec l'architecture qui permet la génération
   automatique du vrai site (produit B) sans rien réécrire.
