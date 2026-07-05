-- Responder a um convite de lista de forma confiável (aceitar/recusar).
-- Só o convidado (dono da linha) pode responder. SECURITY DEFINER contorna
-- a RLS de select/update de collaborators para o convidado pendente.
-- (aplicado no projeto Supabase via MCP)
create or replace function public.respond_list_invite(_collaborator uuid, _accept boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  _me uuid := auth.uid();
  _row collaborators%rowtype;
begin
  if _me is null then
    raise exception 'not authenticated';
  end if;

  select * into _row from collaborators where id = _collaborator;
  if not found then
    return 'gone';
  end if;
  if _row.user_id <> _me then
    raise exception 'not your invite';
  end if;

  if _accept then
    update collaborators set status = 'accepted' where id = _collaborator;
    return 'accepted';
  else
    delete from collaborators where id = _collaborator;
    return 'declined';
  end if;
end;
$$;

revoke execute on function public.respond_list_invite(uuid, boolean) from anon, public;
grant execute on function public.respond_list_invite(uuid, boolean) to authenticated;
