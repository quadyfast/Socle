# 00 — Produit, positionnement et arbitrages

> Ce document contient les désaccords et les recommandations stratégiques.
> Il est volontairement placé en premier : les choix ici conditionnent toute l'architecture.

---

## 1. Ce que le projet est réellement

Le brief décrit **deux produits différents** qui n'ont pas la même économie ni la même technique.

| | Produit A — Tunnel de création + agence | Produit B — Builder SaaS auto-génératif |
|---|---|---|
| Promesse | « Créez la base de votre site, on le construit » | « Créez et publiez votre site vous-même » |
| Livrable | Une maquette + un brief ultra-qualifié | Un site en ligne |
| Revenu | Prestation (800–3 000 €) | Abonnement (10–30 €/mois) |
| Concurrence | Agences locales, freelances | Wix ADI, Durable, Hostinger AI, Framer AI, 10Web |
| Effort technique | 2–3 mois | 12–18 mois |

Les §1 à 17 décrivent A. Le §19 décrit B.

**Recommandation : lancer A, avec l'architecture de B.**

C'est réalisable si — et seulement si — la maquette n'est pas une image ou un mockup figé, mais une **structure de données** (`SiteSpec`, voir doc 04) rendue par des composants réels. Le jour où tu passes à B, « générer le vrai site » consiste à exporter ce même JSON vers un build statique. Rien n'est à refaire.

Si à l'inverse le MVP produit une maquette « faussée » (capture d'écran, template figé, HTML généré par IA à la volée), le passage à B impose de tout réécrire.

> **C'est la décision d'architecture la plus structurante du projet.**

---

## 2. Le différenciateur n'est pas la technologie

Wix ADI fait déjà « questionnaire → site généré » depuis 2016, gratuitement, avec 500 ingénieurs. Tenter de gagner sur ce terrain est perdu d'avance.

Ce sur quoi tu peux réellement gagner :

1. **La spécialisation métier française.** Un tunnel qui *sait* ce qu'est un photographe de mariage, un ostéopathe, un artisan couvreur, une association loi 1901 — avec les bonnes sections, le bon vocabulaire, les bonnes mentions légales. Les outils américains sont génériques et traduisent mal.
2. **L'humain derrière.** Le résultat final n'est pas un template auto-généré : c'est un vrai site fait par une personne. C'est *exactement* ce que la cible TPE veut et que l'IA seule ne rassure pas.
3. **Le tunnel lui-même comme argument de vente.** Une TPE qui a vu sa maquette en 90 secondes est déjà convaincue de la qualité de ton travail. Tu ne vends plus un devis abstrait.

**Conséquence sur la copy :** ne jamais laisser croire que la plateforme livre le site gratuitement. Le cadrage est *« Découvrez gratuitement à quoi ressemblerait votre site. Nous le construisons ensuite pour vous. »*

---

## 3. Les cinq risques réels et leur contre-mesure

### R1 — L'abandon en cours de tunnel (risque n°1)
Un tunnel de 30 questions convertit à 10–20 %. Un tunnel qui donne la récompense à 90 s convertit à 45–60 %.
→ **Contre-mesure : architecture en 3 actes** (doc 01). Maquette révélée après 5 micro-étapes.

### R2 — La maquette décevante
Si l'utilisateur voit un wireframe gris avec « Lorem ipsum », l'effet s'inverse : il conclut que ton travail sera médiocre.
→ **Contre-mesure :** textes réels générés par IA + images sectorielles automatiques (banque Unsplash/Pexels filtrée par secteur) + 4 thèmes travaillés au pixel. Une maquette moche est pire que pas de maquette.

### R3 — La friction upload
Demander logo + photos en plein tunnel, sur mobile, est le point de rupture le plus violent. La personne n'a pas son logo sous la main.
→ **Contre-mesure :** aucun upload avant la révélation. Après, toujours optionnel, toujours avec « Passer — nous utiliserons des visuels provisoires ». Relance par email 24 h plus tard avec un lien de reprise.

