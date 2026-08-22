# Socle — Feuille de route

> Document de travail. À relire au début de chaque session, à cocher au fur et à mesure.
> Application : `public/index.html` — un seul fichier, sans étape de compilation.
> **Le nom du produit est Socle.** « ChantierStudio » est le surnom de travail de l'offre
> commerciale, en attendant d'être absorbé ici. Un seul projet, deux noms provisoires.
> Le brief commercial et la direction artistique sont dans `CLAUDE.md`.

---

## Où on en est

**Le site est en ligne, la chaîne complète est vérifiée en production.**
Accueil → tunnel adaptatif → révélation → atelier guidé → studio → récapitulatif → envoi → verrouillage.
Identité visuelle « Nuit d'atelier » appliquée à toute la plateforme.

| Brique | État |
|---|---|
| Parcours client de bout en bout | ✅ |
| 97 métiers · 10 univers métier | ✅ |
| 7 univers visuels · 8 mises en page · composition unique par client | ✅ |
| Logo client (envoi, 3 modes, fond sombre) | ✅ |
| Sauvegarde du brouillon + images redimensionnées | ✅ |
| Espace atelier (projets, statuts, messages, export) | ✅ sur Supabase, accès authentifié |
| Schéma Supabase + fonctions serveur + tests | ✅ déployés, 24 vérifications passent |
| Galerie de réalisations | ⚠️ exemples de démonstration |
| Banque de visuels | ⚠️ source de qualité inégale |
| Identité « Nuit d'atelier » + page d'accueil démonstrative | ✅ |

**Le prochain pas ne dépend plus du code : il faut des vrais utilisateurs devant le site.**
Voir l'étape 2.

---

## L'offre — fixée (voir `CLAUDE.md`)

Cible : **professionnels du bâtiment, 50 km autour de Rouen.** Démarchage octobre 2026.
Micro-entreprise, facturation TTC, TVA non applicable (art. 293 B du CGI).

| Offre | Prix | Contenu |
|---|---|---|
| Vitrine | **1 400 € TTC** one-shot | sur mesure, mobile-first, formulaire devis, fiche Google Business, 3 semaines |
| Signature | **2 600 € TTC** one-shot | Vitrine + captation drone + visite 3D (Gaussian Splatting) + vidéo réseaux |
| Visibilité | **200 € TTC/mois** | Google Ads, mises à jour, rapport mensuel — budget pub payé par le client à Google |
| Étage supérieur | 3 500–6 000 € + 300–500 €/mois | promoteurs, constructeurs, immobilier haut de gamme |

**Le différenciant n'est pas le code — c'est l'asset.** Drone, photogrammétrie, splat Luma,
Revit/Twinmotion : aucune agence rouennaise ne fournit ça. Le niveau visuel « Apple » tient
au contenu exclusif, pas aux effets.

**Le haut de panier se vise sur Signature et au-dessus.** À 1 400 €, une page faite main
à la Apple n'est pas rentable : la Vitrine reste le produit d'entrée, propre mais standard.

---

## Décisions verrouillées — ne pas les rejouer

1. **Le client n'a aucun accès à sa maquette après envoi.** Ni lien, ni export, ni partage.
   Appliqué par la base (RLS), pas seulement par l'interface. Le brouillon local est effacé à l'envoi.
2. **L'unicité est déterministe, jamais aléatoire.** Pas de `Math.random()` dans le design.
3. **Ce que le client produit est une maquette de travail**, entièrement retravaillée ensuite.
4. **Pile : Vercel + Supabase + Resend + GitHub.** Les écritures passent par une fonction serveur.
5. **Pinterest = entrée de brief, jamais source d'images.**
6. **Tu héberges les sites clients. Le domaine est au nom du client.** Toujours.
7. ~~**Abonnement obligatoire la première année**~~ — **remplacé.** Le site se vend
   one-shot ; l'abonnement Visibilité est optionnel, sans engagement au-delà de 3 mois.
8. **Sites clients sur Cloudflare Pages** — l'offre gratuite de Vercel interdit l'usage commercial.
   ⚠️ Vaut aussi pour Socle lui-même : `socle-iota.vercel.app` est un produit commercial.
   Vérifier le plan Vercel, ou basculer Socle sur Cloudflare.
