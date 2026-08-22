# ChantierStudio — Brief projet

## Qui je suis
Matéo, géomètre-topographe en alternance (3e année, focus BIM) et micro-entrepreneur à Rouen.
Compétences clés : photogrammétrie drone (Metashape), scan 3D, Revit, AutoCAD + dev web (Next.js, TypeScript, Tailwind, Supabase, Vercel).
Ce double profil BTP/3D/web est mon différenciant : personne d'autre localement ne le possède.

## Le business
Je vends des sites web aux professionnels du bâtiment autour de Rouen (50 km), en parallèle de mon alternance. Démarchage prévu octobre 2026. Statut micro-entreprise avec ACRE, facturation TTC (TVA non applicable, art. 293 B du CGI).

### Offres et tarifs
- **Site Vitrine — 1 400 € TTC** (one-shot) : site sur mesure, mobile-first, formulaire devis, fiche Google Business, livré en 3 semaines.
- **Site Signature — 2 600 € TTC** (one-shot) : Vitrine + captation drone d'une réalisation + visite 3D interactive (Gaussian Splatting via Luma AI) + vidéo réseaux sociaux.
- **Abonnement Visibilité — 200 € TTC/mois** (récurrent, sans engagement au-delà de 3 mois) : gestion Google Ads, mises à jour du site, rapport mensuel. Le budget pub Google (300-600 €/mois) est payé par le client directement à Google — toujours annoncé clairement.
- **Étage supérieur (opportuniste)** : promoteurs / constructeurs / immo haut de gamme → sites immersifs 3 500-6 000 € + 300-500 €/mois.

### Positionnement marché
"La qualité visuelle d'une agence parisienne, au tarif d'un freelance local, avec quelqu'un qui connaît le bâtiment de l'intérieur."
- Au-dessus des templates (Simplébo ~400 €, freelances 690-750 €) — je ne me bats JAMAIS sur le prix contre eux.
- Sous les agences rouennaises (1 850 €+) avec un niveau visuel qu'elles n'ont pas.
- Argument massue vs plateformes de leads (Habitatpresto ~110 €/mois, leads partagés à 3-4 artisans) : mes demandes sont exclusives et le client est propriétaire de son site.
- Stats de pitch : 57 % des artisans n'ont pas de site ; 83 % des particuliers cherchent leur artisan sur Google.

## Direction artistique des sites
Style "Apple product page" adapté au BTP :
- Un seul message par écran, typographie XXL (Space Grotesk / Inter, letter-spacing -0.02em), vide massif.
- Fond sombre, sujet éclairé au centre, dégradés réservés aux mots-clés des titres.
- Une seule animation forte par section : sections pinned, fade-up doux (0.6-1 s, ease-out), scroll-scrubbing.
- Pour le luxe/immobilier : variante serif (Marcellus), capitales espacées, accent doré.

## Technique signature : le scroll-scrubbing
Le cœur de mon offre visuelle. Une séquence vidéo (rendu 3D, drone, ou IA générative) découpée en frames, pilotée par le scroll :
1. Asset → séquence d'images : `ffmpeg -i video.mp4 -vf "fps=24,scale=1600:-1" frames/frame_%03d.webp`
2. GSAP ScrollTrigger (scrub: 0.4-0.5) convertit le scroll en progression 0→1, section pinned.
3. `index = round(progress × (N-1))` → `drawImage` sur canvas (mode cover).
Sources d'assets : Revit → Twinmotion (phasage chantier), photogrammétrie/splat (Luma AI, iPhone + drone), génération vidéo IA (Kling/Veo/Runway) pour les concepts.
Contraintes : `<video>` toujours muted + playsinline (autoplay iOS), respecter prefers-reduced-motion, préchargement des frames, poids maîtrisé pour la 4G.

## Templates existants (ma bibliothèque de démos)
1. **demo-scroll-scrubbing.html** — maison qui se construit au scroll (blueprint/chantier), version pédagogique du mécanisme.
2. **landing-btp-apple.html** — landing ChantierStudio style Apple : hero XXL, section pinned 3 phrases, emplacement vidéo drone, cards services, CTA. Sert de vitrine de MON offre.
3. **template-luxe-scrub.html** — "Méridien Résidences", luxe immobilier : plongée espace → nuages → tour, auto-détection d'un dossier `frames/` (fallback scène canvas procédurale). Pour prospects promoteurs/immo.
4. **grille-tarifaire.html** — one-pager tarifs à montrer en rendez-vous.

## Stack et conventions
- Next.js + TypeScript + Tailwind, déploiement Vercel, formulaires via Resend, données Supabase si besoin.
- GSAP ScrollTrigger pour les animations scroll. Pas de librairie d'animation superflue.
- Mobile-first obligatoire (les artisans et leurs clients sont sur téléphone).
- Performance : viser Lighthouse mobile > 90, images WebP, lazy loading hors hero.
- Accessibilité : focus visible, prefers-reduced-motion respecté partout.
- SEO local systématique : title/meta par ville + métier ("Maçon à Louviers"), schema.org LocalBusiness, fiche Google Business liée.
- Chaque site livré doit convertir : CTA "Demander un devis" visible en permanence, formulaire court, numéro cliquable.

## Objectifs réalistes année 1
3 clients site + abonnement (~5 000 € one-shot + 600 €/mois récurrent en fin d'année). Premier client probablement via réseau (CALDEA, alternance, proches), éventuellement à prix réduit contre droit de référence. M'entraîner sur Google Ads avec ma propre campagne ChantierStudio avant de facturer la gestion. Jamais de promesse de résultats chiffrés aux clients.
