-- DicMed : statistiques des fiches les plus lues (à exécuter une fois : Supabase > SQL Editor)
-- 1) REMPLACEZ VOTRE_EMAIL_ADMIN (2 endroits plus bas) par l'adresse e-mail de votre compte administrateur.

-- Table des lectures : anonyme, aucun identifiant personnel (ni adresse IP, ni nom).
create table if not exists public.vues_fiches (
  id bigint generated always as identity primary key,
  fiche_id text not null check (char_length(fiche_id) between 1 and 120),
  terme    text not null check (char_length(terme)    between 1 and 200),
  vu_le    timestamptz not null default now()
);
alter table public.vues_fiches enable row level security;

-- Tout visiteur peut ENREGISTRER une lecture ; personne ne peut les RELIRE directement.
drop policy if exists "enregistrer une lecture" on public.vues_fiches;
create policy "enregistrer une lecture" on public.vues_fiches
  for insert to anon, authenticated with check (true);

-- Statistiques : réservées à l'administrateur (vérification de l'e-mail dans la fonction).
create or replace function public.top_fiches(jours int default 30, limite int default 20)
returns table (fiche_id text, terme text, vues bigint)
language sql security definer set search_path = public as $$
  select v.fiche_id, max(v.terme) as terme, count(*) as vues
  from public.vues_fiches v
  where (auth.jwt() ->> 'email') = 'VOTRE_EMAIL_ADMIN'
    and v.vu_le > now() - make_interval(days => jours)
  group by v.fiche_id
  order by count(*) desc
  limit limite;
$$;

create or replace function public.total_vues(jours int default 30)
returns bigint
language sql security definer set search_path = public as $$
  select case when (auth.jwt() ->> 'email') = 'VOTRE_EMAIL_ADMIN'
    then (select count(*) from public.vues_fiches where vu_le > now() - make_interval(days => jours))
    else 0 end;
$$;

revoke all on function public.top_fiches(int, int) from public, anon;
revoke all on function public.total_vues(int) from public, anon;
grant execute on function public.top_fiches(int, int) to authenticated;
grant execute on function public.total_vues(int) to authenticated;
