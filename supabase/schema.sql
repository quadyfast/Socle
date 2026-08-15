-- =====================================================================
-- SOCLE — schéma Supabase
-- À exécuter dans : Supabase → SQL Editor → New query → Run
--
-- Principe de sécurité : le navigateur ne parle JAMAIS à cette base.
-- Seule la fonction serveur Vercel écrit, avec la clé `service_role`
-- (qui contourne RLS). Le client n'a donc aucun moyen de relire sa
-- maquette après envoi — la règle métier est appliquée ici, pas dans l'interface.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table des projets
-- ---------------------------------------------------------------------
create table if not exists public.projets (
  id          uuid primary key default gen_random_uuid(),
  ref         text unique not null,
  cree_le     timestamptz not null default now(),
  maj_le      timestamptz not null default now(),

  statut      text not null default 'nouveau'
              check (statut in ('nouveau','etude','creation','validation','termine')),
  pct         smallint not null default 0 check (pct between 0 and 100),

  -- coordonnées, extraites pour pouvoir filtrer et trier sans ouvrir le JSON
  nom         text not null,
  email       text,
  telephone   text,
  metier      text,
  specialite  text,
  budget      text,
  echeance    text,

  -- le modèle complet de la maquette : métier, ADN, empreinte, thème,
  -- composition, contenu, pages. Suffit à réafficher la maquette à l'identique.
  etat        jsonb not null,

  -- traçabilité, utile en cas de litige ou d'abus
  ip_hash     text,
  user_agent  text
);

comment on column public.projets.etat is
  'Modèle complet de la maquette. Consommé tel quel par renderSite({as: etat}).';

create index if not exists projets_statut_idx  on public.projets (statut, cree_le desc);
create index if not exists projets_cree_le_idx on public.projets (cree_le desc);
create index if not exists projets_email_idx   on public.projets (email);

-- ---------------------------------------------------------------------
-- 2. Messages échangés avec le client (envoyés par email via Resend)
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  projet_id  uuid not null references public.projets(id) on delete cascade,
  cree_le    timestamptz not null default now(),
  expediteur text not null check (expediteur in ('atelier','client')),
  texte      text not null check (length(texte) between 1 and 5000),
  email_id   text   -- identifiant Resend, pour retrouver l'envoi
);
create index if not exists messages_projet_idx on public.messages (projet_id, cree_le);

-- ---------------------------------------------------------------------
-- 3. Historique — chaque événement du projet
-- ---------------------------------------------------------------------
create table if not exists public.historique (
  id        uuid primary key default gen_random_uuid(),
  projet_id uuid not null references public.projets(id) on delete cascade,
  cree_le   timestamptz not null default now(),
  evenement text not null,
  auteur    text not null default 'atelier'
);
create index if not exists historique_projet_idx on public.historique (projet_id, cree_le desc);

-- ---------------------------------------------------------------------
-- 4. Fichiers déposés par le client (logo, photos)
-- ---------------------------------------------------------------------
create table if not exists public.fichiers (
  id        uuid primary key default gen_random_uuid(),
  projet_id uuid not null references public.projets(id) on delete cascade,
  cree_le   timestamptz not null default now(),
  role      text not null check (role in ('logo','hero','galerie')),
  chemin    text not null,          -- chemin dans le bucket `projets`
  type_mime text,
  taille    integer
);
create index if not exists fichiers_projet_idx on public.fichiers (projet_id);

-- ---------------------------------------------------------------------
-- 5. Référence lisible : #1042, #1043…
-- ---------------------------------------------------------------------
create sequence if not exists public.projet_ref_seq start 1042;

create or replace function public.prochaine_ref() returns text
language sql volatile as $$
  select '#' || nextval('public.projet_ref_seq')::text;
$$;

-- ---------------------------------------------------------------------
-- 6. Mise à jour automatique de maj_le
-- ---------------------------------------------------------------------
create or replace function public.touch_maj_le() returns trigger
language plpgsql as $$
begin
  new.maj_le := now();
  return new;
end;
$$;

drop trigger if exists projets_touch on public.projets;
create trigger projets_touch before update on public.projets
  for each row execute function public.touch_maj_le();

-- ---------------------------------------------------------------------
-- 7. RÈGLES D'ACCÈS — le cœur de la protection
--
-- RLS activé + AUCUNE politique pour `anon` = le public ne peut
-- ni lire ni écrire, quoi qu'il tente depuis le navigateur.
-- `service_role` (fonction Vercel) contourne RLS : c'est lui qui écrit.
-- `authenticated` (toi, connecté à l'espace atelier) peut tout lire.
-- ---------------------------------------------------------------------
alter table public.projets    enable row level security;
alter table public.messages   enable row level security;
alter table public.historique enable row level security;
alter table public.fichiers   enable row level security;

-- Lecture réservée aux comptes authentifiés
drop policy if exists "atelier lit les projets" on public.projets;
create policy "atelier lit les projets" on public.projets
  for select to authenticated using (true);

drop policy if exists "atelier modifie les projets" on public.projets;
create policy "atelier modifie les projets" on public.projets
  for update to authenticated using (true) with check (true);

drop policy if exists "atelier lit les messages" on public.messages;
create policy "atelier lit les messages" on public.messages
  for select to authenticated using (true);

drop policy if exists "atelier ecrit les messages" on public.messages;
create policy "atelier ecrit les messages" on public.messages
  for insert to authenticated with check (expediteur = 'atelier');

drop policy if exists "atelier lit l historique" on public.historique;
create policy "atelier lit l historique" on public.historique
  for select to authenticated using (true);

drop policy if exists "atelier ecrit l historique" on public.historique;
create policy "atelier ecrit l historique" on public.historique
  for insert to authenticated with check (true);

drop policy if exists "atelier lit les fichiers" on public.fichiers;
create policy "atelier lit les fichiers" on public.fichiers
  for select to authenticated using (true);

-- Aucune politique pour `anon` : c'est volontaire et c'est la protection.

-- ---------------------------------------------------------------------
-- 8. Stockage des fichiers clients — bucket privé
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('projets', 'projets', false, 5242880,
        array['image/png','image/jpeg','image/svg+xml','image/webp','image/gif'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "atelier lit les fichiers stockes" on storage.objects;
create policy "atelier lit les fichiers stockes" on storage.objects
  for select to authenticated using (bucket_id = 'projets');

-- Le dépôt passe par la fonction serveur (service_role), pas par le navigateur.

-- ---------------------------------------------------------------------
-- 9. Vue de synthèse pour la liste de l'espace atelier
-- ---------------------------------------------------------------------
create or replace view public.projets_liste
with (security_invoker = true) as
  select p.id, p.ref, p.cree_le, p.statut, p.pct, p.nom, p.email,
         p.metier, p.specialite, p.budget, p.echeance,
         (select count(*) from public.messages m where m.projet_id = p.id) as nb_messages,
         (select count(*) from public.fichiers f where f.projet_id = p.id) as nb_fichiers
  from public.projets p
  order by p.cree_le desc;