9. **Étape 1 terminée à 100 % avant l'étape 2.**

---

# L'ORDRE

## Étape 1 — Mettre en ligne

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

- [x] `TURNSTILE_SECRET_KEY` — anti-robot actif et vérifié
- [x] `RESEND_API_KEY` — email de notification reçu
- [x] `api/diagnostic.js` supprimé (récupérable dans l'historique git si besoin)

**ÉTAPE 1 TERMINÉE.** Chaîne complète vérifiée en production :
formulaire → anti-robot Cloudflare → base Supabase → email Resend.

> ⚠️ Ne pas faire tourner l'application complète dans le panneau d'aperçu de Claude :
> la page est trop lourde et fait planter l'outil. Tester directement sur le site en ligne.
>
> ⚠️ Garder les clés et mots de passe **hors du dossier du projet**. GitHub a déjà bloqué
> un push contenant une clé Resend laissée dans un `.txt` à la racine.

**Limite connue** : sans domaine vérifié chez Resend, les emails ne partent que vers
votre propre adresse. Les clients ne reçoivent pas encore leur accusé de réception.

## Étape 2 — Faire tester par de vraies personnes `← on est ici`

À faire **avant** d'investir dans les polices, les images et le légal : ce qu'on apprendra
peut réorienter le reste.

- [ ] Montrer le site à **3 personnes de la cible réelle** : un maçon, un couvreur,
      un électricien ou plombier — pas un panel généraliste, la cible est le bâtiment
- [ ] Les laisser faire **sans aider**, noter où elles hésitent et où elles abandonnent
- [ ] Corriger ce qui bloque avant d'aller plus loin

**Passe d'identité (16 août)** — faite entre l'étape 1 et l'étape 2, pour que le site
soit présentable avant de le montrer :
identité « Nuit d'atelier » (bleu-nuit, crème, ambre) · page d'accueil qui démontre au lieu
de décrire · cartes de choix à pictogrammes · nettoyage des couleurs héritées du thème clair.

## Étape 3 — La qualité visuelle

**Ligne d'arrivée de Socle.** « Finir Socle », c'est cette liste et rien de plus.
Une fois cochée, on n'y retouche plus avant les premiers clients : on passe au site
de démonstration. Tout ajout ici doit être refusé par défaut.

- [x] **Vraies polices** — faites. Space Grotesk (titres de la plateforme), Inter (texte),
      Marcellus (rôle serif des maquettes). SIL OFL, rien payé.
      **Auto-hébergées** dans `public/fonts/` : aucune requête vers Google, donc aucun
      transfert d'IP à un tiers — à rappeler dans la politique de confidentialité.
      Trois rôles et non deux : `--f-display` reste **le rôle serif des maquettes clients**
      (élégant, naturel, studio, paire typo B). Le détourner effacerait le contraste
      serif/sans qui distingue les 7 univers visuels. Les titres de Socle ont `--f-titre`.
- [ ] Clé Unsplash ou Pexels à la place de LoremFlickr (une seule fonction à changer)
- [ ] Sélection manuelle de ~40 photos pour les métiers du bâtiment prioritaires
- [x] **Desserrer la composition** — fait, en unités de conteneur (`cqw`) et non en pixels
      fixes : la même maquette doit tenir dans la vignette de 290 px, dans le studio et en
      plein écran. Sections 64 → 48–124 px, hero 64 → 56–150 px, titres +28 %.
      La hiérarchie entre univers est préservée (élégant et studio restent les plus aérés).
      **À regarder de tes yeux** : je ne peux pas charger cette page dans l'aperçu.
- [ ] **Une idée par écran** — le vrai pas suivant, et il est structurel : sections en pleine
      hauteur avec une seule affirmation. Demande des allers-retours visuels, donc à faire
      avec toi devant l'écran, pas en aveugle.
- [ ] Remplacer les 6 réalisations de démonstration — voir étape 3 bis

## Étape 3 bis — Le site de démonstration

Le meilleur de ce qu'on sait produire, en un seul objet. Il sert de vitrine, de preuve
et de terrain d'essai. C'est le manque le plus coûteux aujourd'hui : sans lui, un prospect
n'a rien à regarder, et l'offre Signature vend quelque chose de jamais réalisé.

**Trois règles qui décident de son efficacité :**

1. **Une vraie entreprise, pas une fictive.** Une société inventée se sent, et on ne peut
   pas dire « appelez-les ». Une vraie donne des photos réelles, un témoignage et
   un numéro qui répond. Un proche, un contact CALDEA, ou ta propre micro-entreprise.
2. **Au niveau Signature, pas Vitrine.** La démo fixe le plafond : si tu montres une
   Vitrine, tu vends des Vitrines. Montre le drone et la visite 3D — la Vitrine devient
   alors l'option d'entrée vers laquelle on redescend, pas le sommet de ton offre.
3. **Le kit de livraison sort de là.** Les 4 templates cités dans `CLAUDE.md` n'existent
   dans aucun dossier. Ne pas les écrire dans le vide : construire ce site réel d'abord,
   puis en extraire les gabarits. Un template tiré d'un cas réel tient, l'inverse non.

- [ ] Choisir l'entreprise et obtenir son accord écrit (droit d'image, droit de montrer)
- [ ] **Vérifier les autorisations de vol drone** — si le chantier vient de l'alternance,
      accord de l'employeur ET du maître d'ouvrage. À régler avant de sortir le drone.
