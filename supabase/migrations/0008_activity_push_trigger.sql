-- ============================================================
-- Whisly — auto-disparo de Web Push quando uma atividade é criada.
-- Trigger em activity chama a Edge Function send-push via pg_net (assíncrono).
-- A entrega só ocorre se os secrets VAPID estiverem configurados no projeto.
-- (aplicado no projeto Supabase via MCP)
-- ============================================================

create extension if not exists pg_net with schema extensions;

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
      'userId', new.user_id,
      'title', 'Whisly',
      'body', v_body,
      'url', '/activity'
    )
  );
  return new;
end;
$$;

create trigger activity_push
  after insert on public.activity
  for each row execute function public.on_activity_push();
