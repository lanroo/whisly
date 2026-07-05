-- ============================================================
-- Convite para lista com ACEITE (pendente -> aceito), como amizade.
-- (aplicado no projeto Supabase via MCP)
-- ============================================================
alter table public.collaborators
  add column if not exists status text not null default 'accepted'
    check (status in ('pending', 'accepted'));

-- Só conta como membro/editor quem ACEITOU (pendente não tem acesso).
create or replace function public.is_list_member(_list_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from lists l
    where l.id = _list_id and (l.owner_id = auth.uid() or l.privacy = 'public')
  ) or exists (
    select 1 from collaborators c
    where c.list_id = _list_id and c.user_id = auth.uid() and c.status = 'accepted'
  );
$$;

create or replace function public.can_edit_list(_list_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from lists l where l.id = _list_id and l.owner_id = auth.uid())
    or exists (
      select 1 from collaborators c
      where c.list_id = _list_id and c.user_id = auth.uid()
        and c.role in ('owner','editor') and c.status = 'accepted'
    );
$$;

-- Aceitar: o convidado pode atualizar a própria linha; dono também.
drop policy if exists "collab_update_owner_or_self" on public.collaborators;
create policy "collab_update_owner_or_self" on public.collaborators
  for update to authenticated
  using (public.is_list_owner(list_id) or user_id = auth.uid());

-- ===== Atividade: novo tipo list_invite =====
alter table public.activity drop constraint if exists activity_type_check;
alter table public.activity add constraint activity_type_check
  check (type in ('reservation','collaborator_added','item_added','friend_request','friend_accepted','list_invite'));

-- Convite pendente -> solicitação para o convidado (aceitar/recusar).
create or replace function public.on_collaborator_added()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_title text;
begin
  select l.owner_id, l.title into v_owner, v_title from lists l where l.id = new.list_id;
  if new.status = 'pending' and new.user_id is not null
     and new.user_id <> coalesce(v_owner, new.user_id) then
    insert into activity (user_id, actor_id, type, list_id, metadata)
    values (new.user_id, v_owner, 'list_invite', new.list_id,
            jsonb_build_object('list_title', v_title, 'collaborator_id', new.id));
  end if;
  return new;
end;
$$;

-- Aceite -> remove a solicitação do feed do convidado e avisa o dono.
create or replace function public.on_collaborator_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_title text;
begin
  if new.status = 'accepted' and old.status = 'pending' then
    select l.owner_id, l.title into v_owner, v_title from lists l where l.id = new.list_id;
    delete from activity
      where type = 'list_invite' and (metadata->>'collaborator_id')::uuid = new.id;
    if v_owner is not null and v_owner <> new.user_id then
      insert into activity (user_id, actor_id, type, list_id, metadata)
      values (v_owner, new.user_id, 'collaborator_added', new.list_id,
              jsonb_build_object('list_title', v_title));
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.on_collaborator_accepted() from anon, authenticated, public;

drop trigger if exists collaborators_notify_accept on public.collaborators;
create trigger collaborators_notify_accept
  after update on public.collaborators
  for each row execute function public.on_collaborator_accepted();

-- Push: novo caso list_invite; collaborator_added passa a ser do DONO.
create or replace function public.on_activity_push()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare
  v_body text;
  v_anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a2RodXFuZHpyeHFya21ldnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjI1NTMsImV4cCI6MjA5NzAzODU1M30._k12ArPeEGFIg7Y0VjXVhGrAZ6QFcpZUw8cHCMLp1M8';
  v_url text := 'https://uvkdhuqndzrxqrkmevtr.supabase.co/functions/v1/send-push';
begin
  if new.type = 'reservation' then
    v_body := 'Alguém reservou um presente da sua lista ' || coalesce(new.metadata->>'list_title', '');
  elsif new.type = 'list_invite' then
    v_body := 'Você foi convidado para a lista ' || coalesce(new.metadata->>'list_title', '');
  elsif new.type = 'collaborator_added' then
    v_body := 'Alguém entrou na sua lista ' || coalesce(new.metadata->>'list_title', '');
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
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_anon),
    body := jsonb_build_object('userId', new.user_id, 'title', 'Whisly', 'body', v_body, 'url', '/activity')
  );
  return new;
end;
$$;
