# Socle — Feuille de route

> Document de travail. À relire au début de chaque session, à cocher au fur et à mesure.
> Prototype : `prototype/maquette-parcours.html` — un seul fichier, sans étape de compilation.

---

## Où on en est

**Le parcours client est complet, testé, et fonctionne hors ligne.**
Accueil → tunnel adaptatif → révélation → atelier guidé → studio → récapitulatif → envoi → verrouillage.

| Brique | État |
|---|---|
| Parcours client de bout en bout | ✅ |
| 97 métiers · 10 univers métier | ✅ |
| 7 univers visuels · 8 mises en page · composition unique par client | ✅ |
| Logo client (envoi, 3 modes, fond sombre) | ✅ |
| Sauvegarde du brouillon + images redimensionnées | ✅ |
| Espace atelier (projets, statuts, messages, export) | ⚠️ en mémoire |
| Schéma Supabase + fonctions serveur + tests | ✅ écrits, ❌ non déployés |
| Galerie de réalisations | ⚠️ exemples de démonstration |
| Banque de visuels | ⚠️ source de qualité inégale |

**Le seul vrai blocage : rien n'est déployé.** Tout vit en mémoire, tout disparaît au rechargement.

---

## Décisions verrouillées — ne pas les rejouer

1. **Le client n'a aucun accès à sa maquette après envoi.** Ni lien, ni export, ni partage.
   Appliqué par la base (RLS), pas seulement par l'interface. Le brouillon local est effacé à l'envoi.
2. **L'unicité est déterministe, jamais aléatoire.** Pas de `Math.random()` dans le design.
3. **Ce que le client produit est une maquette de travail**, entièrement retravaillée ensuite.
4. **Pile : Vercel + Supabase + Resend + GitHub.** Les écritures passent par une fonction serveur.
5. **Pinterest = entrée de brief, jamais source d'images.**
6. **Tu héberges les sites clients. Le domaine est au nom du client.** Toujours.
7. **Abonnement obligatoire la première année**, puis résiliable mensuellement.
8. **Sites clients sur Cloudflare Pages** — l'offre gratuite de Vercel interdit l'usage commercial.
9. **Étape 1 terminée à 100 % avant l'étape 2.**

---

# L'ORDRE

## Étape 1 — Mettre en ligne `← on est ici`

Objectif : un vrai client peut envoyer un projet, et tu le reçois.

| # | Quoi | Qui | État |
|---|---|---|---|
| 1.1 | Projet Supabase (région Europe) + `supabase/schema.sql` | toi | ✅ 7/7 vérifications OK |
| 1.2 | Compte atelier + inscriptions publiques désactivées | toi | ✅ |
| 1.5 | Brancher le prototype sur `/api/projet` | moi | ✅ testé en local et en ligne simulée |
| 1.6 | Espace atelier connecté à Supabase + authentification | moi | ✅ |
| **1.3** | **Resend : vérifier le domaine (DNS)** | **toi** | ⏳ 30 min + attente DNS |
| **1.4** | **Cloudflare Turnstile : les deux clés** | **toi** | ⏳ 5 min |
| **1.a** | **Renseigner `CONFIG` + vérifier que RLS bloque bien les anonymes** | ensemble | ⏳ |
| 1.7 | Dépôt GitHub + import Vercel + variables d'environnement | toi | ✅ https://socle-iota.vercel.app |
| 1.8 | Test de bout en bout en ligne | ensemble | ✅ projet #1042 créé et vérifié |

**Le site est en ligne et fonctionnel.** Un projet envoyé depuis le site atterrit en base ;
un visiteur non connecté ne peut rien lire ; l'espace atelier exige une connexion.

- [x] `TURNSTILE_SECRET_KEY` — anti-robot **actif et vérifié** : envoi réussi avec jeton validé par Cloudflare
- [ ] `RESEND_API_KEY` — dernier réglage manquant. Sans elle, aucun email n'est envoyé
      (le projet est quand même enregistré : l'échec d'email ne fait jamais perdre un projet)
- [ ] Supprimer `api/diagnostic.js` une fois Resend en place

> ⚠️ Ne pas faire tourner l'application complète dans le panneau d'aperçu de Claude :
> la page est trop lourde et fait planter l'outil. Tester directement sur le site en ligne.

## Étape 2 — Faire tester par de vraies personnes

À faire **avant** d'investir dans les polices, les images et le légal : ce qu'on apprendra
peut réorienter le reste.

- [ ] Montrer le site à **3 personnes de la cible** (un artisan, un commerçant, un indépendant)
- [ ] Les laisser faire **sans aider**, noter où elles hésitent et où elles abandonnent
- [ ] Corriger ce qui bloque avant d'aller plus loin

## Étape 3 — La qualité visuelle

- [ ] **Vraies polices** sous licence — principal écart restant avec le marché
- [ ] Clé Unsplash ou Pexels à la place de LoremFlickr (une seule fonction à changer)
- [ ] Sélection manuelle de ~40 photos pour les 5 métiers principaux
- [ ] Remplacer les 6 réalisations de démonstration par tes vrais projets

## Étape 4 — Le légal

- [ ] Mentions légales, politique de confidentialité, CGV
- [ ] Purge automatique des données (3 ans après le dernier contact)
- [ ] Procédure d'effacement sur demande, fichiers inclus
- [ ] Bandeau cookies si tu ajoutes une mesure d'audience

## Étape 5 — Le commercial

- [ ] **Fixer les prix** — repère marché : 500 à 3 000 € pour ta cible
- [ ] Fixer l'abonnement mensuel (20 à 50 €) et ce qu'il inclut
- [ ] Afficher un **« à partir de X € »** sur le site — qualifie avant l'appel
- [ ] Devis type + contrat (clauses prêtes dans `docs/08-procedures-client.md`)
- [ ] Lien de paiement Stripe pour l'acompte (30 à 40 %)

## Étape 6 — Les premiers clients

- [ ] Livrer **3 vrais sites** de bout en bout
- [ ] Mettre en place le tableau de suivi des domaines et des échéances
- [ ] En tirer les leçons avant d'industrialiser

---

## Étape 7 — Plus tard

- [ ] **« Votre présence professionnelle en 1 minute »** — l'aimant à trafic, version indépendants
      (surtout pas « CV pour chercheurs d'emploi » : ce public ne devient jamais client)
- [ ] Champ « vos inspirations » : lien Pinterest ou sites appréciés
- [ ] Mini test visuel : six ambiances, le client en choisit deux
- [ ] IA à la place du lexique de mots-clés (l'architecture est prête)
- [ ] Génération du vrai site depuis la maquette validée

---

## Ce qu'on ne fait pas maintenant

- ❌ Nouvelles mises en page ou nouveaux univers — il y en a assez
- ❌ Nouveaux métiers — 97 suffisent
- ❌ Étape 7 avant la fin de l'étape 6
- ❌ Éditeur avancé pour le client — ce n'est pas le produit

---

## Questions ouvertes

| Question | Effet |
|---|---|
| Prix du site et de l'abonnement | **bloque la vente** |
| Montant de l'acompte (reco : 30–40 %) | à trancher étape 5 |
| Minutes de modifications incluses (reco : 30/mois) | à trancher étape 5 |
| Quelle police display acheter | à trancher étape 3 |
| Nom définitif (**Socle** recommandé, gardé par défaut) | avant l'achat du domaine |

---

## Méthode de travail

- Vérifier par la mesure, pas par l'intuition.
- Signaler les défauts trouvés, y compris les miens.
- Livrer une version testée, puis converger en deux ou trois passes.
