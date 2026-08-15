# 05 — Espace administrateur et relation client

> Objectif : que chaque projet soumis soit **actionnable en moins de 5 minutes** —
> tout lire, tout comprendre, décider de la suite.

---

## 1. Le pipeline (écran principal)

Kanban à 5 colonnes = les statuts du brief :

```
NOUVEAU (3) → EN ÉTUDE (2) → EN CRÉATION (4) → EN VALIDATION (1) → TERMINÉ (12)
```

Chaque carte : nom de l'activité, secteur (icône), date de soumission, **score de lead**
(pastille verte/orange/grise), miniature réelle de la maquette, badge « ⏳ réponse client
attendue » si une demande d'info est ouverte.

Tri par défaut : score décroissant puis date. Filtres : secteur, score, période.

**Score de lead** (calcul serveur, transparent) :
complétion globale + email fourni + téléphone fourni + photos réelles uploadées +
budget renseigné + échéance < 3 mois. Il ne décide rien — il ordonne la pile de travail.

Une 6ᵉ vue séparée, « Brouillons abandonnés », liste les projets non soumis avec email
connu : c'est un vivier de relance manuelle, pas une colonne du pipeline.

---

## 2. Fiche projet

Layout en deux volets :

**Gauche — le projet (lecture rapide)**
- Bloc contact : nom, email, téléphone, consentements, boutons `copier` partout.
- Bloc synthèse : activité, spécialisation, objectif, échéance, budget, demandes
  particulières — le « PROJET #1024 » du brief, exactement.
- Pages demandées (suggérées ✓ / personnalisées ✎ avec leur note).
- Contenus fournis : textes (avec leur provenance **pack / IA / client** — crucial : on
  sait ce que le client a réellement validé de sa main), photos et logo en galerie,
  réseaux sociaux, horaires.
- Historique complet (`project_events`) : chaque étape, chaque édition, chaque email.

**Droite — la maquette**
- Rendu live via le même `site-renderer`, toggle desktop/mobile.
- Sélecteur de version (chaque version de `site_specs`) → voir l'évolution du projet.
- Bouton « Ouvrir en grand » et « Copier le lien public ».

**Actions d'en-tête** : changer le statut, ajouter une note interne, demander une
information (→ §3), exporter le brief en PDF (pour travailler hors ligne ou
sous-traiter), archiver.

---

## 3. Demande d'information au client (§17 du brief)

Le mécanisme est volontairement **asynchrone et sans messagerie** :

1. L'admin rédige sa demande et la **cible sur un chantier** (« Vos services », « Vos photos »…).
2. Le client reçoit un email : *« Votre maquette avance — nous avons besoin d'une précision
   sur vos services »* + bouton unique.
3. Le lien rouvre **son studio, directement sur le chantier concerné**, avec le message de
   l'admin affiché en encart. Il complète dans l'outil qu'il connaît déjà — pas de
   copier-coller d'emails, et la réponse atterrit directement dans la spec.
4. À la sauvegarde, la demande passe « résolue », l'admin est notifié, l'événement est
   historisé.

Un seul canal, zéro messagerie à construire, et chaque échange **enrichit le projet**
au lieu de vivre dans une boîte mail.

---

## 4. Notifications côté admin

- **Email immédiat** à chaque soumission (résumé + lien fiche + miniature maquette).
- Email quotidien de synthèse : nouveaux projets, demandes résolues, brouillons chauds
  (> 60 % non soumis depuis 48 h).
- Pas de push/temps réel au MVP — le volume ne le justifie pas.

## 5. Notifications côté client

| Déclencheur | Email |
|---|---|
| Capture email | Lien de reprise + « votre maquette est sauvegardée » |
| Abandon H+24 (non soumis) | « Votre site vous attend (78 %) » + capture de SA maquette |
| Abandon J+3 | Dernière relance, angle différent (« 3 idées pour votre page d'accueil ») |
| Soumission | Récapitulatif + lien permanent lecture seule |
| Changement de statut significatif | « Votre projet est passé en création » |
| Demande d'info | Voir §3 |

Tous via Resend + React Email, historisés dans `project_events`, et coupables par le lien
de désinscription (consentement marketing distinct du transactionnel).

---

## 6. Ce que l'admin ne fait PAS au MVP

- Éditer la maquette du client (lecture seule + versions ; l'édition admin arrive en phase 2
  et le modèle `created_by:'admin'` la prévoit déjà).
- Gérer plusieurs admins avec rôles/permissions (une liste blanche d'emails suffit).
- Facturation/devis intégrés (phase 2 : bouton « générer le devis » depuis la spec).