- [ ] Captation drone + photogrammétrie / splat Luma
- [ ] Construire le site : scroll-scrubbing GSAP, sections pinned, une idée par écran
- [ ] **Chronométrer chaque poste** — c'est la seule façon de savoir si 2 600 € couvre
      le temps réel d'une Signature. À faire avant de la facturer à un vrai client.
- [ ] Mettre le site en ligne et le brancher dans la galerie de réalisations de Socle
- [ ] En extraire les gabarits réutilisables

## Étape 4 — Le légal

- [ ] Mentions légales, politique de confidentialité, CGV
- [ ] Purge automatique des données (3 ans après le dernier contact)
- [ ] Procédure d'effacement sur demande, fichiers inclus
- [ ] Bandeau cookies si tu ajoutes une mesure d'audience

## Étape 5 — Le commercial

- [x] **Prix fixés** — 1 400 € / 2 600 € / 200 €/mois (voir « L'offre » plus haut)
- [x] Abonnement défini : Visibilité, 200 €/mois, optionnel, sans engagement au-delà de 3 mois
- [ ] Afficher **« à partir de 1 400 € TTC »** sur le site — qualifie avant l'appel
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
- ❌ Nouveaux métiers **hors bâtiment** — les 97 existants suffisent largement
- ⚠️ En revanche le pack `artisan` est trop maigre pour la cible réelle : il faudra le
      creuser (maçon, couvreur, charpentier, électricien, plombier, terrassier, carreleur…)
- ❌ Étape 7 avant la fin de l'étape 6
- ❌ Éditeur avancé pour le client — ce n'est pas le produit

---

## Questions ouvertes

Réglées par le brief `CLAUDE.md` : prix, abonnement, police display (Space Grotesk,
libre), nom du produit (**Socle**).

| Question | Effet |
|---|---|
| **Qui paie l'hébergement d'un client sans abonnement ?** Le site est vendu one-shot, mais la décision n°6 dit que tu héberges. Coût et responsabilité sans revenu en face | à trancher avant le 1er client |
| **Le plan Vercel de Socle** couvre-t-il l'usage commercial ? (voir décision n°8) | risque contractuel |
| Montant de l'acompte (reco : 30–40 %) | à trancher étape 5 |
| Minutes de modifications incluses (reco : 30/mois) | à trancher étape 5 |
| Faut-il un domaine `socle` ou `chantierstudio` ? Le surnom parle mieux à la cible BTP que le nom du produit | avant l'achat du domaine |

---

## Méthode de travail

- Vérifier par la mesure, pas par l'intuition.
- Signaler les défauts trouvés, y compris les miens.
- Livrer une version testée, puis converger en deux ou trois passes.
