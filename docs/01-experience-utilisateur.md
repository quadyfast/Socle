# 01 — Expérience utilisateur : le parcours en trois actes

> Le document le plus important du projet. Tout le reste est au service de celui-ci.

---

## 1. Le principe directeur : inverser le brief

Le brief place la maquette en récompense finale (étape 8/8). C'est l'erreur classique des tunnels de qualification : **la récompense est derrière l'effort**, donc l'effort est vécu comme un péage.

Le parcours retenu inverse cette logique :

```
ACTE 1 — L'ÉTINCELLE (90 secondes, 5 micro-étapes)
   Le strict minimum pour générer une maquette crédible.
   → RÉVÉLATION : le site apparaît, section par section.

ACTE 2 — L'APPROPRIATION (10–20 minutes, interruptible à volonté)
   Toutes les autres informations sont récupérées ICI,
   présentées comme des améliorations du site que l'utilisateur possède déjà.

ACTE 3 — LA CONCRÉTISATION (3 minutes)
   Récapitulatif, coordonnées, validation, envoi.
```

Trois mécanismes psychologiques portent cette structure :

- **Effet de dotation** : dès la révélation, ce n'est plus « un site », c'est « *mon* site ». On ne quitte pas quelque chose qu'on possède.
- **Effet Zeigarnik** : un site visiblement incomplet (sections marquées « à compléter ») crée une tension qui pousse à finir. C'est pour cela que la complétion est affichée **par section**, pas en un seul pourcentage global.
- **Coût irrécupérable positif** : chaque minute investie dans l'acte 2 renforce la volonté d'aller au bout.

Règle absolue dérivée : **aucune question dont l'effet n'est pas visible dans la maquette n'a le droit d'exister dans l'acte 1.** Dans l'acte 2, toute saisie doit se refléter dans la prévisualisation en moins d'une seconde.

---

## 2. ACTE 1 — L'étincelle, écran par écran

Layout : **une seule question à l'écran**, centrée, grande typographie. Pas de sidebar, pas de menu. Une fine barre de progression en haut (sans numéro de question). Transition entre écrans : sortie fade+slide-up 200 ms, entrée 250 ms, décalées de 80 ms.

### Écran 0 — Landing (avant le tunnel)

- Promesse : **« Voyez votre futur site en 90 secondes. »**
- Sous-titre : « Décrivez votre activité, découvrez votre maquette, nous construisons le reste. »
- Preuve : une animation en boucle (8 s) montrant un tunnel accéléré → maquette qui apparaît.
- Un seul CTA : **« Créer la base de mon site »**. Pas de menu de navigation qui disperse.

### Écran 1 — L'activité (la question la plus importante du produit)

> **« Que faites-vous dans la vie ? »**

Un seul champ, en très grande taille, avec autocomplétion sur un référentiel de ~150 métiers/secteurs français (voir doc 05). Exemples qui tournent en placeholder : *« Photographe de mariage »*, *« Restaurant italien »*, *« Coach sportif »*, *« Association sportive »*…

