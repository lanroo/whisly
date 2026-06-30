-- ============================================================
-- Whisly — hardening: funções de trigger não devem ser expostas como RPC.
-- (advisor 0028/0029). Diferente das funções helper de RLS, estas só são
-- invocadas pelos próprios triggers, então revogar EXECUTE é seguro.
-- (aplicado no projeto Supabase via MCP)
-- ============================================================

revoke execute on function public.on_reservation_created() from anon, authenticated, public;
revoke execute on function public.on_collaborator_added() from anon, authenticated, public;
revoke execute on function public.on_item_added() from anon, authenticated, public;
revoke execute on function public.on_activity_push() from anon, authenticated, public;
