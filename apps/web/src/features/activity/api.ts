import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/auth';

export type ActivityType =
  | 'reservation'
  | 'collaborator_added'
  | 'item_added'
  | 'friend_request'
  | 'friend_accepted';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  listId: string | null;
  listTitle: string | null;
  itemTitle: string | null;
  actorId: string | null;
  actorName: string | null;
  friendshipId: string | null;
  read: boolean;
  createdAt: string;
}

interface ActivityRow {
  id: string;
  type: string;
  list_id: string | null;
  actor_id: string | null;
  metadata: { list_title?: string; item_title?: string; friendship_id?: string } | null;
  read: boolean;
  created_at: string;
}

async function fetchActivity(userId: string): Promise<ActivityEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('activity')
    .select('id, type, list_id, actor_id, metadata, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(60);

  if (error) throw error;
  const rows = (data ?? []) as ActivityRow[];

  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: profs } = await supabase.from('profiles').select('id, name').in('id', actorIds);
    for (const p of profs ?? []) names.set(p.id, p.name ?? 'Alguém');
  }

  return rows.map((r) => ({
    id: r.id,
    type: r.type as ActivityType,
    listId: r.list_id,
    listTitle: r.metadata?.list_title ?? null,
    itemTitle: r.metadata?.item_title ?? null,
    actorId: r.actor_id,
    actorName: r.actor_id ? names.get(r.actor_id) ?? 'Alguém' : null,
    friendshipId: r.metadata?.friendship_id ?? null,
    read: r.read,
    createdAt: r.created_at,
  }));
}

/** Feed de atividades do usuário logado. */
export function useActivity() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['activity', user?.id],
    queryFn: () => fetchActivity(user!.id),
    enabled: Boolean(user),
  });
}

/** Quantidade de atividades não lidas (badge do sino). */
export function useUnreadActivityCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['activity', 'unread', user?.id],
    queryFn: async () => {
      if (!supabase || !user) return 0;
      const { count, error } = await supabase
        .from('activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: Boolean(user),
  });
}

/** Marca todas as atividades como lidas. */
export function useMarkActivityRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!supabase || !user) return;
      const { error } = await supabase
        .from('activity')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activity'] }),
  });
}
