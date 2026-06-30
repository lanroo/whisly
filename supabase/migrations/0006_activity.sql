-- ============================================================
-- Whisly — feed de Atividade
-- Tabela activity + RLS + triggers que registram eventos:
--   - reservation: alguém reservou um presente da SUA lista (sem revelar
--     item nem quem — mantém a surpresa)
--   - collaborator_added: você foi adicionado a uma lista
--   - item_added: um colaborador adicionou item numa lista que você participa
-- (aplicado no projeto Supabase via MCP)
-- ============================================================

create table public.activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade, -- destinatário
  actor_id uuid references auth.users(id) on delete set null,        -- quem fez (null = oculto)
  type text not null check (type in ('reservation', 'collaborator_added', 'item_added')),
  list_id uuid references public.lists(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index activity_user_id_idx on public.activity(user_id, created_at desc);

alter table public.activity enable row level security;

create policy "activity_select_own" on public.activity
  for select to authenticated using (user_id = auth.uid());
create policy "activity_update_own" on public.activity
  for update to authenticated using (user_id = auth.uid());
create policy "activity_delete_own" on public.activity
  for delete to authenticated using (user_id = auth.uid());

-- ===== Triggers (SECURITY DEFINER: inserem em activity ignorando RLS) =====

-- Reserva: notifica o DONO, sem revelar item nem quem (surpresa).
create or replace function public.on_reservation_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_list uuid;
  v_owner uuid;
  v_title text;
begin
  select li.list_id into v_list from list_items li where li.id = new.item_id;
  select l.owner_id, l.title into v_owner, v_title from lists l where l.id = v_list;
  if v_owner is not null and v_owner <> new.reserved_by then
    insert into activity (user_id, actor_id, type, list_id, metadata)
    values (v_owner, null, 'reservation', v_list, jsonb_build_object('list_title', v_title));
  end if;
  return new;
end;
$$;

create trigger reservations_notify
  after insert on public.reservations
  for each row execute function public.on_reservation_created();

-- Novo colaborador: notifica quem foi adicionado.
create or replace function public.on_collaborator_added()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid;
  v_title text;
begin
  select l.owner_id, l.title into v_owner, v_title from lists l where l.id = new.list_id;
  if new.user_id is not null and new.user_id <> coalesce(v_owner, new.user_id) then
    insert into activity (user_id, actor_id, type, list_id, metadata)
    values (new.user_id, v_owner, 'collaborator_added', new.list_id,
            jsonb_build_object('list_title', v_title));
  end if;
  return new;
end;
$$;

create trigger collaborators_notify
  after insert on public.collaborators
  for each row execute function public.on_collaborator_added();

-- Item adicionado: notifica dono + colaboradores (exceto quem adicionou).
create or replace function public.on_item_added()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid;
  v_title text;
  v_adder uuid := new.added_by;
  rec record;
begin
  select l.owner_id, l.title into v_owner, v_title from lists l where l.id = new.list_id;

  if v_owner is not null and v_owner is distinct from v_adder then
    insert into activity (user_id, actor_id, type, list_id, metadata)
    values (v_owner, v_adder, 'item_added', new.list_id,
            jsonb_build_object('list_title', v_title, 'item_title', new.title));
  end if;

  for rec in select user_id from collaborators where list_id = new.list_id loop
    if rec.user_id is distinct from v_adder and rec.user_id is distinct from v_owner then
      insert into activity (user_id, actor_id, type, list_id, metadata)
      values (rec.user_id, v_adder, 'item_added', new.list_id,
              jsonb_build_object('list_title', v_title, 'item_title', new.title));
    end if;
  end loop;
  return new;
end;
$$;

create trigger list_items_notify
  after insert on public.list_items
  for each row execute function public.on_item_added();