### R4 — La perte des abandons
Sans email, un abandon à l'étape 6 est perdu à 100 %.
→ **Contre-mesure :** projet créé et persisté côté serveur **dès la première réponse**, sous token anonyme. Email demandé juste après la révélation, cadré comme un service (« où vous envoyer le lien de votre maquette ? »), jamais comme un péage. Séquence de relance sur les abandons ayant laissé un email.

### R5 — La qualité des leads
Un tunnel gratuit et amusant attire des curieux sans budget.
→ **Contre-mesure :** une question de qualification tardive et non bloquante (« Quand souhaitez-vous que votre site soit en ligne ? » / « Avez-vous déjà un budget en tête ? ») posée **après** la révélation, quand l'engagement est maximal. Et un tri par score dans l'admin.

---

## 4. Améliorations que je recommande d'ajouter au brief

| # | Ajout | Pourquoi |
|---|---|---|
| A1 | **Révélation à 90 s**, questionnaire poursuivi ensuite | Multiplie la conversion par 2–3 |
| A2 | **Choix du style dès l'étape 3, en montrant 4 aperçus du site de l'utilisateur** (pas des vignettes génériques) | Le moment « c'est mon site » arrive très tôt |
| A3 | **Génération en streaming visible** (les sections se remplissent une par une) | Transforme 12 s d'attente en meilleur moment du produit |
| A4 | **Sauvegarde + lien de reprise systématique** | Récupère 15–25 % des abandons |
| A5 | **Score de complétion par section du site**, pas un seul % global | Plus honnête, plus actionnable, crée plusieurs tensions de Zeigarnik au lieu d'une |
| A6 | **Paiement d'acompte en ligne (Stripe) à la validation** — phase 2 | Transforme un lead en client dans le même élan |
| A7 | **Analytics produit par étape dès le jour 1** (PostHog EU) | Sans le taux d'abandon par étape, tu optimises à l'aveugle |
| A8 | **Packs métiers déterministes** plutôt que questions générées par IA | Latence nulle, coût nul, qualité maîtrisée |

---

## 5. Ce que je recommande de **ne pas** construire au MVP

- L'éditeur drag & drop. Coût énorme, valeur faible pour la cible, et concurrence frontale avec les builders.
- Les comptes utilisateurs classiques (mot de passe, profil, réinitialisation). Un magic link suffit.
- Le blog, la réservation en ligne, le multi-langue, l'e-commerce. Ce sont des cases à cocher dans le brief, pas des fonctionnalités à développer.
- La messagerie temps réel client/admin. Un email + un lien de reprise couvrent 95 % des cas.
- La navigation multi-pages dans la maquette. Une page d'accueil complète + la liste des autres pages suffit à convaincre.

Chacun de ces éléments est prévu dans le modèle de données (doc 04) pour être ajouté sans migration douloureuse.

---

## 6. Modèle économique suggéré

```
Maquette gratuite  →  Validation du projet  →  Devis automatique (3 formules)
                                              ├─ Essentiel   ~890 €   (1 page, 5 sections)
                                              ├─ Professionnel ~1 690 € (5 pages, SEO, formulaire)
                                              └─ Sur-mesure    devis
                                              + option maintenance 29 €/mois
```

Le devis peut être **pré-calculé automatiquement** à partir du `SiteSpec` (nombre de pages, de sections, présence d'e-commerce/réservation). C'est un différenciateur fort : le client obtient un prix immédiatement, ce qu'aucune agence locale ne fait.

---

## 7. Indicateurs à suivre dès le premier jour

| Métrique | Cible saine |
|---|---|
| Taux d'entrée dans l'acte 1 (arrivée → étape 1) | > 55 % |
| Taux de révélation (étape 1 → maquette vue) | > 60 % |
| Taux de capture email (maquette vue → email) | > 65 % |
| Taux de validation (email → projet envoyé) | > 35 % |
| Temps médian jusqu'à la révélation | < 2 min |
| Étape avec le plus fort abandon | à surveiller chaque semaine |

Ces événements doivent être instrumentés **avant** l'ouverture au public, pas après.
