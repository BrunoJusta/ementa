-- Ementa: esquema inicial
-- Correr uma vez no SQL Editor do Supabase.
-- Requer: Authentication > Sign In / Providers > "Allow anonymous sign-ins" ligado.

create extension if not exists pgcrypto;

-- Mesas ---------------------------------------------------------------
create table if not exists public.mesas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null default 'A nossa mesa',
  created_at timestamptz not null default now()
);

create table if not exists public.membros (
  mesa_id uuid not null references public.mesas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (mesa_id, user_id)
);

-- Sítios --------------------------------------------------------------
create table if not exists public.sitios (
  id uuid primary key default gen_random_uuid(),
  mesa_id uuid not null references public.mesas(id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  morada text,
  maps_url text,
  foto_path text,
  cozinhas text[] not null default '{}',
  preco smallint check (preco between 1 and 4),
  momentos text[] not null default '{}',
  ja_fomos boolean not null default false,
  notas text,
  o_que_pedir text,
  tags text[] not null default '{}',
  criado_por uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sitios_mesa_idx on public.sitios (mesa_id);

create or replace function public.tocar_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists sitios_updated_at on public.sitios;
create trigger sitios_updated_at before update on public.sitios
for each row execute function public.tocar_updated_at();

-- Helpers -------------------------------------------------------------
create or replace function public.e_membro(p_mesa uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.membros
    where mesa_id = p_mesa and user_id = auth.uid()
  );
$$;

-- Entrar numa mesa com o código. Devolve o id e o nome da mesa.
create or replace function public.entrar_mesa(p_codigo text)
returns table (id uuid, nome text)
language plpgsql security definer set search_path = public as $$
declare
  v_mesa public.mesas;
begin
  if auth.uid() is null then
    raise exception 'sem sessao';
  end if;
  select * into v_mesa from public.mesas
  where codigo = lower(trim(p_codigo));
  if not found then
    raise exception 'codigo invalido' using errcode = 'P0002';
  end if;
  insert into public.membros (mesa_id, user_id)
  values (v_mesa.id, auth.uid())
  on conflict do nothing;
  return query select v_mesa.id, v_mesa.nome;
end $$;

revoke all on function public.entrar_mesa(text) from public, anon;
grant execute on function public.entrar_mesa(text) to authenticated;

-- RLS -----------------------------------------------------------------
alter table public.mesas enable row level security;
alter table public.membros enable row level security;
alter table public.sitios enable row level security;

drop policy if exists "mesa: membros leem" on public.mesas;
create policy "mesa: membros leem" on public.mesas
  for select to authenticated using (public.e_membro(id));

drop policy if exists "membros: o proprio" on public.membros;
create policy "membros: o proprio" on public.membros
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "membros: sair" on public.membros;
create policy "membros: sair" on public.membros
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "sitios: ler" on public.sitios;
create policy "sitios: ler" on public.sitios
  for select to authenticated using (public.e_membro(mesa_id));

drop policy if exists "sitios: criar" on public.sitios;
create policy "sitios: criar" on public.sitios
  for insert to authenticated with check (public.e_membro(mesa_id));

drop policy if exists "sitios: editar" on public.sitios;
create policy "sitios: editar" on public.sitios
  for update to authenticated
  using (public.e_membro(mesa_id)) with check (public.e_membro(mesa_id));

drop policy if exists "sitios: apagar" on public.sitios;
create policy "sitios: apagar" on public.sitios
  for delete to authenticated using (public.e_membro(mesa_id));

-- Realtime (os dois telemóveis veem as alterações na hora)
do $$
begin
  alter publication supabase_realtime add table public.sitios;
exception when duplicate_object then null;
end $$;

-- Fotos ---------------------------------------------------------------
-- Bucket público para leitura; só membros escrevem em <mesa_id>/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 3145728, array['image/jpeg','image/webp','image/png'])
on conflict (id) do nothing;

drop policy if exists "fotos: membros escrevem" on storage.objects;
create policy "fotos: membros escrevem" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and public.e_membro(((storage.foldername(name))[1])::uuid));

drop policy if exists "fotos: membros atualizam" on storage.objects;
create policy "fotos: membros atualizam" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and public.e_membro(((storage.foldername(name))[1])::uuid));

drop policy if exists "fotos: membros apagam" on storage.objects;
create policy "fotos: membros apagam" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and public.e_membro(((storage.foldername(name))[1])::uuid));

-- A vossa mesa ---------------------------------------------------------
insert into public.mesas (codigo, nome)
values ('amoras-10', 'Amoras')
on conflict (codigo) do nothing;
