import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/auth';

export type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface Person {
  id: string;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
}

export interface FriendStatusInfo {
  status: FriendStatus;
  friendshipId: string | null;
}

export interface FriendshipRow {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
}

export interface FriendGraph {
  rows: FriendshipRow[];
  people: Record<string, Person>;
}

async function fetchFriendGraph(userId: string): Promise<FriendGraph> {
  if (!supabase) return { rows: [], people: {} };
  const { data, error } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, status')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows: FriendshipRow[] = (data ?? []).map((r) => ({
    id: r.id,
    requesterId: r.requester_id,
    addresseeId: r.addressee_id,
    status: r.status,
  }));

  const otherIds = [
    ...new Set(rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId))),
  ];

  const people: Record<string, Person> = {};
  if (otherIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, name, handle, avatar_url')
      .in('id', otherIds);
    for (const p of profs ?? []) {
      people[p.id] = { id: p.id, name: p.name ?? 'Usuário', handle: p.handle, avatarUrl: p.avatar_url };
    }
  }
  return { rows, people };
}

/** Grafo de amizades do usuário (todas as relações onde ele participa). */
export function useFriendGraph() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['friends', 'graph', user?.id],
    queryFn: () => fetchFriendGraph(user!.id),
    enabled: Boolean(user),
  });
}

/** Relação entre o usuário logado e outra pessoa, derivada do grafo. */
export function statusFromGraph(
  graph: FriendGraph | undefined,
  meId: string | undefined,
  otherId: string,
): FriendStatusInfo {
  if (!graph || !meId) return { status: 'none', friendshipId: null };
  const row = graph.rows.find(
    (r) =>
      (r.requesterId === meId && r.addresseeId === otherId) ||
      (r.requesterId === otherId && r.addresseeId === meId),
  );
  if (!row) return { status: 'none', friendshipId: null };
  if (row.status === 'accepted') return { status: 'friends', friendshipId: row.id };
  return {
    status: row.requesterId === meId ? 'pending_sent' : 'pending_received',
    friendshipId: row.id,
  };
}

/** Amigos aceitos (para a seção "Amigos"). */
export function friendsFromGraph(graph: FriendGraph | undefined, meId: string | undefined): Person[] {
  if (!graph || !meId) return [];
  return graph.rows
    .filter((r) => r.status === 'accepted')
    .map((r) => graph.people[r.requesterId === meId ? r.addresseeId : r.requesterId])
    .filter(Boolean);
}

/** Resultado de solicitar amizade (via RPC atômica). */
export type FriendRequestResult = 'pending' | 'accepted' | 'friends';

/**
 * Envia solicitação de amizade de forma idempotente (RPC no banco).
 * Nunca falha por duplicidade: se a outra pessoa já pediu, aceita
 * automaticamente; se já são amigos ou já foi enviada, é no-op.
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addresseeId: string): Promise<FriendRequestResult> => {
      if (!supabase) throw new Error('Supabase não configurado.');
      const { data, error } = await supabase.rpc('request_friendship', {
        _addressee: addresseeId,
      });
      if (error) throw error;
      return (data as FriendRequestResult) ?? 'pending';
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

/** Aceita (accept=true) ou recusa/cancela/desfaz (accept=false) uma relação. */
export function useRespondFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ friendshipId, accept }: { friendshipId: string; accept: boolean }) => {
      if (!supabase) throw new Error('Supabase não configurado.');
      if (accept) {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', friendshipId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

/**
 * Amigos aceitos de um usuário qualquer (via RPC list_friends).
 * Funciona tanto para o próprio usuário quanto para outras pessoas
 * (usado nos perfis para mostrar quantos e quem são os amigos).
 */
export function useFriendsOf(userId: string | undefined) {
  return useQuery({
    queryKey: ['friends', 'of', userId],
    queryFn: async (): Promise<Person[]> => {
      if (!supabase || !userId) return [];
      const { data, error } = await supabase.rpc('list_friends', { _user: userId });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        id: p.id,
        name: p.name ?? 'Usuário',
        handle: p.handle,
        avatarUrl: p.avatar_url,
      }));
    },
    enabled: Boolean(userId),
  });
}

/** Busca pessoas por nome/@usuário (para adicionar). */
export function useSearchPeople(term: string) {
  const { user } = useAuth();
  const q = term.trim();
  return useQuery({
    queryKey: ['people', 'search', q, user?.id],
    queryFn: async (): Promise<Person[]> => {
      if (!supabase || q.length < 2) return [];
      const clean = q.replace(/^@+/, '');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, handle, avatar_url')
        .or(`handle.ilike.%${clean}%,name.ilike.%${clean}%`)
        .neq('id', user!.id)
        .limit(20);
      if (error) throw error;
      return (data ?? []).map((p) => ({
        id: p.id,
        name: p.name ?? 'Usuário',
        handle: p.handle,
        avatarUrl: p.avatar_url,
      }));
    },
    enabled: Boolean(user) && q.trim().length >= 2,
  });
}
