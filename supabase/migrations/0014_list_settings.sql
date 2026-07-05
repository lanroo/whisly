-- Configurações por lista (funcionais):
--  show_prices      -> exibir preço nos itens
--  show_priority    -> exibir selo de urgência nos itens
--  notify_new_items -> gerar atividade/push quando alguém adiciona item
-- (aplicado no projeto Supabase via MCP)
alter table public.lists
  add column if not exists show_prices boolean not null default true,
  add column if not exists show_priority boolean not null default true,
  add column if not exists notify_new_items boolean not null default true;

-- Gate: só notifica novos itens se a lista tiver notify_new_items = true.
create or replace function public.on_item_added()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid;
  v_title text;
  v_notify boolean;
  v_adder uuid := new.added_by;
  rec record;
begin
  select l.owner_id, l.title, l.notify_new_items
    into v_owner, v_title, v_notify
  from lists l where l.id = new.list_id;

  -- Notificações de novos itens desligadas para esta lista.
  if v_notify is not true then
    return new;
  end if;

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
