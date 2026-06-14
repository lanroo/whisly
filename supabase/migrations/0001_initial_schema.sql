-- ============================================================
-- Whisly — schema inicial (aplicado no projeto Supabase via MCP)
-- Tabelas + RLS + funções auxiliares + triggers
-- Regenerar tipos TS: Supabase MCP -> generate_typescript_types
-- ============================================================

-- ===== Tipos =====
create type public.list_privacy as enum ('private', 'collaborative', 'public');
create type public.item_status as enum ('urgent', 'desired', 'later', 'bought');
create type public.collaborator_role as enum ('owner', 'editor', 'viewer');

-- ===== Perfis (estende auth.users) =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  handle text unique,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ===== Listas =====
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover_image text,
  privacy public.list_privacy not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lists_owner_id_idx on public.lists(owner_id);

-- ===== Itens da lista =====
create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  brand text,
  price text,
  image_url text,
  url text,
  status public.item_status not null default 'desired',
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index list_items_list_id_idx on public.list_items(list_id);

-- ===== Colaboradores =====
create table public.collaborators (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.collaborator_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (list_id, user_id)
);
create index collaborators_user_id_idx on public.collaborators(user_id);

-- ===== Reservas de presente (uma por item) =====
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.list_items(id) on delete cascade,
  reserved_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (item_id)
);

-- ===== Triggers =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lists_set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();

-- ===== Funções auxiliares de RLS (SECURITY DEFINER evita recursão) =====
create or replace function public.is_list_member(_list_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from lists l where l.id = _list_id and (l.owner_id = auth.uid() or l.privacy = 'public')
  ) or exists (
    select 1 from collaborators c where c.list_id = _list_id and c.user_id = auth.uid()
  );
$$;

create or replace function public.is_list_owner(_list_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from lists l where l.id = _list_id and l.owner_id = auth.uid());
$$;

create or replace function public.can_edit_list(_list_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from lists l where l.id = _list_id and l.owner_id = auth.uid())
      or exists (
        select 1 from collaborators c
        where c.list_id = _list_id and c.user_id = auth.uid() and c.role in ('owner','editor')
      );
$$;

revoke execute on function public.is_list_member(uuid) from anon, public;
revoke execute on function public.is_list_owner(uuid) from anon, public;
revoke execute on function public.can_edit_list(uuid) from anon, public;

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.collaborators enable row level security;
alter table public.reservations enable row level security;

-- profiles
create policy "profiles_select_all" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid());

-- lists
create policy "lists_select_visible" on public.lists for select to authenticated
  using (owner_id = auth.uid() or privacy = 'public' or public.is_list_member(id));
create policy "lists_insert_own" on public.lists for insert to authenticated with check (owner_id = auth.uid());
create policy "lists_update_editors" on public.lists for update to authenticated using (public.can_edit_list(id));
create policy "lists_delete_owner" on public.lists for delete to authenticated using (owner_id = auth.uid());

-- list_items
create policy "items_select_members" on public.list_items for select to authenticated using (public.is_list_member(list_id));
create policy "items_insert_editors" on public.list_items for insert to authenticated with check (public.can_edit_list(list_id));
create policy "items_update_editors" on public.list_items for update to authenticated using (public.can_edit_list(list_id));
create policy "items_delete_editors" on public.list_items for delete to authenticated using (public.can_edit_list(list_id));

-- collaborators
create policy "collab_select_members" on public.collaborators for select to authenticated using (public.is_list_member(list_id));
create policy "collab_insert_owner" on public.collaborators for insert to authenticated with check (public.is_list_owner(list_id));
create policy "collab_delete_owner_or_self" on public.collaborators for delete to authenticated using (public.is_list_owner(list_id) or user_id = auth.uid());

-- reservations (escondidas do dono da lista = surpresa)
create policy "resv_select_visible" on public.reservations for select to authenticated
  using (
    reserved_by = auth.uid()
    or (
      public.is_list_member((select list_id from public.list_items where id = item_id))
      and not public.is_list_owner((select list_id from public.list_items where id = item_id))
    )
  );
create policy "resv_insert_own" on public.reservations for insert to authenticated with check (reserved_by = auth.uid());
create policy "resv_delete_own" on public.reservations for delete to authenticated using (reserved_by = auth.uid());
