-- ============================================================
-- Whisly — @usuário desde o cadastro + login por @usuário ou e-mail
-- (aplicado no projeto Supabase via MCP)
-- ============================================================

-- Normaliza um handle igual ao cliente: minúsculo, sem @, só [a-z0-9_.]
create or replace function public.normalize_handle(_raw text)
returns text language sql immutable set search_path = public as $$
  select nullif(regexp_replace(lower(trim(coalesce(_raw, ''))), '[^a-z0-9_.]', '', 'g'), '');
$$;

-- Disponibilidade do @usuário (para validar no cadastro, antes de criar a conta)
create or replace function public.is_handle_available(_handle text)
returns boolean language sql security definer set search_path = public stable as $$
  select case
    when public.normalize_handle(_handle) is null then false
    else not exists (
      select 1 from profiles where handle = public.normalize_handle(_handle)
    )
  end;
$$;
revoke execute on function public.is_handle_available(text) from public;
grant execute on function public.is_handle_available(text) to anon, authenticated;

-- Resolve o e-mail a partir do @usuário (para permitir login por usuário)
create or replace function public.email_for_handle(_handle text)
returns text language sql security definer set search_path = public, auth stable as $$
  select u.email
  from profiles p
  join auth.users u on u.id = p.id
  where p.handle = public.normalize_handle(_handle)
  limit 1;
$$;
revoke execute on function public.email_for_handle(text) from public;
grant execute on function public.email_for_handle(text) to anon, authenticated;

-- Trigger de criação de perfil agora também grava o @usuário do cadastro.
-- Se (corrida rara) o handle já existir, cria sem handle em vez de quebrar o signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _name text := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  _handle text := public.normalize_handle(new.raw_user_meta_data->>'handle');
begin
  begin
    insert into public.profiles (id, name, handle) values (new.id, _name, _handle);
  exception when unique_violation then
    insert into public.profiles (id, name) values (new.id, _name);
  end;
  return new;
end;
$$;
