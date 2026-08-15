# Mise en production — guide pas à pas

Suivre dans l'ordre. Chaque étape est vérifiable avant de passer à la suivante.

---

## 1. Supabase — créer le projet

1. [supabase.com](https://supabase.com) → **New project** (projet dédié à Socle, séparé de l'autre application)
2. Région : **Europe (Frankfurt ou Paris)** — obligatoire pour le RGPD
3. Noter le mot de passe de la base, il ne réapparaît plus
4. **SQL Editor → New query** → coller tout `supabase/schema.sql` → **Run**

**Vérification :** dans *Table Editor*, les tables `projets`, `messages`, `historique`, `fichiers` existent, avec le cadenas RLS actif. Dans *Storage*, le bucket `projets` est présent et **privé**.

## 2. Supabase — récupérer les clés

*Project Settings → API* :

| Clé | Où elle va | Sensibilité |
|---|---|---|
| Project URL | `SUPABASE_URL` | publique |
| `anon` `public` | `SUPABASE_ANON_KEY` | publique, protégée par RLS |
| `service_role` | `SUPABASE_SERVICE_ROLE_KEY` | **SECRÈTE — serveur uniquement** |

> La clé `service_role` contourne toutes les règles d'accès. Si elle fuite, n'importe qui lit tous les projets. Elle ne doit jamais apparaître dans le HTML ni dans un dépôt public.

## 3. Supabase — créer votre compte atelier

*Authentication → Users → Add user* : votre email et un mot de passe solide.
Puis *Authentication → Providers* : **désactiver les inscriptions publiques** (`Enable sign ups` sur off). Vous devez être le seul compte.

## 4. Resend — les emails

1. [resend.com](https://resend.com) → ajouter votre domaine → créer les enregistrements DNS demandés (SPF, DKIM)
2. Attendre la vérification du domaine (quelques minutes à quelques heures)
3. **API Keys → Create** → recopier dans `RESEND_API_KEY`

**Vérification :** l'envoi de test depuis Resend arrive bien, et pas dans les indésirables.

> Sans domaine vérifié, les emails partent en spam ou sont refusés. Ne pas sauter cette étape.

## 5. Cloudflare Turnstile — l'anti-robot

[dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → *Add site* → récupérer les deux clés (site + secret).

> Sans `TURNSTILE_SECRET_KEY`, le filtre est **désactivé** et le formulaire est ouvert aux robots. Acceptable en local, jamais en ligne.

## 6. GitHub

```bash
cd "nouveau projet"
git init
git add .
git commit -m "Socle — parcours client, espace atelier, backend"
git branch -M main
git remote add origin https://github.com/VOUS/socle.git
git push -u origin main
```

**Vérification :** aucun fichier `.env` sur GitHub. `.gitignore` s'en charge — le vérifier quand même.

## 7. Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → importer le dépôt
2. Framework : **Other**. Pas de commande de compilation.
3. *Settings → Environment Variables* : recopier toutes les variables de `.env.example` avec les vraies valeurs
4. **Deploy**

## 8. Le fichier du site

Déplacer `prototype/maquette-parcours.html` vers `public/index.html`, puis renseigner
le bloc `CONFIG`, tout en haut du `<script>` :

```js
const CONFIG = {
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'eyJ...',          // clé « anon public »
  apiBase: '',                        // '' = même domaine
  turnstileSiteKey: '0x...',
};
```

**Tant que `supabaseUrl` et `supabaseAnonKey` sont vides, le site tourne en mémoire** :
c'est ce qui permet d'ouvrir le fichier en local et de tout tester sans serveur.
Dès qu'ils sont renseignés, le mode en ligne s'active :

| | Mode local | Mode en ligne |
|---|---|---|
| Envoi d'un projet | ajouté en mémoire | `POST /api/projet` → base + emails |
| Espace atelier | 4 projets de démonstration | connexion obligatoire, données réelles |
| Changement de statut | en mémoire | écrit en base + historique |
| Message au client | en mémoire | `POST /api/message` → email Resend |

> La session de l'espace atelier vit dans `sessionStorage` : elle disparaît à la
> fermeture de l'onglet. Rien ne subsiste sur un poste partagé.

## 9. Vérifications finales

- [ ] Envoyer un projet de test depuis le site en ligne
- [ ] Le projet apparaît dans la table `projets` de Supabase
- [ ] L'email d'accusé de réception arrive chez le client de test
- [ ] L'email de notification arrive dans votre boîte
- [ ] Se connecter à l'espace atelier : la fiche s'affiche avec la maquette
- [ ] Envoyer un message depuis la fiche : l'email part, et la réponse revient chez vous
- [ ] **Ouvrir la console du navigateur et tenter `fetch(SUPABASE_URL + '/rest/v1/projets')` sans être connecté → doit être refusé.** C'est la preuve que la maquette est bien inaccessible au client.

---

## Coût mensuel attendu

| Service | Offre gratuite | Quand ça bascule |
|---|---|---|
| Supabase | 500 Mo, 1 Go de stockage | quelques milliers de projets |
| Vercel | 100 Go de trafic | très loin de vos volumes |
| Resend | 3 000 emails/mois | ~1 000 projets/mois |
| Turnstile | illimité | jamais |

**Zéro euro par mois** au démarrage, hors nom de domaine (~12 €/an).

---

## En cas de problème

| Symptôme | Cause la plus fréquente |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY absent` | variable non ajoutée sur Vercel, ou déploiement à refaire après l'ajout |
| Emails jamais reçus | domaine non vérifié dans Resend |
| `Vérification anti-robot échouée` | clé site et clé secrète de deux sites Turnstile différents |
| Espace atelier vide alors que la base contient des projets | pas connecté : RLS masque tout aux non-authentifiés (comportement voulu) |
| `Enregistrement impossible` | consulter les journaux Vercel → *Functions* → `api/projet` |