- La saisie « photographe mar… » propose « Photographe — Mariage ». Un tap suffit.
- Si aucun match : champ libre accepté, classification par IA en arrière-plan (l'utilisateur ne le voit pas), fallback sur le pack générique.
- **Dès la validation : le projet est créé côté serveur** (token anonyme). Tout abandon ultérieur est récupérable.

*Micro-feedback : « Parfait. Nous savons exactement ce qu'il faut à un [photographe de mariage]. » — la reformulation du métier est le premier signal que la plateforme a compris.*

### Écran 2 — Le nom

> **« Sous quel nom exercez-vous ? »**

Champ unique. En dessous, en léger, une **carte de visite virtuelle** se dessine en temps réel avec le nom saisi, dans une typographie élégante — première matérialisation, avant même la maquette.

- Bouton secondaire : « Je n'ai pas encore de nom » → génère un placeholder propre (« Studio [Prénom] ») modifiable plus tard.

### Écran 3 — L'univers visuel

> **« Quel univers ressemble le plus à votre activité ? »**

**4 grandes vignettes** (2×2 sur desktop, carrousel sur mobile). Point crucial : ce ne sont **pas des images génériques** — chaque vignette est un rendu miniature réel du hero de *son* site : son nom, une accroche de son secteur, une image de son métier, dans le thème correspondant.

| Thème | Intention |
|---|---|
| Moderne | Épuré, contrasté, sans-serif, aplats francs |
| Élégant | Serif, tons profonds, espacements généreux |
| Chaleureux | Couleurs chaudes, formes arrondies, photos pleine largeur |
| Minimal | Blanc, typographie fine, presque galerie |

Au survol/tap : la vignette s'agrandit légèrement et **anime un scroll de 2 s** dans la mini-maquette. La sélection déclenche un léger « pulse » de confirmation.

*C'est ici que se produit le premier « c'est mon site » — volontairement placé à l'écran 3, pas à l'écran 8.*

### Écran 4 — L'objectif

> **« Que doit accomplir votre site ? »**

4–6 cartes avec icônes, adaptées au métier détecté (un photographe voit « Montrer mon travail / Être contacté / Vendre mes prestations », un restaurant voit « Donner envie / Être trouvé / Réserver une table »). Un choix principal.

Ce choix pilote le CTA du hero et l'ordre des sections. *Micro-feedback : « Votre page sera construite pour [être contacté]. »*

### Écran 5 — La touche personnelle

> **« En une phrase, qu'est-ce qui vous rend différent ? »**

Champ libre optionnel avec bouton visible « Passer cette étape ». Sert à personnaliser l'accroche générée. Si rempli, la qualité perçue de la maquette monte nettement ; s'il est passé, l'IA se débrouille avec le secteur.

### La Révélation

Écran de transition — le moment le plus travaillé du produit :

1. Fond qui s'assombrit, la barre de progression se transforme en cercle.
2. Messages séquencés (800 ms chacun, ton factuel, pas de fausse magie) :
   *« Analyse de votre activité… » → « Construction de votre structure… » → « Application de votre univers [Élégant]… » → « Rédaction de vos premiers textes… »*
3. La maquette **se construit à l'écran section par section** : header (fade), hero (le nom se « tape » lettre par lettre, l'image se révèle), puis services, témoignages, contact, footer — chacune en slide-up, 400 ms d'intervalle.
4. Silence. Puis, sobrement : **« Voici la première version de votre site. »**

Techniquement : la structure est **déterministe** (pack métier + thème), donc instantanée ; seuls les textes viennent de l'IA en streaming (voir doc 05). La construction progressive absorbe la latence réelle de l'IA — l'attente devient le spectacle. Si l'IA dépasse 6 s, les textes de secours du pack s'affichent et l'IA les remplace silencieusement ensuite.

**Immédiatement après la révélation, sur le même écran :**

> **« Où souhaitez-vous recevoir le lien de votre maquette ? »**

Un champ email, cadré comme un service (le lien de reprise est réellement envoyé), avec en dessous, plus discret : « Continuer sans sauvegarder ». Ne jamais bloquer la suite derrière l'email — le rendre évident, pas obligatoire. C'est le point de capture n°1 du produit.

---

## 3. ACTE 2 — L'appropriation

Changement complet de layout : **la maquette devient l'écran principal** (60–70 % de la largeur sur desktop), le panneau de travail occupe le reste. Sur mobile : maquette en fond, panneau en bottom-sheet coulissante, avec un bouton « Voir mon site » permanent.

### 3.1 Le chantier, pas le formulaire

Le panneau ne présente pas des questions mais des **cartes-chantiers**, chacune liée à une section visible de la maquette :

```
VOTRE SITE — 46 %
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Identité              100 %
✅ Univers visuel        100 %
🔶 Vos services           2/4  ← « Décrivez vos prestations »
⬜ Vos photos             0 %  ← « Remplacez les images provisoires »
🔶 À propos              50 %  ← « Parlez de vous en quelques lignes »
⬜ Contact & horaires     0 %
⬜ Réseaux sociaux        0 %
⬜ Vos pages              suggérées : 5
```

