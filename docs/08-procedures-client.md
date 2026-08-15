# Procédures client — domaine, hébergement, restitution

Ce document décrit ce qui se passe **autour** du site : à qui appartient quoi, comment
on achète un domaine, et comment on rend ses affaires à un client qui part.

> Les formulations de contrat ci-dessous sont un point de départ opérationnel,
> pas un avis juridique. À faire relire avant de les utiliser en volume.

---

## 1. Qui possède quoi

| Élément | Propriétaire | Qui gère au quotidien |
|---|---|---|
| Nom de domaine | **le client**, toujours | vous (accès technique) |
| Contenu (textes, photos, logo) | le client | — |
| Le site livré (fichiers finaux) | le client | vous |
| Hébergement et certificat | vous | vous |
| Vos outils, gabarits, la plateforme Socle | **vous** | vous |

La dernière ligne est importante : vous livrez **le résultat**, pas votre outil de production.
Un client repart avec son site, jamais avec votre système de génération.

---

## 2. Acheter le domaine au nom du client

### Option A — le client achète lui-même (à privilégier)

La plus simple et la plus saine. Aucune ambiguïté possible sur la propriété.

1. Vous vérifiez la disponibilité et proposez 2 ou 3 noms
2. Le client achète avec sa carte, chez le bureau d'enregistrement de son choix
3. Il vous ajoute comme contact technique, ou vous transmet simplement les
   enregistrements DNS à poser
4. Vous notez l'échéance dans votre tableau de suivi

**Ce que vous lui dites :** « Le domaine reste à votre nom, c'est votre propriété.
Comptez environ 12 € par an. Je vous guide, ça prend cinq minutes. »

### Option B — vous achetez pour lui

Utile quand le client ne veut rien faire. Chez la plupart des bureaux d'enregistrement,
le **titulaire** est un contact distinct du compte qui paie.

Chez OVH par exemple, un domaine a quatre contacts séparables :

| Contact | À renseigner |
|---|---|
| **Titulaire (owner)** | **le client** — nom, adresse, **son email** |
| Administrateur | vous |
| Technique | vous |
| Facturation | vous |

Vous payez, vous gérez, **le client est propriétaire**. C'est exactement le montage recherché.

**Deux points à ne pas rater :**

- Pour les extensions génériques (`.com`, `.fr`…), le titulaire reçoit un **email de
  vérification obligatoire**. S'il ne clique pas, le domaine est suspendu au bout de 15 jours.
  Prévenez-le : « vous allez recevoir un email de validation, il faut cliquer. »
- Le `.fr` impose un titulaire identifiable (AFNIC). Nom et adresse réels, pas les vôtres.

### Ce qu'il ne faut jamais faire

Mettre le domaine à votre nom « pour simplifier ». C'est la pratique qui transforme
un client mécontent en client qui parle de vous partout. Ça coûte 12 € par an de
faire les choses proprement.

---

## 3. Suivi des domaines

Un domaine qui expire sans prévenir, c'est un site hors ligne et un client furieux.
Tenez un tableau, même dans un simple fichier :

| Client | Domaine | Bureau d'enregistrement | Titulaire | Échéance | Renouvellement |
|---|---|---|---|---|---|
| Le Fournil | lefournil-lyon.fr | OVH | le client | 12/03/2027 | automatique |

Activez le **renouvellement automatique** systématiquement, et gardez une alerte
personnelle 30 jours avant. Ne comptez pas uniquement sur l'email du bureau
d'enregistrement : il part souvent dans les indésirables.

---

## 4. Restitution — le client s'en va

C'est prévu, c'est normal, et bien le faire vaut mieux que le retenir de force.

### Ce que vous lui remettez

1. **Les fichiers du site** — une archive contenant le site tel qu'il est en ligne
2. **Les contenus d'origine** — photos en pleine résolution, logo, textes
3. **Le domaine** — code de transfert (auth code) et déverrouillage
4. **Une note d'une page** — où c'était hébergé, quels enregistrements DNS, comment redéployer

### Comment produire l'archive

Chaque site client vit dans son propre dépôt Git. La restitution est donc immédiate :

```bash
# Option 1 — vous transférez la propriété du dépôt au client
#   GitHub → Settings → Transfer ownership

# Option 2 — vous lui livrez une archive autonome
git archive --format=zip --output=site-client.zip HEAD
```

Un site statique se redéploie chez n'importe quel hébergeur en glissant le dossier.
C'est un argument commercial : **vous ne l'enfermez pas**.

### Transférer le domaine

1. Déverrouiller le domaine chez le bureau d'enregistrement
2. Récupérer le code de transfert (auth code / EPP)
3. Le transmettre au client
4. Il lance le transfert depuis son nouveau bureau d'enregistrement

Si le titulaire est déjà le client (cas normal), il n'y a **aucun changement de
propriétaire** à faire — juste un déplacement technique.

### Après le départ

- Retirer le site de votre hébergement une fois le sien en ligne, jamais avant
- Supprimer ses données de vos systèmes après le délai annoncé dans votre politique
  de confidentialité, fichiers inclus
- Conserver uniquement ce que la loi impose (factures : 10 ans)

### Le délai à annoncer

**Sous 15 jours ouvrés après la fin de l'abonnement.** Assez large pour vous,
assez court pour rassurer.

---

## 5. Clauses à faire figurer au contrat

À adapter, mais ces cinq points doivent y être :

> **Propriété.** Le nom de domaine est enregistré au nom du Client, qui en est
> l'unique propriétaire. Les contenus fournis par le Client (textes, images, logo)
> demeurent sa propriété. Le site livré devient sa propriété au paiement intégral.
>
> **Outils du Prestataire.** Les outils, gabarits et systèmes de génération utilisés
> pour produire le site demeurent la propriété du Prestataire et ne sont pas cédés.
>
> **Abonnement.** L'abonnement de maintenance et d'hébergement est obligatoire la
> première année, puis résiliable mensuellement avec un préavis d'un mois. Il comprend
> l'hébergement, le certificat de sécurité, les sauvegardes, les mises à jour techniques
> et [30] minutes de modifications par mois.
>
> **Disponibilité.** Le Prestataire s'engage à répondre à toute demande sous [48 heures
> ouvrées]. Aucune garantie de disponibilité permanente n'est due.
>
> **Restitution.** En cas de résiliation, le Prestataire remet au Client, sous quinze
> jours ouvrés, les fichiers du site, ses contenus d'origine et le code de transfert
> du domaine. Le site est maintenu en ligne jusqu'à la date de fin d'abonnement.

---

## 6. Ce qu'il faut décider une fois pour toutes

| Question | À trancher |
|---|---|
| Le domaine : le client achète, ou vous ? | recommandé : **le client** |
| Montant de l'acompte | recommandé : **30 à 40 %** |
| Prix de l'abonnement mensuel | à fixer (marché : 20 à 50 €) |
| Modifications incluses par mois | recommandé : **30 minutes** |
| Délai de réponse annoncé | recommandé : **48 h ouvrées** |
| Hébergement des sites clients | **Cloudflare Pages** — gratuit, usage commercial autorisé |

> ⚠️ L'offre gratuite de **Vercel interdit l'usage commercial**. Gardez Vercel pour la
> plateforme Socle et hébergez les sites clients sur Cloudflare Pages.
