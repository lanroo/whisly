-- ============================================================
-- Whisly — amizades (solicitação + aceitar/recusar)
-- + colaboração em lista passa a exigir amizade (só amigos entram)
-- + eventos de amizade no feed de Atividade
-- (aplicado no projeto Supabase via MCP)
-- ============================================================

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
create index friendships_requester_idx on public.friendships(requester_id);
create index friendships_addressee_idx on public.friendships(addressee_id);

alter table public.friendships enable row level security;

-- Ver: quem faz parte da relação
create policy "friendships_select_own" on public.friendships
  for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
-- Enviar: só como solicitante, sempre pendente
create policy "friendships_insert_requester" on public.friendships
  for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pending');
-- Aceitar: só o destinatário pode mudar o status
create policy "friendships_update_addressee" on public.friendships
  for update to authenticated
  using (addressee_id = auth.uid());
-- Recusar/cancelar/desfazer: qualquer um dos dois
create policy "friendships_delete_own" on public.friendships
  for delete to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- Helper de RLS: são amigos (aceito)?
create or replace function public.are_friends(_a uuid, _b uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from friendships f
    where f.status = 'accepted'
      and ((f.requester_id = _a and f.addressee_id = _b)
        or (f.requester_id = _b and f.addressee_id = _a))
  );
$$;
revoke execute on function public.are_friends(uuid, uuid) from anon, public;

-- Manter updated_at
create trigger friendships_set_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

-- Colaboração agora exige amizade: dono só adiciona quem é amigo dele.
drop policy if exists "collab_insert_owner" on public.collaborators;
create policy "collab_insert_owner" on public.collaborators
  for insert to authenticated
  with check (public.is_list_owner(list_id) and public.are_friends(auth.uid(), user_id));

-- ===== Atividade: novos tipos =====
alter table public.activity drop constraint if exists activity_type_check;
alter table public.activity add constraint activity_type_check
  check (type in ('reservation', 'collaborator_added', 'item_added', 'friend_request', 'friend_accepted'));

-- Solicitação de amizade -> atividade para o destinatário
create or replace function public.on_friend_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' then
    insert into activity (user_id, actor_id, type, metadata)
    values (new.addressee_id, new.requester_id, 'friend_request',
            jsonb_build_object('friendship_id', new.id));
  end if;
  return new;
end;
$$;
revoke execute on function public.on_friend_request() from anon, authenticated, public;

create trigger friendships_notify_insert
  after insert on public.friendships
  for each row execute function public.on_friend_request();

-- Aceite -> atividade para o solicitante; remove a solicitação pendente do feed
create or replace function public.on_friend_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and old.status = 'pending' then
    insert into activity (user_id, actor_id, type, metadata)
    values (new.requester_id, new.addressee_id, 'friend_accepted', '{}'::jsonb);
    delete from activity
      where type = 'friend_request' and (metadata->>'friendship_id')::uuid = new.id;
  end if;
  return new;
end;
$$;
revoke execute on function public.on_friend_accepted() from anon, authenticated, public;

create trigger friendships_notify_update
  after update on public.friendships
  for each row execute function public.on_friend_accepted();

-- Push: mensagens para os novos tipos
create or replace function public.on_activity_push()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare
  v_body text;
  v_anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a2RodXFuZHpyeHFya21ldnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjI1NTMsImV4cCI6MjA5NzAzODU1M30._k12ArPeEGFIg7Y0VjXVhGrAZ6QFcpZUw8cHCMLp1M8';
  v_url text := 'https://uvkdhuqndzrxqrkmevtr.supabase.co/functions/v1/send-push';
begin
  if new.type = 'reservation' then
    v_body := 'Alguém reservou um presente da sua lista ' || coalesce(new.metadata->>'list_title', '');
  elsif new.type = 'collaborator_added' then
    v_body := 'Você foi adicionado à lista ' || coalesce(new.metadata->>'list_title', '');
  elsif new.type = 'item_added' then
    v_body := coalesce(new.metadata->>'item_title', 'Um item') || ' foi adicionado em '
              || coalesce(new.metadata->>'list_title', 'uma lista');
  elsif new.type = 'friend_request' then
    v_body := 'Você recebeu uma solicitação de amizade';
  elsif new.type = 'friend_accepted' then
    v_body := 'Sua solicitação de amizade foi aceita';
  else
    v_body := 'Nova atividade no Whisly';
  end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon
    ),
    body := jsonb_build_object(
      'userId', new.user_id, 'title', 'Whisly', 'body', v_body, 'url', '/activity'
    )
  );
  return new;
end;
$$;
revoke execute on function public.on_activity_push() from anon, authenticated, public;