- Cliquer une carte **scrolle la maquette vers la section concernée** et la met en surbrillance douce. Le lien entre « ce que je remplis » et « ce que ça change » est physique, jamais abstrait.
- L'ordre est libre. **Aucune carte n'est obligatoire** pour passer à l'acte 3 (seuil minimal : identité + 1 section de contenu + contact).
- Chaque section incomplète porte, dans la maquette elle-même, un badge discret « À compléter » — la tension Zeigarnik est *dans* le site.

### 3.2 L'édition en place

Autant que possible, l'utilisateur édite **directement dans la maquette** : cliquer le titre du hero le rend éditable, cliquer une image provisoire ouvre le choix remplacer/téléverser. Le panneau sert aux saisies structurées (liste de services, horaires, coordonnées) ; la maquette, à tout ce qui est textuel et visuel.

Chaque frappe se reflète en < 100 ms (état local optimiste, sauvegarde debounced 800 ms, indicateur discret « Enregistré ✓»).

### 3.3 Les chantiers en détail

- **Services/Prestations** : l'IA a pré-rempli 3–4 services typiques du métier avec description. L'utilisateur corrige/supprime/ajoute — **corriger est psychologiquement 10× moins coûteux que rédiger face à un champ vide.** Chaque modification se met à jour dans la carte correspondante de la maquette.
- **Photos & logo** : glisser-déposer, recadrage automatique, compression côté client. Toujours « Passer — nous garderons des visuels provisoires ». Sur mobile, accès direct appareil photo/galerie.
- **Pages** : présentées comme un plan de site visuel (petites vignettes reliées à l'accueil), avec les suggestions du pack métier pré-cochées et justifiées (« Recommandée pour un photographe : la page Galerie est celle que vos visiteurs chercheront en premier »). Ajout de page personnalisée en champ libre.
- **Personnalisation** : couleurs (palette du thème + variantes, jamais un color-picker libre en MVP), 3 paires typographiques par thème, densité des sections. Chaque changement s'applique à toute la maquette instantanément — c'est l'interaction la plus « addictive » du produit, la placer en fin d'acte 2.
- **Réseaux sociaux, horaires, coordonnées** : saisies simples ; apparition immédiate dans le footer/section contact de la maquette.

### 3.4 Le toggle responsive

Trois icônes (desktop/tablette/mobile) au-dessus de la maquette. Le passage en vue mobile est animé (le cadre se resserre, le contenu se réorganise). Petit moment de fierté systématique : *« Votre site est déjà parfaitement adapté au téléphone. »*

### 3.5 Micro-feedbacks de l'acte 2

Une **file de messages unique** (jamais deux toasts simultanés), sobre, dans le panneau :

- Complétion d'une carte : coche animée (300 ms) + le % global s'incrémente avec un léger easing.
- Franchissement de seuils : 60 % → *« Votre site a maintenant une vraie identité. »* ; 80 % → *« Encore un chantier et votre maquette sera complète. »*
- Après une saisie de qualité (description > 200 caractères) : *« Excellent — ce texte donnera un vrai caractère à votre page. »*

Interdits : confettis, sons, mascottes, points/badges, exclamations multiples. Le registre est celui d'un architecte qui valide, pas d'un jeu mobile.

### 3.6 Quitter et revenir

- Sauvegarde continue : fermer l'onglet ne perd rien.
- Si email connu : relance à H+24 — objet *« Votre site vous attend (78 %) »* — avec une **capture réelle de sa maquette** dans l'email et un lien de reprise qui rouvre exactement où il en était.

---

## 4. ACTE 3 — La concrétisation

Déclenché par le CTA permanent « Finaliser mon projet » (actif dès le seuil minimal, mis en avant à 80 %).

1. **Plein écran sur la maquette** — dernier tour, navigation libre, toggle responsive. *« Voici votre site tel que nous le construirons. »*
2. **Récapitulatif** en cartes éditables (activité, objectif, pages, style, contenu fourni, réseaux) — chaque carte a un lien « modifier » qui ramène au chantier concerné.
3. **Qualification douce** (2 questions, optionnelles) : échéance souhaitée / budget envisagé. Posées ici car l'engagement est maximal ; elles alimentent le score de lead côté admin.
4. **Coordonnées** : nom, téléphone (email déjà connu dans la plupart des cas).
5. **Consentement explicite** : « Je confirme que ces informations correspondent à ce que je souhaite pour mon futur site » + case RGPD distincte.
6. **« Envoyer mon projet »** → confirmation : *« Votre projet est entre nos mains. Vous recevrez une réponse sous 24 h ouvrées. »* + email récapitulatif avec lien permanent vers la maquette (consultable, plus éditable).

L'utilisateur garde l'accès en lecture à sa maquette : c'est son objet, et le lien se partage (« regarde mon futur site ») — canal d'acquisition gratuit.

---

## 5. Adaptation contextuelle : les packs métiers

L'« intelligence » perçue du tunnel vient à 90 % de contenus déterministes, pas de l'IA (latence nulle, coût nul, qualité maîtrisée — voir doc 05).

Un **pack métier** définit : la question de spécialisation (écran 1 bis, ex. photographe → « Quel type de photographie ? »), les objectifs proposés, les sections et pages recommandées avec justification, 3–4 services pré-rédigés, le champ lexical des accroches, les mots-clés d'images sectorielles, et les micro-feedbacks spécifiques.

MVP : **12 packs** couvrant l'essentiel de la cible (photographe, restaurant, artisan BTP, coiffure/beauté, coach/bien-être, thérapeute, consultant, commerce local, association, profession libérale, créateur/artiste, générique). Le pack générique garantit qu'aucun métier n'est orphelin. L'IA n'intervient que pour : classifier un métier hors référentiel, rédiger les textes personnalisés, et affiner les suggestions à partir de la phrase de différenciation.

---

## 6. Détails d'exécution qui font la différence

| Détail | Règle |
|---|---|
| Latence perçue | Toute action < 100 ms de feedback visuel ; toute attente > 400 ms a une animation dédiée |
| Animations | 150–400 ms, `ease-out`, jamais de bounce ; respect de `prefers-reduced-motion` |
| Barre de progression | Ne recule **jamais** (même si l'utilisateur supprime du contenu) |
| Textes IA | Toujours présentés comme « premiers textes » modifiables — jamais comme définitifs |
| Images provisoires | Belles et sectorielles, avec badge « provisoire » — jamais de gris placeholder |
| Champ vide | N'existe pas : tout champ a un exemple ou une pré-rédaction à corriger |
| Erreurs | Jamais bloquantes en cours de tunnel ; validation seulement à l'acte 3 |
| Mobile | Le tunnel de l'acte 1 doit être **parfait** sur mobile (50 %+ du trafic attendu) ; l'acte 2 est utilisable sur mobile, optimal sur desktop — l'email de reprise dit « retrouvez votre site sur ordinateur pour le personnaliser confortablement » |
| Accessibilité | Navigation clavier complète, focus visibles, contrastes AA sur les 4 thèmes |
| Ton | Vouvoiement, phrases courtes, zéro jargon (« univers » et non « thème », « chantier » et non « formulaire ») |

---

## 7. Le parcours résumé

```
Landing « Voyez votre futur site en 90 s »
  ↓
ACTE 1 — 5 écrans : métier → nom → univers (4 aperçus DE SON site) → objectif → différence
  ↓
RÉVÉLATION — le site se construit sous ses yeux, textes IA en streaming
  ↓
Capture email (service, pas péage)
  ↓
ACTE 2 — maquette au centre, cartes-chantiers, édition en place,
          complétion par section, personnalisation, responsive
  ↓  (interruptible — reprise par lien email)
ACTE 3 — plein écran → récapitulatif → qualification → coordonnées → consentement
  ↓
« Envoyer mon projet » → admin + email de confirmation avec lien permanent
```
